export default class MockForageDriver implements LocalForageDriver {
    private _store;
    _driver: string;
    _initStorage(options: LocalForageOptions): void;
    getItem<T>(key: string): Promise<T>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    length(): Promise<number>;
    key(keyIndex: number): Promise<string>;
    keys(): Promise<string[]>;
    iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U[]>;
}
