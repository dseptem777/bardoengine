/**
 * readingScroll.js
 *
 * Bottom-anchored "fixed read-line" scroll for the reading view.
 *
 * The read-line position is created by LAYOUT, not JS:
 *   content wrapper has pb-[35vh] -> when the container is scrolled to its
 *   bottom, the last line of text sits at ~65% of viewport height. That's
 *   the read line. New text always appears there; old text glides up.
 *
 * All this util does is:
 *   - smooth-scroll the container to its bottom (native browser smoothing)
 *   - tell us when the user has scrolled up to re-read (so we can pause)
 */

export function scrollToBottomSmooth(container) {
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
}

export function userIsReadingUp(container, threshold = 120) {
    if (!container) return false
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight > threshold
}
