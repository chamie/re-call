import { ReCallOptions } from "./types";
import { parseRestParams, shallowEqual } from "./utils";
import deepEqual from "fast-deep-equal";

const defaultOptions: ReCallOptions = {
    this: undefined,
    thisArg: undefined,
    comparator: Object.is,
};

let cache = new WeakMap<Function, { result: any; params: any; thisArg: any }>();

const _reCall = <T extends (...args: any[]) => any>(
    fn: T,
    /** Parameters to pass to the function */
    params: Parameters<T>,
    /** Additional options to customize the behavior */
    options: Partial<ReCallOptions<Parameters<T>>>
): ReturnType<T> => {
    const { this: thisContext, thisArg, comparator } = { ...defaultOptions, ...options };
    /** The context to invoke the function with. Priority: options.this > options.thisArg > globalThis */
    const thisValue = thisContext || thisArg || globalThis;
    const cacheData = cache.get(fn);
    if (cacheData && comparator(cacheData.params, params) && cacheData.thisArg === thisValue) {
        return cacheData.result;
    }

    const result = fn.apply(thisValue, params);
    cache.set(fn, { result, params, thisArg: thisValue });
    return result;
}

/**
 * Memoize a function with no parameters
 */
export function byRef<T extends () => any>(
    fn: T,
    options?: Partial<ReCallOptions<[]>>
): ReturnType<T>;

/**
 * Memoize a function with parameters
 * @param fn - The function to memoize
 * @param params - The parameters to pass to the function
 * @param options - Memoization options
 */
export function byRef<T extends (...args: any[]) => any>(
    fn: T,
    params: Parameters<T>,
    options?: Partial<ReCallOptions<Parameters<T>>>
): ReturnType<T>;


export function byRef(fn: any, ...rest: any[]): any {
    const { params, options } = parseRestParams(fn, rest);
    return _reCall(fn, params, options);
};

/**
 * Memoize a function with no parameters, using shallow equality for comparison
 */
export function shallow<T extends () => any>(
    fn: T,
    options?: Partial<ReCallOptions<[]>>
): ReturnType<T>;

/**
 * Memoize a function with parameters using shallow equality for comparison
 * @param fn - The function to memoize
 * @param params - The parameters to pass to the function
 * @param options - Memoization options
 */
export function shallow<T extends (...args: any[]) => any>(
    fn: T,
    params: Parameters<T>,
    options?: Partial<ReCallOptions<Parameters<T>>>
): ReturnType<T>;

export function shallow(fn: any, ...rest: any[]): any {
    const { params, options } = parseRestParams(fn, rest);
    return _reCall(fn, params, { ...options, comparator: shallowEqual });
};


/**
 * Memoize a function with no parameters, using deep equality for comparison
 */
export function deep<T extends () => any>(
    fn: T,
    options?: Partial<ReCallOptions<[]>>
): ReturnType<T>;

/**
 * Memoize a function with parameters using deep equality for comparison
 * @param fn - The function to memoize
 * @param params - The parameters to pass to the function
 * @param options - Memoization options
 */
export function deep<T extends (...args: any[]) => any>(
    fn: T,
    params: Parameters<T>,
    options?: Partial<ReCallOptions<Parameters<T>>>
): ReturnType<T>;

export function deep(fn: any, ...rest: any[]): any {
    const { params, options } = parseRestParams(fn, rest);
    return _reCall(fn, params, { ...options, comparator: deepEqual });
};


// Wrappers:

export const wrap = <T extends (...args: any[]) => any>(
    fn: T,
    options?: Partial<ReCallOptions<Parameters<T>>>
): T => 
    ((...params: Parameters<T>) => _reCall(fn, params, options ?? {})) as T;

// Variants
export const wrapShallow = <T extends (...args: any[]) => any>(fn: T): T => 
    ((...params: Parameters<T>) => _reCall(fn, params, { comparator: shallowEqual })) as T;

export const wrapDeep = <T extends (...args: any[]) => any>(fn: T): T => 
    ((...params: Parameters<T>) => _reCall(fn, params, { comparator: deepEqual })) as T;


/**
 * Clears the cache for a specific function.
 * @param fn Function, for which the cache record should be removed
 */
export const clearOne = (fn: Function) => {
    cache.delete(fn);
};

export const peek = (fn: Function) => {
    const cacheData = cache.get(fn);
    return cacheData ? cacheData.result : undefined;
};

export const hasCache = (fn: Function) => cache.has(fn);

export const clearAll = () => {
    cache = new WeakMap<Function, { result: any; params: any; thisArg: any }>();
};

export default shallow;