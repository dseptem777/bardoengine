/**
 * StorySimulator.js
 * 
 * Bridges ReactFlow's node-based graph with BardoEngine's Player.
 * It mimics the inkjs.Story API so we can swap real Ink for this simulator
 * without changing the Player component too much.
 */

export class StorySimulator {
    constructor(nodes, edges) {
        this.nodes = nodes;
        this.edges = edges;
        this.currentNodeId = this._findStartNode();
        this.variablesState = {};
        this.currentTags = [];
        this.historyStack = []; // Added for Back support
        this.isWaitingForChoice = false;
    }

    _findStartNode() {
        // Look for a node with id 'start' or 'node_start'
        const explicitStart = this.nodes.find(n => n.id === 'start' || n.id === 'node_start');
        if (explicitStart) return explicitStart.id;

        // Failing that, find a node with no incoming edges
        const nodesWithInputs = new Set(this.edges.map(e => e.target));
        const startNodes = this.nodes.filter(n => !nodesWithInputs.has(n.id) && n.type !== 'choice');

        return startNodes.length > 0 ? startNodes[0].id : this.nodes[0]?.id;
    }

    get canContinue() {
        if (!this.currentNodeId) return false;
        if (this.isWaitingForChoice) return false;

        const currentNode = this.nodes.find(n => n.id === this.currentNodeId);
        if (!currentNode) return false;

        if (currentNode.type === 'choice') return false;

        const outgoing = this.edges.filter(e => e.source === this.currentNodeId);
        return outgoing.length > 0;
    }

    get currentChoices() {
        const currentNode = this.nodes.find(n => n.id === this.currentNodeId);
        if (!currentNode) return [];

        if (currentNode.type === 'choice') {
            return this.edges
                .filter(e => e.source === this.currentNodeId)
                .map((e, index) => {
                    const targetNode = this.nodes.find(n => n.id === e.target);
                    return {
                        text: e.label || targetNode?.data?.label || `Option ${index + 1}`,
                        index: index,
                        targetPath: e.target
                    };
                });
        }
        return [];
    }

    GoBack() {
        if (this.historyStack.length > 0) {
            this.currentNodeId = this.historyStack.pop();
            this.isWaitingForChoice = false;
            return true;
        }
        return false;
    }

    Continue() {
        if (!this.currentNodeId) return "";

        // Push current to history before advancing
        if (this.currentNodeId && !this.isWaitingForChoice) {
            this.historyStack.push(this.currentNodeId);
        }

        const node = this.nodes.find(n => n.id === this.currentNodeId);
        if (!node) return "";

        // Process content to extract tags (both full-line and inline)
        const rawContent = node.data?.content || "";
        const lines = rawContent.split('\n');

        const processedLines = [];
        this.currentTags = [];

        // Regex for tags: matches #tagname or #tagname:value
        const tagRegex = /#\s*([a-zA-Z0-9_]+)(?::([a-zA-Z0-9_]+))?/;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                // Full line tag
                const tagContent = trimmed.substring(1).trim();
                this.currentTags.push(tagContent);
            } else {
                // Check for inline tag at end of line (simplified check)
                const match = line.match(tagRegex);
                if (match) {
                    // Extract tag (we use the full match to support any valid tag format)
                    const fullTag = match[0];
                    // Clean up tag content for the engine (remove #)
                    const tagContent = fullTag.replace(/^#\s*/, '').trim();
                    this.currentTags.push(tagContent);

                    // Remove tag from text
                    const cleanLine = line.replace(tagRegex, '').trim();
                    if (cleanLine) processedLines.push(cleanLine);
                } else {
                    processedLines.push(line);
                }
            }
        });

        const text = processedLines.join('\n').trim();

        // Advance the state
        const outgoing = this.edges.filter(e => e.source === this.currentNodeId);

        if (outgoing.length === 1) {
            const nextNode = this.nodes.find(n => n.id === outgoing[0].target);
            if (nextNode?.type === 'choice') {
                this.currentNodeId = nextNode.id;
                this.isWaitingForChoice = true;
            } else if (nextNode) {
                this.currentNodeId = nextNode.id;
            } else {
                this.currentNodeId = null;
            }
        } else if (outgoing.length > 1) {
            const choiceTarget = outgoing.find(e => {
                const n = this.nodes.find(node => node.id === e.target);
                return n?.type === 'choice';
            });

            if (choiceTarget) {
                this.currentNodeId = choiceTarget.target;
                this.isWaitingForChoice = true;
            } else {
                this.currentNodeId = null;
            }
        } else {
            this.currentNodeId = null;
        }

        return text;
    }

    ChooseChoiceIndex(index) {
        const choices = this.currentChoices;
        const choice = choices[index];
        if (choice) {
            this.currentNodeId = choice.targetPath;
            this.isWaitingForChoice = false;
        }
    }

    state = {
        toJson: () => JSON.stringify({ currentNodeId: this.currentNodeId, variables: this.variablesState }),
        LoadJson: (json) => {
            const data = JSON.parse(json);
            this.currentNodeId = data.currentNodeId;
            this.variablesState = data.variables;
        }
    };
}
