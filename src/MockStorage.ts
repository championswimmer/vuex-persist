/**
 * Created by championswimmer on 22/07/17.
 */
export default class MockStorage implements Storage {
  [index: number]: string;
  [key: string]: any;

  public get length(): number {
    return Object.keys(this).length
  }

  public key(index: number): string | any {
    return Object.keys(this)[index]
  }

  public setItem(key: string, data: any, mutation?: string): void {
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
