/**
 * generateInk.js
 * Converts a BardoEditor graph (nodes + edges) into valid Ink source code.
 *
 * Node types: hub, knot
 * - All nodes become === knot_id === knots
 * - Inline choices (data.choices[]) emit + [text] -> target
 * - Tags in node content pass through verbatim (lines starting with #)
 * - Raw Ink conditionals in content pass through verbatim
 */

/**
 * Sanitize a node ID to be a valid Ink knot name.
 * Ink knot names: lowercase, underscores, no spaces, must start with letter.
 * Handles collisions by appending _2, _3, etc.
 */
function sanitizeId(id, usedIds) {
    let clean = id
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase();
    // Must start with a letter
    if (clean && !/^[a-z]/.test(clean)) {
        clean = 'n_' + clean;
    }
    if (!clean) clean = 'unnamed';

    // Deduplicate if usedIds set is provided
    if (usedIds) {
        let finalId = clean;
        let counter = 2;
        while (usedIds.has(finalId)) {
            finalId = `${clean}_${counter}`;
            counter++;
        }
        usedIds.add(finalId);
        return finalId;
    }

    return clean;
}

/**
 * Get outgoing edges from a node.
 */
function getOutgoingEdges(nodeId, edges) {
    return edges.filter(e => e.source === nodeId);
}

/**
 * Main Ink generator.
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Array} [variables] - Project variables [{name, type, value}]
 * @returns {string} Valid Ink source code
 */
export function generateInk(nodes, edges, variables = []) {
    const lines = [];
    const idMap = new Map(); // original id -> sanitized id
    const usedIds = new Set();

    // Build ID mapping (with collision detection)
    nodes.forEach(n => {
        idMap.set(n.id, sanitizeId(n.id, usedIds));
    });

    // 1. Emit VAR declarations
    variables.forEach(v => {
        let defaultVal;
        if (v.type === 'string') {
            defaultVal = `"${v.value || ''}"`;
        } else if (v.type === 'boolean') {
            defaultVal = v.value ? 'true' : 'false';
        } else {
            defaultVal = v.value ?? 0;
        }
        lines.push(`VAR ${v.name} = ${defaultVal}`);
    });

    if (variables.length > 0) {
        lines.push('');
    }

    // 2. Find entry node
    const entryNode = findEntryNode(nodes, edges);
    if (entryNode) {
        lines.push(`-> ${idMap.get(entryNode.id)}`);
        lines.push('');
    }

    // 3. Generate knots for each node
    nodes.forEach(node => {
        const knotId = idMap.get(node.id);
        lines.push(`=== ${knotId} ===`);

        // Emit content lines
        const content = node.data.content || node.data.text || '';
        if (content.trim()) {
            content.split('\n').forEach(line => {
                lines.push(line);
            });
        }

        // Check outgoing edges
        const outEdges = getOutgoingEdges(node.id, edges);

        // Inline choices (data.choices[])
        const inlineChoices = node.data.choices || [];

        if (inlineChoices.length > 0) {
            // Emit inline choices as Ink choice syntax
            inlineChoices.forEach((choice, i) => {
                const handleId = `choice_${i}`;
                const matchingEdge = outEdges.find(e => e.sourceHandle === handleId);
                const target = matchingEdge ? (idMap.get(matchingEdge.target) || 'END') : 'END';
                const prefix = choice.sticky === false ? '*' : '+';
                const cond = choice.condition ? ` {${choice.condition}}` : '';
                lines.push(`${prefix}${cond} [${choice.text}] -> ${target}`);
            });
        } else if (outEdges.length === 0) {
            // No outgoing edges → END
            lines.push('-> END');
        } else if (outEdges.length === 1) {
            // Single direct edge → divert
            const targetId = idMap.get(outEdges[0].target);
            lines.push(`-> ${targetId || 'END'}`);
        } else {
            // Multiple outgoing edges without choices — warn and use first
            lines.push(`// WARNING: ${outEdges.length} outgoing edges but no choices. Using first target only.`);
            const targetId = idMap.get(outEdges[0].target);
            lines.push(`-> ${targetId || 'END'}`);
        }

        lines.push('');
    });

    return lines.join('\n');
}

/**
 * Find the entry/start node in the graph.
 */
function findEntryNode(nodes, edges) {
    // Priority 1: node with id 'start' or 'node_start'
    const startById = nodes.find(n =>
        n.id === 'start' || n.id === 'node_start' ||
        sanitizeId(n.id) === 'start'
    );
    if (startById) return startById;

    // Priority 2: first hub node
    const firstHub = nodes.find(n => n.data.type === 'hub');
    if (firstHub) return firstHub;

    // Priority 3: first node with no incoming edges
    const incomingTargets = new Set(edges.map(e => e.target));
    const orphan = nodes.find(n => !incomingTargets.has(n.id));
    if (orphan) return orphan;

    // Priority 4: first node
    return nodes[0];
}

/**
 * Validate the graph for common issues before export.
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Object} [config] - Optional project config for tag validation
 * @returns {Array} Array of { type: 'error'|'warning'|'info', nodeId, message }
 */
export function validateGraph(nodes, edges, config) {
    const warnings = [];
    const usedIds = new Set();
    const idMap = new Map();

    // No entry point
    if (nodes.length > 0) {
        const entryNode = findEntryNode(nodes, edges);
        if (!entryNode) {
            warnings.push({
                type: 'error',
                nodeId: null,
                message: 'No entry point found — add a node named "start" or a hub node',
            });
        }
    }

    // Build sanitized ID map and check for collisions
    const sanitizedCount = new Map();
    nodes.forEach(n => {
        const sanitized = sanitizeId(n.id, usedIds);
        idMap.set(n.id, sanitized);
        const base = sanitized.replace(/_\d+$/, '');
        if (!sanitizedCount.has(base)) sanitizedCount.set(base, []);
        sanitizedCount.get(base).push(n.id);
    });

    // ID collision detection
    const usedIds2 = new Set();
    nodes.forEach(n => {
        const clean = sanitizeId(n.id);
        if (usedIds2.has(clean)) {
            warnings.push({
                type: 'warning',
                nodeId: n.id,
                message: `ID collision: "${n.id}" produces the same Ink knot name "${clean}" as another node`,
            });
        }
        usedIds2.add(clean);
    });

    // Config-aware tag validation
    const configStats = config?.stats?.definitions?.map(s => s.id) || [];
    const configAchievements = config?.achievements?.map(a => a.id) || [];

    const entryNode = findEntryNode(nodes, edges);
    const incomingTargets = new Set(edges.map(e => e.target));

    nodes.forEach(node => {
        const outEdges = getOutgoingEdges(node.id, edges);
        const inlineChoices = node.data.choices || [];
        const content = node.data.content || node.data.text || '';

        // Empty content
        if (!content.trim()) {
            warnings.push({
                type: 'info',
                nodeId: node.id,
                message: 'Node has no content — consider adding narrative text or tags',
            });
        }

        // Long passages (>500 words)
        const wordCount = content.split(/\s+/).filter(w => w && !w.startsWith('#')).length;
        if (wordCount > 500) {
            warnings.push({
                type: 'info',
                nodeId: node.id,
                message: `Long passage (${wordCount} words) — consider splitting into multiple nodes`,
            });
        }

        // Dead-end detection (no outgoing edges and no choices)
        if (inlineChoices.length === 0 && outEdges.length === 0) {
            warnings.push({
                type: 'warning',
                nodeId: node.id,
                message: 'Dead-end: node has no outgoing edges — will divert to END',
            });
        }

        // Multi-edge without choices
        if (inlineChoices.length === 0 && outEdges.length > 1) {
            warnings.push({
                type: 'error',
                nodeId: node.id,
                message: `Node has ${outEdges.length} outgoing edges but no choices — only the first target will be used`,
            });
        }

        // Orphan detection (no incoming edges, not entry)
        if (entryNode && node.id !== entryNode.id && !incomingTargets.has(node.id)) {
            warnings.push({
                type: 'warning',
                nodeId: node.id,
                message: 'Orphan node: not reachable from any other node',
            });
        }

        // Disconnected choice handles
        if (inlineChoices.length > 0) {
            inlineChoices.forEach((choice, i) => {
                const handleId = `choice_${i}`;
                const hasEdge = outEdges.some(e => e.sourceHandle === handleId);
                if (!hasEdge) {
                    warnings.push({
                        type: 'warning',
                        nodeId: node.id,
                        message: `Choice "${choice.text}" has no connected edge — will divert to END`,
                    });
                }
            });
        }

        // Validate tags against config (if config provided)
        if (config && content) {
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('#')) continue;
                const tagRaw = trimmed.slice(1);
                // Check stat references
                const statMatch = tagRaw.match(/^stat:(\w+):/);
                if (statMatch && configStats.length > 0 && !configStats.includes(statMatch[1])) {
                    warnings.push({
                        type: 'warning',
                        nodeId: node.id,
                        message: `Stat "${statMatch[1]}" not found in project config`,
                    });
                }
                // Check achievement references
                const achMatch = tagRaw.match(/^achievement:unlock:(\w+)/);
                if (achMatch && configAchievements.length > 0 && !configAchievements.includes(achMatch[1])) {
                    warnings.push({
                        type: 'warning',
                        nodeId: node.id,
                        message: `Achievement "${achMatch[1]}" not found in project config`,
                    });
                }
            }
        }
    });

    // Edges targeting non-existent nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    edges.forEach(e => {
        if (!nodeIds.has(e.target)) {
            warnings.push({
                type: 'error',
                nodeId: e.source,
                message: `Edge targets non-existent node "${e.target}"`,
            });
        }
    });

    return warnings;
}

/**
 * Generate hub registry for burn rules.
 */
export function generateHubRegistry(nodes) {
    const hubs = nodes.filter(n => n.data.type === 'hub');
    return hubs.map(hub => ({
        id: hub.id,
        options: hub.data.burnRules || []
    }));
}
