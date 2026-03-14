/**
 * parseInk.js
 * Parses .ink source code into BardoEditor graph format (nodes, edges, variables).
 *
 * Strategy: preserve ALL raw content within each knot verbatim. We only *scan*
 * (not remove) choice lines and diverts to build edges for the graph. The node's
 * content field stores the original Ink source exactly as written, so when
 * generateInk reproduces it the output compiles cleanly.
 *
 * Handles: VARs, knots, functions, inline choices, diverts, conditionals,
 * assignments (~), tags (#), comments (//), and all content pass-through.
 *
 * Does NOT handle: stitches (= name), tunnels (->->), threads (<-), INCLUDE.
 */

import dagre from '@dagrejs/dagre';

/**
 * Parse Ink source into editor-compatible format.
 * @param {string} inkSource - Raw .ink text
 * @returns {{ nodes: Array, edges: Array, variables: Array, entryPoint: string|null }}
 */
export function parseInk(inkSource) {
    const lines = inkSource.split('\n');
    const variables = [];
    const knots = [];
    let entryPoint = null;
    let currentKnot = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // VAR declarations (before any knot)
        if (!currentKnot) {
            const varMatch = trimmed.match(/^VAR\s+(\w+)\s*=\s*(.+)$/);
            if (varMatch) {
                variables.push(parseVariable(varMatch[1], varMatch[2].trim()));
                continue;
            }
        }

        // Top-level divert (entry point): -> knot_name
        if (!currentKnot && /^->\s*\w+\s*$/.test(trimmed)) {
            entryPoint = trimmed.match(/^->\s*(\w+)/)[1];
            continue;
        }

        // Knot or function header: === name === or === function name() ===
        const knotMatch = trimmed.match(/^===\s*(function\s+)?(\w+)\s*(\(.*?\))?\s*===?\s*$/);
        if (knotMatch) {
            if (currentKnot) {
                knots.push(finalizeKnot(currentKnot));
            }
            const isFunction = !!knotMatch[1];
            const name = knotMatch[2];
            const params = knotMatch[3] || '';  // e.g. "(rapido)" or "()"
            currentKnot = {
                id: name,
                isFunction,
                params,               // preserved for header regeneration
                rawLines: [],         // ALL lines inside this knot, verbatim
                headerLine: trimmed,  // the === line itself
            };
            continue;
        }

        // Inside a knot — store everything verbatim
        if (currentKnot) {
            currentKnot.rawLines.push(line);
        }
        // Lines before any knot that aren't VARs or entry diverts are ignored
        // (comments, blank lines, etc.)
    }

    // Don't forget the last knot
    if (currentKnot) {
        knots.push(finalizeKnot(currentKnot));
    }

    // Build edges from choices and all detected diverts
    const edges = [];
    const knotIds = new Set(knots.map(k => k.id));

    knots.forEach(knot => {
        const edgedTargets = new Set(); // avoid duplicate edges to same target

        // Edges from choices
        knot.choices.forEach((choice, i) => {
            if (choice.target && knotIds.has(choice.target)) {
                edges.push({
                    id: `e_${knot.id}_choice${i}_${choice.target}`,
                    source: knot.id,
                    target: choice.target,
                    sourceHandle: `choice_${i}`,
                    targetHandle: null,
                    label: choice.text,
                });
                edgedTargets.add(choice.target);
            }
        });

        // Edges from all other diverts found in content (conditionals, inline, etc.)
        knot.allDiverts.forEach(target => {
            if (knotIds.has(target) && !edgedTargets.has(target) && target !== knot.id) {
                edges.push({
                    id: `e_${knot.id}_divert_${target}`,
                    source: knot.id,
                    target: target,
                    sourceHandle: null,
                    targetHandle: null,
                });
                edgedTargets.add(target);
            }
        });
    });

    // Layout with Dagre
    const NODE_W = 280;
    const NODE_H = 150;
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120, edgesep: 30 });

    knots.forEach(k => g.setNode(k.id, { width: NODE_W, height: NODE_H }));
    edges.forEach(e => g.setEdge(e.source, e.target));

    dagre.layout(g);

    const nodes = knots.map(knot => {
        const pos = g.node(knot.id);
        return {
            id: knot.id,
            type: 'passage',
            position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
            data: {
                label: knot.id,
                type: knot.id === entryPoint ? 'hub' : 'knot',
                content: knot.content,
                text: knot.content,
                isFunction: knot.isFunction || false,
                knotParams: knot.params || '',
                choices: knot.choices.map(c => ({
                    text: c.text,
                    condition: c.condition,
                    sticky: c.sticky,
                })),
            },
        };
    });

    return { nodes, edges, variables, entryPoint };
}

/**
 * Process a completed knot's raw lines to extract choices and trailing divert,
 * while preserving ALL content verbatim.
 */
function finalizeKnot(knot) {
    // Trim trailing empty lines
    while (knot.rawLines.length > 0 && knot.rawLines[knot.rawLines.length - 1].trim() === '') {
        knot.rawLines.pop();
    }

    const choices = [];
    let trailingDivert = null;

    // Scan ALL lines for choices and ANY diverts (for edge-building only)
    const allDiverts = new Set();
    for (const line of knot.rawLines) {
        const trimmed = line.trim();

        // Choice: * or + with [text] and optional -> target
        const choiceMatch = trimmed.match(/^([+*])\s*(?:\{([^}]+)\}\s*)?\[([^\]]*)\]\s*(?:->\s*(\w+))?\s*$/);
        if (choiceMatch) {
            choices.push({
                text: choiceMatch[3].trim(),
                condition: choiceMatch[2]?.trim() || '',
                target: choiceMatch[4] || null,
                sticky: choiceMatch[1] === '+',
            });
            if (choiceMatch[4]) allDiverts.add(choiceMatch[4]);
            continue;
        }

        // Any divert anywhere in the line: -> target (not -> END, -> DONE)
        const divertMatches = trimmed.matchAll(/->\s*(\w+)/g);
        for (const m of divertMatches) {
            const target = m[1];
            if (target !== 'END' && target !== 'DONE') {
                allDiverts.add(target);
            }
        }
    }

    // Trailing divert for backward compat (used when no choices exist)
    for (let i = knot.rawLines.length - 1; i >= 0; i--) {
        const trimmed = knot.rawLines[i].trim();
        if (!trimmed || trimmed.startsWith('//')) continue;
        const divertMatch = trimmed.match(/^->\s*(\w+)\s*$/);
        if (divertMatch) {
            trailingDivert = divertMatch[1];
        }
        break;
    }

    // Content = ALL raw lines joined, verbatim
    const content = knot.rawLines.join('\n').replace(/\n+$/, '');

    return {
        id: knot.id,
        isFunction: knot.isFunction,
        params: knot.params || '',
        content,
        choices,
        trailingDivert,
        allDiverts: Array.from(allDiverts),
    };
}

/**
 * Parse a VAR value into typed variable object.
 */
function parseVariable(name, rawValue) {
    // String: "value"
    if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
        return { name, type: 'string', value: rawValue.slice(1, -1) };
    }
    // Boolean
    if (rawValue === 'true' || rawValue === 'false') {
        return { name, type: 'boolean', value: rawValue === 'true' };
    }
    // Number
    const num = Number(rawValue);
    if (!isNaN(num)) {
        return { name, type: 'number', value: num };
    }
    // Fallback to string
    return { name, type: 'string', value: rawValue };
}
