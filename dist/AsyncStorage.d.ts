export interface AsyncStorage {
    getItem<T>(key: string): Promise<T>;
    setItem<T>(key: string, data: T): Promise<T>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    length(): Promise<number>;
    key(keyIndex: number): Promise<string>;
    _config?: {
        name: string;
    };
}
