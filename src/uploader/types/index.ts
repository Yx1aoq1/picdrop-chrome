import type {
  UploadStateConstant,
  UploadTypeConstant
} from "@uploader/constants"

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

export type UploadState =
  (typeof UploadStateConstant)[keyof typeof UploadStateConstant]

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

export interface Progress {
  taskId?: number
  loaded?: number
  total?: number
  part?: number
}
