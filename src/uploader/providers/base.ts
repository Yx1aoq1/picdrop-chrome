import { EventEmitter } from "events"
import { type IProvider } from "@uploader/interface"
import type { Progress, UploadState, UploadTask } from "@uploader/types"

export abstract class ProviderBase extends EventEmitter implements IProvider {
  status: UploadState
  abstract upload(file: File): Promise<UploadTask>
  abstract pause(): void
  abstract resume(): void
  abstract cancel(): void

  public on(event: "progress", listener: (progress: Progress) => void): this {
    return super.on(event, listener)
  }
}
