import { useState, useCallback } from 'react';

const STORAGE_KEY = 'bardoeditor_guides_dismissed';

/**
 * Tracks which first-use guide banners the user has dismissed.
 * Returns which guides to show and a dismiss callback.
 */
export function useFirstUseGuides() {
    const [dismissed, setDismissed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    });

    const dismiss = useCallback((guideId) => {
        setDismissed(prev => {
            const next = { ...prev, [guideId]: true };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const resetAll = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setDismissed({});
    }, []);

    return {
        showWelcome: !dismissed.welcome,
        showFirstEdit: !dismissed.firstEdit,
        showFirstChoice: !dismissed.firstChoice,
        dismiss,
        resetAll,
    };
}
