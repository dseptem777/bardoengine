/**
 * useStoryLoader.js
 * Hook for loading Ink stories with environment detection.
 * - Development: Uses pre-imported JSON directly
 * - Tauri Production: Decrypts via Rust backend
 */

import { useState, useEffect, useMemo } from 'react';

// Check if running in Tauri
const isTauri = () => {
    return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;
};

/**
 * @param {Object} options
 * @param {Object} options.devStories - Map of story ID to story data for dev mode
 * @returns {Object} { stories, isLoading, error, isProductionMode }
 */
export function useStoryLoader({ devStories = {} }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productionStory, setProductionStory] = useState(null);

    const isProductionMode = isTauri();

    // Load encrypted story in production mode
    useEffect(() => {
        const loadProductionStory = async () => {
            if (!isProductionMode) {
                setIsLoading(false);
                return;
            }

            try {
                const { invoke } = await import('@tauri-apps/api/core');

                // First, list available stories
                const availableStories = await invoke('list_available_stories');
                console.log('Available encrypted stories:', availableStories);

                if (availableStories.length === 0) {
                    throw new Error('No encrypted story found');
                }

                // Load the first (and should be only) story
                const storyId = availableStories[0];
                const decryptedJson = await invoke('decrypt_story', { storyId });
                const storyData = JSON.parse(decryptedJson);

                setProductionStory({
                    id: storyId,
                    title: storyId.toUpperCase(),
                    data: storyData
                });
            } catch (err) {
                console.error('Failed to load encrypted story:', err);
                setError(err.toString());
            } finally {
                setIsLoading(false);
            }
        };

        loadProductionStory();
    }, [isProductionMode]);

    // Get available stories based on mode
    const stories = useMemo(() => {
        if (isProductionMode && productionStory) {
            return [productionStory];
        }
        if (!isProductionMode) {
            return Object.entries(devStories).map(([id, data]) => ({
                id,
                title: id.toUpperCase(),
                data
            }));
        }
        return [];
    }, [isProductionMode, productionStory, devStories]);

    return {
        stories,
        isLoading,
        error,
        isProductionMode,
        isTauri: isTauri()
    };
}

export default useStoryLoader;
