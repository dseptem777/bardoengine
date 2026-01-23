import { useState, useEffect, useRef, useCallback } from 'react'

export default function ArkanoidGame({ params = [], onFinish }) {
    const canvasRef = useRef(null)
    const [gameState, setGameState] = useState('playing') // playing, win, lose

    // Config
    const PADDLE_HEIGHT = 10
    const PADDLE_WIDTH = 90
    const BALL_RADIUS = 6
    const BRICK_ROWS = 1
    const BRICK_COLS = 1
    const BRICK_PADDING = 10
    const BRICK_OFFSET_TOP = 30
    const BRICK_OFFSET_LEFT = 30

    // Refs for mutable state (to avoid re-renders)
    const ballPos = useRef({ x: 200, y: 250 })
    const ballVel = useRef({ x: 2.5, y: -2.5 })
    const paddleX = useRef((400 - PADDLE_WIDTH) / 2)
    const bricks = useRef([])
    const frameId = useRef()

    // Initialize bricks
    useEffect(() => {
        const brickWidth = (400 - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLS - 1))) / BRICK_COLS
        const brickHeight = 20

        bricks.current = []
        for (let c = 0; c < BRICK_COLS; c++) {
            bricks.current[c] = []
            for (let r = 0; r < BRICK_ROWS; r++) {
                bricks.current[c][r] = { x: 0, y: 0, status: 1 }
            }
        }
    }, [])

    const finish = useCallback((success) => {
        if (gameState !== 'playing') return
        setGameState(success ? 'win' : 'lose')
        cancelAnimationFrame(frameId.current)
        onFinish(success ? 1 : 0)
    }, [gameState, onFinish])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const brickWidth = (400 - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLS - 1))) / BRICK_COLS
        const brickHeight = 20

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Get accent color from CSS variable
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--bardo-accent').trim() || '#facc15'

        // Draw Bricks
        let bricksLeft = 0
        for (let c = 0; c < BRICK_COLS; c++) {
            for (let r = 0; r < BRICK_ROWS; r++) {
                if (bricks.current[c][r].status === 1) {
                    bricksLeft++
                    const brickX = c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT
                    const brickY = r * (brickHeight + BRICK_PADDING) + BRICK_OFFSET_TOP
                    bricks.current[c][r].x = brickX
                    bricks.current[c][r].y = brickY

                    ctx.beginPath()
                    ctx.rect(brickX, brickY, brickWidth, brickHeight)
                    ctx.fillStyle = accentColor
                    ctx.fill()
                    ctx.closePath()
                }
            }
        }

        if (bricksLeft === 0) {
            finish(true)
            return
        }

        // Draw Paddle
        ctx.beginPath()
        ctx.rect(paddleX.current, canvas.height - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT)
        ctx.fillStyle = accentColor
        ctx.fill()
        ctx.closePath()

        // Draw Ball
        ctx.beginPath()
        ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.closePath()

        // Collision detection - Bricks
        for (let c = 0; c < BRICK_COLS; c++) {
            for (let r = 0; r < BRICK_ROWS; r++) {
                const b = bricks.current[c][r]
                if (b.status === 1) {
                    if (ballPos.current.x > b.x && ballPos.current.x < b.x + brickWidth && ballPos.current.y > b.y && ballPos.current.y < b.y + brickHeight) {
                        ballVel.current.y = -ballVel.current.y
                        b.status = 0
                    }
                }
            }
        }

        // Collision detection - Walls
        if (ballPos.current.x + ballVel.current.x > canvas.width - BALL_RADIUS || ballPos.current.x + ballVel.current.x < BALL_RADIUS) {
            ballVel.current.x = -ballVel.current.x
        }
        if (ballPos.current.y + ballVel.current.y < BALL_RADIUS) {
            ballVel.current.y = -ballVel.current.y
        } else if (ballPos.current.y + ballVel.current.y > canvas.height - BALL_RADIUS - PADDLE_HEIGHT - 10) {
            if (ballPos.current.x > paddleX.current && ballPos.current.x < paddleX.current + PADDLE_WIDTH) {
                ballVel.current.y = -ballVel.current.y
                // Add some angle based on where it hit the paddle
                const hitPoint = (ballPos.current.x - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2)
                ballVel.current.x = hitPoint * 3
            } else {
                finish(false)
                return
            }
        }

        ballPos.current.x += ballVel.current.x
        ballPos.current.y += ballVel.current.y

        frameId.current = requestAnimationFrame(draw)
    }, [BRICK_COLS, BRICK_ROWS, finish])

    useEffect(() => {
        if (gameState === 'playing') {
            frameId.current = requestAnimationFrame(draw)
        }
        return () => cancelAnimationFrame(frameId.current)
    }, [gameState, draw])

    // Mouse movement
    const onMouseMove = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const root = document.documentElement
        const mouseX = e.clientX - rect.left - root.scrollLeft
        paddleX.current = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2))
    }

    // Touch movement
    const onTouchMove = (e) => {
        const canvas = canvasRef.current
        if (!canvas || !e.touches[0]) return
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.touches[0].clientX - rect.left
        paddleX.current = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2))
    }

    return (
        <div className="bg-zinc-900 border-2 border-bardo-accent flex flex-col items-center justify-center p-4 shadow-2xl overflow-hidden">
            <div className="w-full flex justify-between items-center mb-4 px-4">
                <h2 className="text-xl font-bold text-bardo-accent tracking-tighter uppercase italic">Bardo-Noid</h2>
                <div className="text-xs text-gray-400 font-mono uppercase">
                    {gameState === 'playing' ? 'SYSTEM ONLINE' : gameState === 'win' ? 'VICTORY' : 'ERROR: CRASHED'}
                </div>
            </div>

            <canvas
                ref={canvasRef}
                width="400"
                height="400"
                onMouseMove={onMouseMove}
                onTouchMove={onTouchMove}
                className="bg-black border border-zinc-800 cursor-none touch-none"
            />

            <div className="mt-4 text-center">
                {gameState === 'playing' ? (
                    <p className="text-gray-500 font-mono text-[10px]">PANTALLA TÁCTIL O MOUSE PARA MOVER</p>
                ) : gameState === 'win' ? (
                    <p className="text-green-500 font-bold text-xl uppercase animate-bounce">LEVEL CLEARED!</p>
                ) : (
                    <p className="text-red-500 font-bold text-xl uppercase italic">GAME OVER</p>
                )}
            </div>
        </div>
    )
}
