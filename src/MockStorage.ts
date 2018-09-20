/**
 * Created by championswimmer on 22/07/17.
 */
let MockStorage: typeof Storage | undefined

// @ts-ignore
if (process.env.MODULE_FORMAT !== 'umd') {
  MockStorage = class implements Storage {
    [index: number]: string;
    [key: string]: any;

    public get length(): number {
      return Object.keys(this).length
    }

    public key(index: number): string | any {
      return Object.keys(this)[index]
    }

    public setItem(key: string, data: any): void {
      this[key] = data.toString()
    }
    public getItem(key: string): string {
      return this[key]
    }
    public removeItem(key: string): void {
      delete this[key]
    }
    public clear(): void {
      for (const key of Object.keys(this)) {
        delete this[key]
      }
    }
  }
}

export { MockStorage }
