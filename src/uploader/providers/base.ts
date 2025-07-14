import { EventEmitter } from "events"

import { type IProvider } from "../interface"
import type { UploadTask } from "../types"

export abstract class ProviderBase extends EventEmitter implements IProvider {
  abstract upload(file: File): Promise<UploadTask>
  abstract pause(): void
  abstract resume(): void
  abstract cancel(): void
}
