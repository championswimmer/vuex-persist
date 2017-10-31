export default class SimplePromiseQueue {
    private readonly _queue;
    private _flushing;
    enqueue(promise: Promise<void>): Promise<void>;
    private flushQueue();
}
