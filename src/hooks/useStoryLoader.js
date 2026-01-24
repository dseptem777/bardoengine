/**
 * useStoryLoader.js
 * Hook for loading Ink stories with environment detection.
 * - Development: Uses pre-imported JSON directly
 * - Tauri Production: Decrypts via Rust backend
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import storyConfig from '../story-config.json';

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

                // In production, we specifically want the story ID from our build config
                const targetStoryId = storyConfig.storyId;

                if (!availableStories.includes(targetStoryId)) {
                    console.warn(`Target story '${targetStoryId}' not found in resources. Falling back to first available.`);
                }

                const storyId = availableStories.includes(targetStoryId) ? targetStoryId : availableStories[0];
                const decryptedJson = await invoke('decrypt_story', { storyId });

                // Safety: Strip UTF-8 BOM if it somehow sneaked through
                const cleanJson = decryptedJson.startsWith('\uFEFF')
                    ? decryptedJson.slice(1)
                    : decryptedJson;

                const storyData = JSON.parse(cleanJson);

                setProductionStory({
                    id: storyId,
                    title: storyConfig.title || storyId.toUpperCase(),
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

    return useMemo(() => ({
        stories,
        isLoading,
        error,
        isProductionMode,
        isTauri: isTauri()
    }), [stories, isLoading, error, isProductionMode]);
}

export default useStoryLoader;
