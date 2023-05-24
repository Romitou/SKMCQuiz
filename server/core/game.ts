export function getTimeLeft(startedAt: number): number {
    return 60 - Math.floor((Date.now() - startedAt) / 1000);
}
