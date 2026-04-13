import { useEffect, useState } from 'react'

/**
 * BadgeImage — renders an achievement badge with background removed via
 * flood-fill from corners (magic wand style). Works regardless of circle
 * position in the image.
 */
export default function BadgeImage({ src, alt, className, style }) {
    const [processed, setProcessed] = useState(null)

    useEffect(() => {
        if (!src) return
        setProcessed(null)

        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data
            const w = canvas.width
            const h = canvas.height

            // Sample background color from the 4 corners and average
            const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]]
            let rSum = 0, gSum = 0, bSum = 0
            corners.forEach(([x, y]) => {
                const idx = (y * w + x) * 4
                rSum += data[idx]
                gSum += data[idx + 1]
                bSum += data[idx + 2]
            })
            const bgR = rSum / 4, bgG = gSum / 4, bgB = bSum / 4

            const threshold = 45
            const colorDist = (idx) => {
                const r = data[idx] - bgR
                const g = data[idx + 1] - bgG
                const b = data[idx + 2] - bgB
                return Math.sqrt(r * r + g * g + b * b)
            }

            // BFS flood fill from all 4 corners — mark pixels to remove
            const toRemove = new Uint8Array(w * h)
            const visited = new Uint8Array(w * h)
            const queue = []
            corners.forEach(([x, y]) => {
                const pos = y * w + x
                visited[pos] = 1
                queue.push(pos)
            })

            let i = 0
            while (i < queue.length) {
                const pos = queue[i++]
                const idx = pos * 4
                if (colorDist(idx) > threshold) continue

                toRemove[pos] = 1

                const x = pos % w
                const y = Math.floor(pos / w)
                const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
                neighbors.forEach(([nx, ny]) => {
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        const npos = ny * w + nx
                        if (!visited[npos]) {
                            visited[npos] = 1
                            queue.push(npos)
                        }
                    }
                })
            }

            // Erosion: restore pixels that border non-removed pixels
            // This prevents the fill from eating into circle art through JPEG artifacts
            const toRestore = new Uint8Array(w * h)
            for (let pos = 0; pos < w * h; pos++) {
                if (!toRemove[pos]) continue
                const x = pos % w
                const y = Math.floor(pos / w)
                const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
                const bordersArt = neighbors.some(([nx, ny]) =>
                    nx >= 0 && nx < w && ny >= 0 && ny < h && !toRemove[ny * w + nx]
                )
                if (bordersArt) toRestore[pos] = 1
            }

            // Apply: make transparent only pixels that passed erosion
            for (let pos = 0; pos < w * h; pos++) {
                if (toRemove[pos] && !toRestore[pos]) {
                    data[pos * 4 + 3] = 0
                }
            }

            ctx.putImageData(imageData, 0, 0)
            setProcessed(canvas.toDataURL('image/png'))
        }
        img.src = src
    }, [src])

    return <img src={processed || src} alt={alt} className={className} style={style} />
}
