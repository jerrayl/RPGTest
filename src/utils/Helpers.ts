export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function pick(arr: number[]): number {
    if (arr.length === 0) {
        throw Error("Array has no values");
    }
    return arr[Math.floor(Math.random() * arr.length)];
}

export function testChance(x: number): boolean {
    return Math.random() < x;
}

export function sum(arr: number[]): number{
    return arr.reduce((partialSum, a) => partialSum + (a ?? 0), 0);
}

export function flattenNumberMap(map: {[key: number]: number}): number[] {
    let result: number[] = [];
    Object.keys(map).forEach(x => result = result.concat(Array(map[x as any as number] ?? 0).fill(x)))
    return result;
}