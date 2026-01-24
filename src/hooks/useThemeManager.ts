import { useEffect, useState, useRef } from 'react'

export function useThemeManager(config: any, storyId: string) {
    const [isThemeReady, setIsThemeReady] = useState(false)
    const prevThemeRef = useRef(null)

    useEffect(() => {
        const root = document.documentElement

        // Helper to clear all possible Bardo-related CSS variables
        const clearTheme = () => {
            const vars = [
                '--bardo-accent', '--bardo-bg', '--bardo-text', '--bardo-muted',
                '--bardo-font-main', '--bardo-font-header', '--bardo-font-mono',
                '--stats-top', '--stats-left', '--inventory-top', '--inventory-right',
                '--player-max-width', '--player-text-align',
                '--ui-border-radius', '--ui-border-width'
            ]
            vars.forEach(v => root.style.removeProperty(v))
        }

        // 1. If we are entering a story but config is missing, stay blocked
        if (storyId && !config) {
            setIsThemeReady(false)
            return
        }

        const theme = config?.theme

        // Check if theme actually changed to avoid spurious resets
        const isSameTheme = JSON.stringify(prevThemeRef.current) === JSON.stringify(theme)

        // If theme changed, block UI. If not, we just restore styles (cleanup cleared them) without blocking.
        if (!isSameTheme) {
            setIsThemeReady(false)
            prevThemeRef.current = theme
        }

        // 2. Clear previous theme (if not already cleared by cleanup)
        clearTheme()

        if (!theme) {
            // No theme config: set defaults and wait a bit for browser to catch up
            const timer = setTimeout(() => setIsThemeReady(true), 200)
            return () => {
                clearTimeout(timer)
                setIsThemeReady(false)
                clearTheme()
            }
        }

        // 3. Apply New Theme settings
        if (theme.primaryColor) root.style.setProperty('--bardo-accent', theme.primaryColor)
        if (theme.bgColor) root.style.setProperty('--bardo-bg', theme.bgColor)
        if (theme.textColor) root.style.setProperty('--bardo-text', theme.textColor)

        if (theme.typography) {
            const { mainFont, headerFont, googleFonts } = theme.typography
            if (mainFont) root.style.setProperty('--bardo-font-main', mainFont)
            if (headerFont) root.style.setProperty('--bardo-font-header', headerFont)

            if (googleFonts && Array.isArray(googleFonts) && googleFonts.length > 0) {
                const fontId = 'bardo-dynamic-fonts'
                let link = document.getElementById(fontId) as HTMLLinkElement | null;
                if (!link) {
                    link = document.createElement('link')
                    link.id = fontId
                    link.rel = 'stylesheet'
                    document.head.appendChild(link)
                }
                const families = googleFonts.map((f: string) => f.replace(/ /g, '+')).join('&family=')
                link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`
            }
        }

        if (theme.layout) {
            const { statsPosition, inventoryPosition, playerMaxWidth, textAlignment } = theme.layout
            if (statsPosition) {
                if (statsPosition.top) root.style.setProperty('--stats-top', `${statsPosition.top}rem`)
                if (statsPosition.left) root.style.setProperty('--stats-left', `${statsPosition.left}rem`)
            }
            if (inventoryPosition) {
                if (inventoryPosition.top) root.style.setProperty('--inventory-top', `${inventoryPosition.top}rem`)
                if (inventoryPosition.right) root.style.setProperty('--inventory-right', `${inventoryPosition.right}rem`)
            }
            if (playerMaxWidth) root.style.setProperty('--player-max-width', playerMaxWidth)
            if (textAlignment) root.style.setProperty('--player-text-align', textAlignment)
        }

        if (theme.uiStyle) {
            const { borderRadius, borderWidth } = theme.uiStyle
            if (borderRadius) root.style.setProperty('--ui-border-radius', borderRadius)
            if (borderWidth) root.style.setProperty('--ui-border-width', borderWidth)
        }

        console.log('[Theme] Theme applied successfully')

        // 4. Unblock UI
        if (!isSameTheme) {
            const timer = setTimeout(() => setIsThemeReady(true), 250)
            return () => {
                clearTimeout(timer)
                // Do not reset isThemeReady here to avoid flashes on ref changes
                clearTheme()
            }
        } else {
             // If theme was same, just make sure we are ready (if we weren't already)
             if (!isThemeReady) setIsThemeReady(true)

             // Cleanup still needed to clear theme on next run
             return () => {
                 clearTheme()
             }
        }
    }, [config, storyId])

    return isThemeReady
}
