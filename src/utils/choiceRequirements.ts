/**
 * Choice Requirements System
 *
 * Parses REQUIRES tags on Ink choices and evaluates them against current game state.
 * Tag format: # REQUIRES: magia >= 20, inv:machete_bosque
 */

interface StatRequirement {
    type: 'stat'
    statId: string
    operator: '>=' | '>' | '<=' | '<' | '=='
    value: number
}

interface InventoryRequirement {
    type: 'inventory'
    itemId: string
}

type Requirement = StatRequirement | InventoryRequirement

interface RequirementResult {
    locked: boolean
    displayText: string | null
}

interface GameSystems {
    stats: Record<string, number>
    statsConfig?: { definitions: Array<{ id: string; label: string; icon?: string }> }
    hasItem: (itemId: string) => boolean
    config?: { items?: Record<string, { name: string; icon?: string }> }
}

/**
 * Parse a single requirement string into a typed object.
 * Examples: "magia >= 20", "inv:machete_bosque"
 */
function parseRequirement(raw: string): Requirement | null {
    const trimmed = raw.trim()

    // Inventory requirement: inv:itemId
    if (trimmed.startsWith('inv:')) {
        return { type: 'inventory', itemId: trimmed.slice(4).trim() }
    }

    // Stat requirement: statId operator value
    const match = trimmed.match(/^(\w+)\s*(>=|>|<=|<|==)\s*(\d+)$/)
    if (match) {
        return {
            type: 'stat',
            statId: match[1],
            operator: match[2] as StatRequirement['operator'],
            value: parseInt(match[3], 10)
        }
    }

    console.warn(`[choiceRequirements] Could not parse requirement: "${raw}"`)
    return null
}

/**
 * Parse a REQUIRES tag value into an array of requirements.
 * Supports comma-separated AND conditions.
 */
export function parseRequiresTag(tagValue: string): Requirement[] {
    return tagValue
        .split(',')
        .map(parseRequirement)
        .filter((r): r is Requirement => r !== null)
}

/**
 * Evaluate a single requirement against current game state.
 */
function checkRequirement(req: Requirement, gameSystems: GameSystems): boolean {
    if (req.type === 'inventory') {
        return gameSystems.hasItem(req.itemId)
    }

    const current = gameSystems.stats[req.statId] ?? 0
    switch (req.operator) {
        case '>=': return current >= req.value
        case '>':  return current > req.value
        case '<=': return current <= req.value
        case '<':  return current < req.value
        case '==': return current === req.value
        default:   return false
    }
}

/**
 * Evaluate all requirements (AND logic). Returns true if ALL are met.
 */
export function checkRequirements(requirements: Requirement[], gameSystems: GameSystems): boolean {
    return requirements.every(req => checkRequirement(req, gameSystems))
}

/**
 * Format a requirement into a human-readable label.
 * Uses stat/item labels from config when available.
 */
export function formatRequirement(req: Requirement, gameSystems: GameSystems): string {
    if (req.type === 'inventory') {
        const itemDef = gameSystems.config?.items?.[req.itemId]
        const name = itemDef?.name ?? req.itemId
        const icon = itemDef?.icon ?? ''
        return icon ? `${icon} ${name}` : name
    }

    // Stat requirement
    const statDef = gameSystems.statsConfig?.definitions.find(d => d.id === req.statId)
    const label = statDef?.label ?? req.statId
    const icon = statDef?.icon ?? ''
    const prefix = icon ? `${icon} ` : ''
    return `${prefix}${label} ${req.operator} ${req.value}`
}

/**
 * Main convenience function: extract REQUIRES tag from choice, parse, evaluate, format.
 * Returns { locked: false, displayText: null } if no REQUIRES tag found.
 */
export function processChoiceRequirements(
    choice: { tags?: string[] | null, text?: string },
    gameSystems: GameSystems
): RequirementResult {
    // Try choice.tags first (inkjs tag system)
    let requiresTag: string | undefined
    if (choice.tags) {
        requiresTag = choice.tags.find(
            (t: string) => t.trim().toUpperCase().startsWith('REQUIRES:')
        )
    }

    // Fallback: parse REQUIRES from choice text (inkjs may embed tags in text)
    if (!requiresTag && choice.text) {
        const textMatch = choice.text.match(/#\s*(REQUIRES:\s*.+)$/i)
        if (textMatch) {
            requiresTag = textMatch[1]
        }
    }

    if (!requiresTag) return { locked: false, displayText: null }

    const tagValue = requiresTag.trim().substring('REQUIRES:'.length).trim()
    const requirements = parseRequiresTag(tagValue)

    if (requirements.length === 0) return { locked: false, displayText: null }

    const met = checkRequirements(requirements, gameSystems)
    const displayText = requirements
        .map(req => formatRequirement(req, gameSystems))
        .join(', ')

    return { locked: !met, displayText }
}
