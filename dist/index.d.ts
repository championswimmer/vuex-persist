/**
 * Created by championswimmer on 18/07/17.
 */
import { Payload, Plugin, Store } from 'vuex';
export interface PersistOptions<S> {
    restoreState?: (key: string, storage?: Storage) => S;
    saveState?: (key: string, state: {}, storage?: Storage) => void;
    storage?: Storage;
    reducer?: (state: S) => {};
    key?: string;
    filter?: (mutation: Payload) => boolean;
}
export declare class DefaultOptions<S> implements PersistOptions<S> {
    storage: Storage;
    key: string;
    restoreState: (key: string) => any;
    saveState: (key: string, state: {}) => void;
    reducer: (state: S) => S;
    filter: (mutation: Payload) => boolean;
}
export declare class VuexPersistence<S, P extends Payload> implements PersistOptions<S> {
    restoreState: (key: string, storage?: Storage) => S;
    saveState: (key: string, state: {}, storage?: Storage) => void;
    storage: Storage;
    reducer: (state: S) => {};
    key: string;
    filter: (mutation: Payload) => boolean;
    subscriber: (store: Store<S>) => (handler: (mutation: P, state: S) => any) => () => void;
    plugin: Plugin<S>;
    constructor(options: PersistOptions<S>);
}
