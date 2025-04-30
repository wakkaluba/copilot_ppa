export interface Disposable {
    dispose(): void;
}
export declare class DisposableStore implements Disposable {
    private _toDispose;
    add(disposable: Disposable): Disposable;
    dispose(): void;
}
