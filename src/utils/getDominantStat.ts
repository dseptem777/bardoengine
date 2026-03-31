/**
 * Returns the key of the stat with the highest value.
 * Tie-break: first key in iteration order (Object.entries).
 * Returns null if stats is empty.
 */
export function getDominantStat(stats: Record<string, number>): string | null {
    const entries = Object.entries(stats)
    if (entries.length === 0) return null

    let maxKey = entries[0][0]
    let maxVal = entries[0][1]

    for (let i = 1; i < entries.length; i++) {
        if (entries[i][1] > maxVal) {
            maxKey = entries[i][0]
            maxVal = entries[i][1]
        }
    }

    return maxKey
}
