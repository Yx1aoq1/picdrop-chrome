import { S3Provider } from "./providers"

export * from "./types"
export * from "./constants"
export * from "./interface"

export interface UploadOptions {
  provider: S3Provider
}

class Uploader {
  private provider: S3Provider

  constructor(config: UploadOptions) {
    this.provider = config.provider
  }

  async upload(file: File) {
    return this.provider.upload(file)
  }
}

export function createUploader(config: UploadOptions) {
  return new Uploader(config)
}

export { S3Provider }
