import { useState, useCallback, useMemo } from 'react'

export interface ExclusionRule {
    target: string;
    burns: string[];
}

export interface HubConfig {
    id: string; // knot_id of the hub
    options: ExclusionRule[];
}

// Map format for faster lookups: { hubId: { targetKnot: [burnedKnots] } }
export type HubsLookup = Record<string, Record<string, string[]>>;

export interface UseHubsReturn {
    burnedKnots: string[];
    isBurned: (knotId: string) => boolean;
    handleChoice: (hubId: string, targetKnot: string) => void;
    resetHubs: () => void;
    loadHubsState: (savedBurned: string[]) => void;
    exportHubsState: () => string[];
}

export function useHubs(hubsList: HubConfig[] = []): UseHubsReturn {
    const [burnedKnots, setBurnedKnots] = useState<string[]>([])

    // Convert list to lookup for O(1) access
    const lookup: HubsLookup = useMemo(() => {
        const map: HubsLookup = {}
        hubsList.forEach(hub => {
            map[hub.id] = {}
            hub.options.forEach(opt => {
                map[hub.id][opt.target] = opt.burns
            })
        })
        return map
    }, [hubsList])

    const isBurned = useCallback((knotId: string) => {
        return burnedKnots.includes(knotId)
    }, [burnedKnots])

    const handleChoice = useCallback((hubId: string, targetKnot: string) => {
        // If we are in a hub, and we choose a target, check if it burns anything
        if (lookup[hubId] && lookup[hubId][targetKnot]) {
            const toBurn = lookup[hubId][targetKnot]
            if (toBurn.length > 0) {
                setBurnedKnots(prev => {
                    const newBurned = [...prev]
                    toBurn.forEach(k => {
                        if (!newBurned.includes(k)) {
                            newBurned.push(k)
                        }
                    })
                    return newBurned
                })
                console.log(`[Hubs] Choice '${targetKnot}' from '${hubId}' burned:`, toBurn)
            }
        }
    }, [lookup])

    const resetHubs = useCallback(() => {
        setBurnedKnots([])
    }, [])

    const loadHubsState = useCallback((savedBurned: string[]) => {
        if (Array.isArray(savedBurned)) {
            setBurnedKnots(savedBurned)
        }
    }, [])

    const exportHubsState = useCallback(() => {
        return burnedKnots
    }, [burnedKnots])

    return useMemo(() => ({
        burnedKnots,
        isBurned,
        handleChoice,
        resetHubs,
        loadHubsState,
        exportHubsState
    }), [
        burnedKnots,
        isBurned,
        handleChoice,
        resetHubs,
        loadHubsState,
        exportHubsState
    ])
}
