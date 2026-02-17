import { useRef, useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pitchParam = useRef({
      theta:0,
      thetaDot:0, 
      Iyy: 197,
      L_main: 1960,//機体重量が200kgだから
      ρ:1.225,
      S_main:45.6,
      barc:1.2,
      Cm0:-0.13,

      l_tail:5.79,//重心と尾翼までの長さ
      S_tail:3.22,//エレベーターの面積
      
    });

  useEffect(() => {
    const update = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      ballPos.current.vx += force;
      ballPos.current.x += ballPos.current.vx;

      if( ballPos.current.x < 0 || canvas.width < ballPos.current.x ){
        ballPos.current.vx = 0;
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 背景をクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 円を描画
      ctx.beginPath()
      ctx.arc(ballPos.current.x, 150, 30, 0, Math.PI * 2) // (x, y, 半径, 開始角, 終了角)
      ctx.fillStyle = '#ff0000ff'
      ctx.fill()
      ctx.strokeStyle = '#c27e19ff'
      ctx.lineWidth = 2
      ctx.stroke()

      requestAnimationFrame(update)
    }

    update();
  }, [force])

  return (
    <div className="App">
      <h1>React Physics Lab</h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
      />
      <input type="range" min="-1" max="1" step="0.01" value={force} onChange={(e) => setForce(Number(e.target.value))} />
    </div>
  )
}
