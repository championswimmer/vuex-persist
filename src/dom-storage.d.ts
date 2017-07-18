/**
 * Created by championswimmer on 19/07/17.
 */

declare interface DomStorageOptions {
  strict: boolean,
  ws?: string
}

declare class DomStorage extends Storage {
  constructor(
    fileName: string | null,
    options: DomStorageOptions
  )
}

declare module 'dom-storage' {
  export = DomStorage
}
