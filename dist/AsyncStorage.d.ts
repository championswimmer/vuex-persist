export interface AsyncStorage {
    _config?: {
        name: string;
    };
    getItem<T>(key: string): Promise<T>;
    setItem<T>(key: string, data: T, mutation: string): Promise<T>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    length(): Promise<number>;
    key(keyIndex: number): Promise<string>;
}
