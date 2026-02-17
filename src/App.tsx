import { useRef, useEffect } from 'react'
import './App.css'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 背景をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 円を描画
    ctx.beginPath()
    ctx.arc(200, 150, 30, 0, Math.PI * 2) // (x, y, 半径, 開始角, 終了角)
    ctx.fillStyle = '#ff0000ff'
    ctx.fill()
    ctx.strokeStyle = '#c27e19ff'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [])

  return (
    <div className="App">
      <h1>React Physics Lab</h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
      />
    </div>
  )
}
