// tslint:disable: variable-name
export default class SimplePromiseQueue {
  private readonly _queue: Array<() => Promise<void>> = []
  private _flushing = false

  public enqueue(task: () => Promise<void>) {
    this._queue.push(task)
    if (!this._flushing) { return this.flushQueue() }
    return Promise.resolve()
  }

  private flushQueue() {
    this._flushing = true

    const chain = (): Promise<void> | void => {
      const nextTask = this._queue.shift()
      if (nextTask) {
        return nextTask().then(chain)
      } else {
        this._flushing = false
      }
    }
    return Promise.resolve(chain())
  }
}
