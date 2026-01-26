export function generateInk(nodes, edges) {
    let inkContent = "";

    // Sort nodes to have Hubs first (convention)
    const sortedNodes = [...nodes].sort((a, b) => {
        const typeA = a.data?.type || 'knot';
        const typeB = b.data?.type || 'knot';
        if (typeA === 'hub' && typeB !== 'hub') return -1;
        if (typeA !== 'hub' && typeB === 'hub') return 1;
        return 0;
    });

    sortedNodes.forEach(node => {
        const id = node.id;
        const { label, text, type } = node.data || {};
        const nodeText = text || `Content for ${label || id}`;

        inkContent += `=== ${id} ===\n`;
        // Add metadata tags
        if (type === 'hub') inkContent += `#hub\n`;

        inkContent += `${nodeText}\n\n`;

        // Find outgoing edges
        const outgoing = edges.filter(e => e.source === id);

        if (outgoing.length === 0) {
            inkContent += `    -> DONE\n`;
        } else {
            outgoing.forEach(edge => {
                const targetNode = nodes.find(n => n.id === edge.target);
                const targetLabel = edge.label || targetNode?.data?.label || edge.target;

                inkContent += `+ [${targetLabel}] -> ${edge.target}\n`;
            });
        }
        inkContent += `\n`;
    });

    return inkContent;
}

export function generateHubRegistry(nodes) {
    const registry = [];

    nodes.filter(n => n.data?.type === 'hub').forEach(hub => {
        const rules = hub.data?.burnRules || [];

        if (rules.length > 0) {
            registry.push({
                id: hub.id,
                options: rules.map(r => ({
                    target: r.targetId,
                    burns: r.burnedIds
                }))
            });
        }
    });

    return registry;
}
