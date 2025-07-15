export const UploadTypeConstant = {
  AWS: "aws",
  QINIU: "qiniu"
} as const

export const UploadStateConstant = {
  NONE: "none",
  PENDING: "pending",
  UPLOADING: "uploading",
  PAUSED: "paused",
  COMPLETED: "completed",
  FAILED: "failed"
} as const

export const UploadTypeOptions = [
  { label: "AWS S3", value: UploadTypeConstant.AWS },
  { label: "七牛云存储", value: UploadTypeConstant.QINIU }
]

export const DEFAULT_MAX_CONCURRENCY = 6
