import type { UploadTask } from "@uploader/types"

export interface IProvider {
  upload: (file: File) => Promise<UploadTask>
  pause: () => void
  resume: () => void
  cancel: () => void
}

export interface IUploader {
  provider: IProvider
}
