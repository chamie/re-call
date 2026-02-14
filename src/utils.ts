export const shallowEqual = <T>(prev: T, next: T): boolean => {
    if (prev === next) return true;
    if (typeof prev !== 'object' || typeof next !== 'object' || prev === null || next === null) {
        return false;
    }
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    if (prevKeys.length !== nextKeys.length) return false;
    for (const key of prevKeys) {
        if (!Object.prototype.hasOwnProperty.call(next, key) || (prev as Record<string, any>)[key] !== (next as Record<string, any>)[key]) {
            return false;
        }
    }
    return true;
};

export const parseRestParams = (fn: Function, rest: any[]) => {
    const [paramsOrOptions, maybeOptions] = rest;
    
    if (fn.length === 0) {
        return { params: [], options: paramsOrOptions ?? {} };
    }
    return { params: paramsOrOptions ?? [], options: maybeOptions ?? {} };
};