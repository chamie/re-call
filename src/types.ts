export type ReCallOptions<T = unknown> = {
    /**
     * The context to invoke the function with. Defaults to the global context (window in browsers). Same as `thisArg`
     */
    this: any;
    /**
     * The context to invoke the function with. Defaults to the global context (window in browsers). Same as `this`
     */
    thisArg: any;
    /**
     * Compare two sets of parameters (or lack thereof) to determine if the function should be re-invoked
     * @param prev first entity
     * @param next second entity
     * @returns true if considered equal
     */
    comparator: (prev: T, next: T) => boolean;
}