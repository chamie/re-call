type ReCallOptions<T = unknown> = {
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
};

/**
 * Memoize a function with no parameters
 */
declare function byRef<T extends () => any>(fn: T, options?: Partial<ReCallOptions<[]>>): ReturnType<T>;
/**
 * Memoize a function with parameters
 * @param fn - The function to memoize
 * @param params - The parameters to pass to the function
 * @param options - Memoization options
 */
declare function byRef<T extends (...args: any[]) => any>(fn: T, params: Parameters<T>, options?: Partial<ReCallOptions<Parameters<T>>>): ReturnType<T>;
/**
 * Memoize a function with no parameters, using shallow equality for comparison
 */
declare function shallow<T extends () => any>(fn: T, options?: Partial<ReCallOptions<[]>>): ReturnType<T>;
/**
 * Memoize a function with parameters using shallow equality for comparison
 * @param fn - The function to memoize
 * @param params - The parameters to pass to the function
 * @param options - Memoization options
 */
declare function shallow<T extends (...args: any[]) => any>(fn: T, params: Parameters<T>, options?: Partial<ReCallOptions<Parameters<T>>>): ReturnType<T>;
/**
 * Memoize a function with no parameters, using deep equality for comparison
 */
declare function deep<T extends () => any>(fn: T, options?: Partial<ReCallOptions<[]>>): ReturnType<T>;
/**
 * Memoize a function with parameters using deep equality for comparison
 * @param fn - The function to memoize
 * @param params - The parameters to pass to the function
 * @param options - Memoization options
 */
declare function deep<T extends (...args: any[]) => any>(fn: T, params: Parameters<T>, options?: Partial<ReCallOptions<Parameters<T>>>): ReturnType<T>;
declare const wrap: <T extends (...args: any[]) => any>(fn: T, options?: Partial<ReCallOptions<Parameters<T>>>) => T;
declare const wrapShallow: <T extends (...args: any[]) => any>(fn: T) => T;
declare const wrapDeep: <T extends (...args: any[]) => any>(fn: T) => T;
/**
 * Clears the cache for a specific function.
 * @param fn Function, for which the cache record should be removed
 */
declare const clearOne: (fn: Function) => void;
declare const peek: (fn: Function) => any;
declare const hasCache: (fn: Function) => boolean;
declare const clearAll: () => void;

export { byRef, clearAll, clearOne, deep, shallow as default, hasCache, peek, shallow, wrap, wrapDeep, wrapShallow };
