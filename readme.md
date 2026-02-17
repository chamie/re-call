# @chamie/re-call

A tiny library that memoizes **invocations**, not functions — so you can memoize calls to functions you don't own.

Works similarly to React's `useMemo`, but for any JavaScript/TypeScript function, anywhere in your code.

## Why re-call?

Traditional memoization wraps a function to cache its results. But what if you don't own the function? What if it's from a library, or you need different caching strategies for different call sites?

**re-call** memoizes the *invocation* itself, not the function. This means you can:

- ✅ Memoize third-party functions without wrapping them
- ✅ Use different caching strategies for the same function in different places
- ✅ Cache method calls with proper `this` context
- ✅ Choose between reference equality, shallow equality, or deep equality comparison

## Installation

```bash
npm install @chamie/re-call
```

## Quick Start

```typescript
import reCall from '@chamie/re-call';

const expensiveCalculation = (a: number, b: number) => {
    console.log('Computing...');
    return a + b;
}

reCall(expensiveCalculation, [1, 2]); // Logs: "Computing...", returns 3
reCall(expensiveCalculation, [1, 2]); // Returns 3 (from cache, no log)
reCall(expensiveCalculation, [2, 3]); // Logs: "Computing...", returns 5
```

## API

### Memoization Functions

#### `shallow(fn, params?, options?)` (default export)

Caches based on **shallow equality**. Compares array length and each element with `===`.

```typescript
import { shallow } from '@chamie/re-call';
// or
import shallow from '@chamie/re-call';

shallow(testFn, [1, 2]); // Function executed
shallow(testFn, [1, 2]); // Result from cache ✓
shallow(testFn, [2, 3]); // Function executed

shallow(testFn, [1, [1, 2]]); // Function executed
shallow(testFn, [1, [1, 2]]); // Function executed (nested array is different reference)
```

#### `byRef(fn, params?, options?)`

Caches based on **reference equality** (`Object.is`). Only returns cached result if the *exact same* parameter array is passed.

```typescript
import { byRef } from '@chamie/re-call';

const testFn = (a: number, b: number) => {
    console.log('Function executed');
    return `${a} + ${b}`;
}

byRef(testFn, [1, 2]); // Function executed
byRef(testFn, [1, 2]); // Function executed (new array reference)

const array = [1, 2];
byRef(testFn, array); // Function executed
byRef(testFn, array); // Result from cache ✓
```

#### `deep(fn, params?, options?)`

Caches based on **deep equality**. Recursively compares nested objects and arrays.

```typescript
import { deep } from '@chamie/re-call';

deep(testFn, [1, 2]); // Function executed
deep(testFn, [1, 2]); // Result from cache ✓

deep(testFn, [1, [1, 2]]); // Function executed
deep(testFn, [1, [1, 2]]); // Result from cache ✓ (deep equality works!)
```

### Functions with No Parameters

All memoization functions support zero-parameter functions:

```typescript
const getData = () => {
    console.log('Fetching data...');
    return fetch('/api/data');
}

deep(getData); // Fetching data...
deep(getData); // Result from cache ✓
```

### Custom Comparator

Use a custom comparison function for fine-grained control:

```typescript
import { byRef } from '@chamie/re-call';

const comparator = (a, b) => a[0].id === b[0].id;

byRef(testFn, [{ id: 1, name: 'Alice' }], { comparator });
byRef(testFn, [{ id: 1, name: 'Bob' }], { comparator }); // Cache hit! (same id)
```

### Context Binding (`this`)

Memoize method calls with proper context:

```typescript
class DataFetcher {
    apiKey: string;
    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    
    fetchData(endpoint: string) {
        console.log(`Fetching from ${endpoint} with key ${this.apiKey}`);
        return fetch(`https://api.example.com/${endpoint}`, {
            headers: { 'Authorization': this.apiKey }
        });
    }
    
    onClick() {
        // Memoize with proper 'this' context
        shallow(this.fetchData, ['/users'], { this: this });
    }
}
```

### Wrapper Functions

Create memoized versions of functions:

```typescript
import { wrap, wrapShallow, wrapDeep } from '@chamie/re-call';

const memoizedFn = wrapShallow(expensiveCalculation);

memoizedFn(1, 2); // Computing...
memoizedFn(1, 2); // Cached ✓
```

### Cache Utilities

#### `hasCache(fn)`

Check if a function has cached results:

```typescript
import { hasCache } from '@chamie/re-call';

shallow(testFn, [1, 2]);
hasCache(testFn); // true
```

#### `peek(fn)`

Get the cached result without invoking the function:

```typescript
import { peek } from '@chamie/re-call';

shallow(testFn, [1, 2]); // "1 + 2"
peek(testFn); // "1 + 2"
```

#### `clearOne(fn)`

Clear the cache for a specific function:

```typescript
import { clearOne } from '@chamie/re-call';

shallow(testFn, [1, 2]);
hasCache(testFn); // true
clearOne(testFn);
hasCache(testFn); // false
peek(testFn); // undefined
```

#### `clearAll()`

Clear all cached results:

```typescript
import { clearAll } from '@chamie/re-call';

clearAll(); // Clears everything
```

## Real-World Examples

### Preventing Duplicate File Uploads

```typescript
import { shallow } from '@chamie/re-call';

const uploadFile = (file: Blob, upload: (file: Blob) => string) => {
    if (!confirm(`Uploading file!`)) return;
    // Only upload if this exact file hasn't been uploaded yet
    const serverId = shallow(upload, [file]);
    return serverId;
}
```

### Memoizing API Calls

```typescript
import reCall from '@chamie/re-call';

const fetchUser = (userId: string) => {
    console.log(`Fetching user ${userId}...`);
    return fetch(`/api/users/${userId}`).then(r => r.json());
}

// In your React component or elsewhere
const user = await reCall(fetchUser, [userId]);
// Subsequent calls with same userId return cached data
```

### Event Handler Optimization

```typescript
button.addEventListener('click', () => {
    // Won't refetch if already cached
    shallow(dataFetcher.fetchData, ['/users'], { this: dataFetcher });
});
```

## Memory Management

**re-call** uses `WeakMap` internally, making it **garbage-collection friendly**:

- ✅ When a function is no longer referenced, its cache is automatically cleaned up
- ✅ No memory leaks from cached results
- ✅ Safe to use with temporary functions, closures, and dynamic code
- ✅ No manual cleanup required (though `clearOne` and `clearAll` are available if needed)

This means you can safely memoize functions without worrying about memory accumulation:

```typescript
// These caches will be garbage collected when the functions are no longer referenced
[1, 2, 3].forEach(n => {
    const fn = () => expensiveCalc(n);
    deep(fn); // Safe! Cache will be GC'd with the function
});
```

## Comparison with React's useMemo

If you're familiar with React's `useMemo`, **re-call** works similarly but without React:

```typescript
// React
const result = useMemo(() => expensiveCalc(a, b), [a, b]);

// re-call
const result = shallow(expensiveCalc, [a, b]);
```

**Key differences:**
- ✅ Works anywhere, not just in React components
- ✅ Can memoize functions you don't own
- ✅ Choose comparison strategy per call site
- ✅ Persistent cache across renders (not tied to component lifecycle)

## TypeScript Support

Fully typed with TypeScript! All functions preserve parameter and return types:

```typescript
const add = (a: number, b: number): number => a + b;

const result = shallow(add, [1, 2]); // result: number
// shallow(add, ["1", "2"]); // ❌ Type error!
```

## License

MIT

## Repository


https://github.com/chamie/re-call
