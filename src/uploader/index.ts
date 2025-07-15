import { DEFAULT_MAX_CONCURRENCY, UploadTypeConstant } from "./constants"
import { ProviderBase, S3Provider } from "./providers"
import type {
  Progress,
  QiniuConfig,
  S3Config,
  UploadConfig,
  UploadTask
} from "./types"

export * from "./types"
export * from "./constants"
export * from "./interface"

export interface UploadOptions {
  config: UploadConfig
  maxConcurrency?: number
  onProgress?: (progress: Progress) => void
  onSuccess?: (result: UploadTask) => void
  onError?: (error: Error) => void
}

interface QueueTask {
  id: number
  provider: ProviderBase
  file: File
  resolve: (value: UploadTask) => void
  reject: (reason?: any) => void
  startTime?: number
  isPaused?: boolean
}

class Queen {
  private queueId = 0
  private waitingQueue: Map<number, QueueTask> = new Map() // 等待队列
  private runningQueue: Map<number, QueueTask> = new Map() // 运行队列
  private completedTasks: UploadTask[] = [] // 已完成任务

  constructor(readonly maxConcurrency: number) {}

  /**
   * 添加上传任务到队列
   * @param provider 上传提供者
   * @param file 要上传的文件
   * @returns UploadTaskWithId
   */
  add(
    provider: ProviderBase,
    file: File
  ): {
    taskId: number
    start: () => Promise<UploadTask>
  } {
    const taskId = this.queueId++
    const start = () =>
      new Promise<UploadTask>((resolve, reject) => {
        const task: QueueTask = {
          id: taskId,
          provider,
          file,
          resolve,
          reject,
          isPaused: false
        }

        this.waitingQueue.set(taskId, task)
        this.schedule()
      })

    return {
      taskId,
      start
    }
  }

  /**
   * 任务调度器 - 控制并发数量
   */
  private schedule() {
    // 如果运行队列已满，不启动新任务
    if (this.runningQueue.size >= this.maxConcurrency) {
      return
    }

    // 找到第一个未暂停的任务
    let taskId = -1
    for (const [id, task] of this.waitingQueue) {
      if (!task.isPaused) {
        taskId = id
        break
      }
    }

    // 如果没有找到未暂停的任务，退出
    if (taskId === -1) {
      return
    }

    // 从等待队列移动到运行队列
    const task = this.waitingQueue.get(taskId)!
    this.waitingQueue.delete(taskId)
    this.runningQueue.set(taskId, task)

    this.executeTask(task)
  }

  /**
   * 执行单个任务
   * @param task 要执行的任务
   */
  private async executeTask(task: QueueTask) {
    try {
      task.startTime = Date.now()

      // 执行上传任务
      const result = await task.provider.upload(task.file)

      // 任务完成
      this.completedTasks.push(result)
      task.resolve(result)
    } catch (error) {
      // 任务失败
      task.reject(error)
    } finally {
      // 从运行队列中移除
      this.runningQueue.delete(task.id)

      // 尝试启动下一个任务
      this.schedule()
    }
  }

  /**
   * 取消指定任务
   * @param taskId 任务ID
   */
  cancel(taskId: number) {
    // 如果任务在等待队列中
    if (this.waitingQueue.has(taskId)) {
      const task = this.waitingQueue.get(taskId)!
      this.waitingQueue.delete(taskId)
      task.reject(new Error("Task cancelled"))
      return true
    }

    // 如果任务在运行队列中
    if (this.runningQueue.has(taskId)) {
      const task = this.runningQueue.get(taskId)!
      this.runningQueue.delete(taskId)

      // 尝试取消provider的上传
      task.provider.cancel()

      task.reject(new Error("Task cancelled"))
      this.schedule() // 启动下一个任务
      return true
    }

    return false
  }

  /**
   * 暂停指定任务
   * @param taskId 任务ID
   * @returns 是否成功暂停
   */
  pause(taskId: number): boolean {
    // 如果任务在等待队列中
    if (this.waitingQueue.has(taskId)) {
      const task = this.waitingQueue.get(taskId)!
      task.isPaused = true
      return true
    }

    // 如果任务在运行队列中
    if (this.runningQueue.has(taskId)) {
      const task = this.runningQueue.get(taskId)!
      task.isPaused = true

      // 尝试暂停provider的上传
      task.provider.pause()

      return true
    }

    return false
  }

  /**
   * 恢复指定任务
   * @param taskId 任务ID
   * @returns 是否成功恢复
   */
  resume(taskId: number): boolean {
    // 如果任务在等待队列中
    if (this.waitingQueue.has(taskId)) {
      const task = this.waitingQueue.get(taskId)!
      if (task.isPaused) {
        task.isPaused = false
        this.schedule() // 重新调度
        return true
      }
    }

    // 如果任务在运行队列中
    if (this.runningQueue.has(taskId)) {
      const task = this.runningQueue.get(taskId)!
      if (task.isPaused) {
        task.isPaused = false

        // 尝试恢复provider的上传
        task.provider.resume()

        return true
      }
    }

    return false
  }

  /**
   * 暂停所有任务
   */
  pauseAll() {
    // 暂停所有等待的任务
    this.waitingQueue.forEach((task) => {
      task.isPaused = true
    })

    // 暂停所有运行的任务
    this.runningQueue.forEach((task) => {
      task.isPaused = true
      task.provider.pause()
    })
  }

  /**
   * 恢复所有任务
   */
  resumeAll() {
    // 恢复所有等待的任务
    this.waitingQueue.forEach((task) => {
      task.isPaused = false
    })

    // 恢复所有运行的任务
    this.runningQueue.forEach((task) => {
      task.isPaused = false
      task.provider.resume()
    })

    // 重新调度等待的任务
    this.schedule()
  }

  /**
   * 清空所有队列
   */
  clear() {
    // 取消所有等待的任务
    this.waitingQueue.forEach((task) => {
      task.reject(new Error("Queue cleared"))
    })

    // 取消所有运行的任务
    this.runningQueue.forEach((task) => {
      task.provider.cancel()
      task.reject(new Error("Queue cleared"))
    })

    this.waitingQueue.clear()
    this.runningQueue.clear()
    this.completedTasks = []
  }
}

class Uploader {
  private config: UploadConfig
  private queue: Queen

  constructor(readonly options: UploadOptions) {
    this.config = options.config
    this.queue = new Queen(options.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY)
  }

  upload(file: File) {
    let provider: ProviderBase
    switch (this.config.type) {
      case UploadTypeConstant.AWS:
        provider = new S3Provider(this.config as S3Config)
        break
      case UploadTypeConstant.QINIU:
        // provider = new QiniuProvider(this.config as QiniuConfig)
        throw new Error("Qiniu provider not implemented yet")
      default:
        throw new Error(`Unsupported upload type: ${this.config.type}`)
    }

    const { taskId, start } = this.queue.add(provider, file)

    provider.on("progress", (progress) => {
      this.options.onProgress?.(progress)
    })

    start()
      .then((result) => {
        this.options.onSuccess?.(result)
      })
      .catch((error) => {
        this.options.onError?.(error)
      })

    return taskId
  }

  cancel(taskId?: number) {
    return taskId ? this.queue.cancel(taskId) : this.queue.clear()
  }

  pause(taskId?: number) {
    return taskId ? this.queue.pause(taskId) : this.queue.pauseAll()
  }

  resume(taskId?: number) {
    return taskId ? this.queue.resume(taskId) : this.queue.resumeAll()
  }
}

export function createUploader(config: UploadOptions) {
  return new Uploader(config)
}
