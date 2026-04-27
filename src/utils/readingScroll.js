/**
 * readingScroll.js
 * Smooth "fixed read-line" scroll utility.
 * Keeps an anchor element at a configurable ratio down the scroll container
 * using a single in-flight RAF tween (easeOutCubic, ~180ms).
 */

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

// Module-level tween state (one per page — fine for single-player view)
let _tweenId = null
let _tweenStart = null
let _tweenFrom = 0
let _tweenTo = 0
let _tweenContainer = null
const TWEEN_DURATION = 180 // ms

function _tick(now) {
    if (!_tweenContainer) return

    if (_tweenStart === null) _tweenStart = now
    const elapsed = now - _tweenStart
    const progress = Math.min(elapsed / TWEEN_DURATION, 1)
    const eased = easeOutCubic(progress)

    _tweenContainer.scrollTop = _tweenFrom + (_tweenTo - _tweenFrom) * eased

    if (progress < 1) {
        _tweenId = requestAnimationFrame(_tick)
    } else {
        _tweenId = null
        _tweenContainer = null
    }
}

/**
 * Smoothly scroll `container` so that `anchor` sits at `ratio` from the top.
 *
 * @param {Element} container - The scrollable element
 * @param {Element} anchor    - The element to anchor to the read line
 * @param {object}  opts
 * @param {number}  opts.ratio  - 0..1, fraction of container height (default 0.65)
 * @param {boolean} opts.smooth - Use tween (default true). False = instant snap.
 */
export function scrollAnchorToReadLine(container, anchor, { ratio = 0.65, smooth = true } = {}) {
    if (!container || !anchor) return

    const containerRect = container.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()

    // How far the anchor is from the top of the container's client area
    const anchorOffsetInContainer = anchorRect.top - containerRect.top

    // Target scrollTop: move anchor to `ratio` of container height
    const target = container.scrollTop + anchorOffsetInContainer - container.clientHeight * ratio

    const clampedTarget = Math.max(0, Math.min(target, container.scrollHeight - container.clientHeight))

    if (!smooth) {
        container.scrollTop = clampedTarget
        return
    }

    // Retarget in-flight tween or start a new one
    if (_tweenId !== null) {
        // Retarget: update destination without restarting timer so motion stays fluid
        _tweenFrom = container.scrollTop
        _tweenTo = clampedTarget
        _tweenStart = null // reset timer so we get a full 180ms from here
    } else {
        _tweenFrom = container.scrollTop
        _tweenTo = clampedTarget
        _tweenStart = null
        _tweenContainer = container
        _tweenId = requestAnimationFrame(_tick)
    }
    _tweenContainer = container
}

/**
 * Returns true when the user has scrolled significantly above the bottom,
 * meaning they're probably re-reading — auto-scroll should pause.
 *
 * @param {Element} container
 * @param {number}  threshold - px from bottom considered "reading up" (default 120)
 */
export function userIsReadingUp(container, threshold = 120) {
    if (!container) return false
    const { scrollTop, scrollHeight, clientHeight } = container
    return scrollHeight - scrollTop - clientHeight > threshold
}
