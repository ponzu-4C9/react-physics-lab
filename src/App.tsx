import { useRef, useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pitchParam = useRef({
      theta:0,
      thetaDot:0, 

      V:10,//m/s 機体速度

      delta_e:0, //舵角

      Iyy: 197,
      L_main: 1960,//機体重量が200kgだから
      dure:0.134,//重心と空力重心のずれ
      rho:1.225,
      S_main:45.6,
      barc:1.2,
      Cm0:-0.13,

      l_tail:5.79,//重心と尾翼までの長さ
      S_tail:3.22,//エレベーターの面積

      elek:0.0792//エレベーターの揚力傾斜
    });

  const lastTime = useRef(0);

  useEffect(() => {
    const update = (timestamp: number) => {
      // dt を計算（秒に変換）
      const dt = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      // 初回はdtが大きすぎるのでスキップ
      if (dt > 0.1) {
        requestAnimationFrame(update);
        return;
      }

      const canvas = canvasRef.current
      if (!canvas) return

      //制御系
      const p = pitchParam.current;

      const C_L_tail = p.elek * (
        p.theta +
        p.delta_e +
        (180/Math.PI) * p.thetaDot*p.l_tail*(1/p.V)
      )
      
      const M_tail = -p.l_tail*
                      (1/2)*
                      p.rho*p.V*p.V*
                      p.S_tail*C_L_tail;
      
      const M_ac = (1/2)*p.rho*p.V*p.V*
                      p.S_main*p.barc*p.Cm0

      const M_main = (-1)*p.L_main*p.dure +M_ac;

      p.thetaDot += (M_main/(p.Iyy) + M_tail/(p.Iyy))*dt;
      p.theta += p.thetaDot*dt;

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 背景をクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 円を描画
      ctx.beginPath()
      ctx.fillStyle = '#000000ff'
      ctx.fillRect(100, 100, 50, 50);

      requestAnimationFrame(update)
    }

    requestAnimationFrame(update);
  }, [])

  return (
    <div className="App">
      <h1>React Physics Lab</h1>
      <canvas
        ref={canvasRef}
        width={1000}
        height={800}
      />
    </div>
  )
}
