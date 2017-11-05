import * as localForage from 'localforage'

export default class MockForageDriver implements LocalForageDriver {
  private _store: {
    [index: number]: string
    [x: string]: any
  }
  public _driver: string
  public _support: boolean

  constructor () {
    this._driver = 'mockforage'
    this._support = true
  }
  public _initStorage(options: LocalForageOptions): void {
  }

  getItem<T>(key: string): Promise<T> {
    return Promise.resolve(this._store[key])
  }


  setItem(key: string, value: any): Promise<void> {
    this._store[key] = value.toString()
    return Promise.resolve()
  }

  removeItem(key: string): Promise<void> {
    delete this._store[key]
    return Promise.resolve()
  }

  clear(): Promise<void> {
    for (const key of Object.keys(this._store)) {
      delete this._store[key]
    }
    return Promise.resolve()
  }

  length(): Promise<number> {
    return Promise.resolve(Object.keys(this._store).length)
  }

  key(keyIndex: number): Promise<string> {
    return Promise.resolve(Object.keys(this._store)[keyIndex])
  }

  keys(): Promise<string[]>  {
    return Promise.resolve(Object.keys(this._store))
  }

  iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U[]> {
    return Promise.all(Object.keys(this._store).map((key, index, store)=>
      Promise.resolve(iteratee(this._store[key], key, index))
    ))
  }

}