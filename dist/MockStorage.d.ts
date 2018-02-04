/**
 * Created by championswimmer on 22/07/17.
 */
export default class MockStorage implements Storage {
    [index: number]: string;
    [key: string]: any;
    readonly length: number;
    key(index: number): string | any;
    setItem(key: string, data: any): void;
    getItem(key: string): string;
    removeItem(key: string): void;
    clear(): void;
}
