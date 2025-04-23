export interface Disposable {
    dispose(): void;
}

export class DisposableStore implements Disposable {
    private _toDispose = new Set<Disposable>();

    add(disposable: Disposable): Disposable {
        this._toDispose.add(disposable);
        return disposable;
    }

    dispose(): void {
        this._toDispose.forEach(d => d.dispose());
        this._toDispose.clear();
    }
}