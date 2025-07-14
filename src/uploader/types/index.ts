import type { UploadTypeConstant } from "../constants"

export interface UploadTask {
  url: string
}

export interface Credentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}

export type UploadType =
  (typeof UploadTypeConstant)[keyof typeof UploadTypeConstant]

export interface S3Config extends Credentials {
  bucket: string
  region: string
  endpoint: string
  path?: string
}

export interface QiniuConfig extends Credentials {
  bucket: string
  region: string
  path?: string
}

export type UploadConfig = (S3Config | QiniuConfig) & {
  name: string
  type: UploadType
}
