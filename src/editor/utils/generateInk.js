export function generateInk(nodes, edges) {
    let ink = "";

    // Helper to get connected nodes
    const getConnections = (sourceId) => {
        return edges
            .filter(e => e.source === sourceId)
            .map(e => nodes.find(n => n.id === e.target));
    };

    nodes.forEach(node => {
        if (node.data.type === 'hub') {
            ink += `=== ${node.id} ===\n`;
            ink += `${node.data.text || ""}\n`;

            const connections = getConnections(node.id);
            connections.forEach(target => {
                ink += `+ [${target.data.label}] -> ${target.id}\n`;
            });
            ink += `\n`;
        } else {
            ink += `=== ${node.id} ===\n`;
            ink += `${node.data.text || ""}\n`;
            // Add default return to hub if it's an alley? Or let user define.
            // For now just basic structure.
            ink += `-> DONE\n\n`;
        }
    });

    return ink;
}

export function generateHubRegistry(nodes) {
    const hubs = nodes.filter(n => n.data.type === 'hub');
    return hubs.map(hub => ({
        id: hub.id,
        options: hub.data.burnRules || []
    }));
}
