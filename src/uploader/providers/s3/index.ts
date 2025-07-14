import type { S3Config } from "@/uploader/types"
import { S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"

import { ProviderBase } from "../base"

export class S3Provider extends ProviderBase {
  constructor(private readonly config: S3Config) {
    super()
  }

  async upload(file: File) {
    const Client = new S3Client({
      endpoint: this.config.endpoint,
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
        sessionToken: this.config.sessionToken
      }
    })

    const abort = new AbortController()

    const dir = this.config.path
      ? `${this.config.path}${this.config.path.endsWith("/") ? "" : "/"}${file.name}`
      : file.name

    const upload = new Upload({
      client: Client,
      abortController: abort,
      params: {
        Bucket: this.config.bucket,
        Key: dir,
        Body: file as File
      }
    })

    // upload.on("httpUploadProgress", (progress) => {
    //   this.emit("progress", progress)
    // })

    const result = await upload.done()

    return {
      url: result.Location
    }
  }

  pause() {}

  resume() {}

  cancel() {}
}
