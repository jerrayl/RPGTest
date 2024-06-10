export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function pick(arr: number[]): number {
    if (arr.length === 0) {
        throw Error("Array has no values");
    }
    return arr[Math.floor(Math.random() * arr.length)];
}