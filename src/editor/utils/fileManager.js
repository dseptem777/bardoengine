/**
 * fileManager.js
 * Abstracts file operations for Tauri (native) vs browser environments.
 * All Tauri imports are dynamic to avoid breaking dev/browser mode.
 */

const RECENT_PROJECTS_KEY = 'bardoeditor_recent_projects';
const MAX_RECENT = 10;

/**
 * Detect if running inside a Tauri app.
 */
export function isTauriApp() {
    return typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;
}

/**
 * Open a file dialog and return the file content + path.
 * @param {Array<{name: string, extensions: string[]}>} filters
 * @returns {Promise<{content: string, path: string|null}>}
 */
export async function openFile(filters = []) {
    if (isTauriApp()) {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const { readTextFile } = await import('@tauri-apps/plugin-fs');

        const path = await open({
            multiple: false,
            filters,
        });

        if (!path) return null;

        const content = await readTextFile(path);
        return { content, path };
    }

    // Browser fallback: file input
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = filters
            .flatMap(f => f.extensions.map(ext => `.${ext}`))
            .join(',');

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) { resolve(null); return; }

            const reader = new FileReader();
            reader.onload = (e) => resolve({ content: e.target.result, path: null });
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
        };

        // Handle cancel
        input.oncancel = () => resolve(null);
        input.click();
    });
}

/**
 * Save content to a file with a save dialog.
 * @param {string} content
 * @param {Array<{name: string, extensions: string[]}>} filters
 * @param {string} defaultName
 * @returns {Promise<string|null>} Saved path (Tauri) or null (browser)
 */
export async function saveFileAs(content, filters = [], defaultName = 'untitled') {
    if (isTauriApp()) {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { writeTextFile } = await import('@tauri-apps/plugin-fs');

        const path = await save({
            filters,
            defaultPath: defaultName,
        });

        if (!path) return null;

        await writeTextFile(path, content);
        return path;
    }

    // Browser fallback: download
    const ext = filters[0]?.extensions?.[0] || 'json';
    const filename = defaultName.endsWith(`.${ext}`) ? defaultName : `${defaultName}.${ext}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return null;
}

/**
 * Write content directly to a known path (no dialog).
 * Only works in Tauri. Returns false in browser.
 */
export async function writeToPath(path, content) {
    if (!isTauriApp() || !path) return false;

    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    await writeTextFile(path, content);
    return true;
}

/**
 * Get the list of recent projects from localStorage.
 * @returns {Array<{path: string, title: string, lastOpened: string}>}
 */
export function getRecentProjects() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_PROJECTS_KEY) || '[]');
    } catch {
        return [];
    }
}

/**
 * Add or update a project in the recent projects list.
 */
export function addRecentProject(path, title) {
    if (!path) return;

    const list = getRecentProjects().filter(p => p.path !== path);
    list.unshift({ path, title, lastOpened: new Date().toISOString() });
    if (list.length > MAX_RECENT) list.length = MAX_RECENT;

    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(list));
}

/**
 * Read a file from a known path (for recent projects).
 * Only works in Tauri.
 */
export async function readFromPath(path) {
    if (!isTauriApp() || !path) return null;

    try {
        const { readTextFile } = await import('@tauri-apps/plugin-fs');
        return await readTextFile(path);
    } catch (err) {
        console.error('[fileManager] Failed to read path:', path, err);
        return null;
    }
}

/** Filters for BardoEditor project files */
export const PROJECT_FILTERS = [
    { name: 'BardoProject', extensions: ['bardoproject.json'] },
    { name: 'JSON', extensions: ['json'] },
];

/** Filters for Ink files */
export const INK_FILTERS = [
    { name: 'Ink Story', extensions: ['ink'] },
];
