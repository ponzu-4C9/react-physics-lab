import { useRef, useEffect} from 'react'
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

      elek:4.54//エレベーターの揚力傾斜
    });
    const p = pitchParam.current;

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

      const C_L_tail = p.elek * (
        p.theta +
        p.delta_e* Math.PI / 180 +
        Math.atan(p.thetaDot*p.l_tail*(1/p.V))
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

      const W = canvas.width;
      const H = canvas.height;
      const bodyLen = W * 0.6;   // 機体の長さ（幅の60%）
      const bodyH = H * 0.02;   // 機体の太さ
      const elevLen = W * 0.06;  // エレベーターの長さ
      const elevH = bodyH;       // エレベーターの太さ

      ctx.save();                            
      ctx.translate(W / 2, H / 2);               
      ctx.rotate(-p.theta);                   
      ctx.fillStyle = '#000000ff';
      ctx.fillRect(-bodyLen / 2, -bodyH / 2, bodyLen, bodyH);
        ctx.save();
        ctx.translate(bodyLen / 2 * 0.67, -bodyH * 4);
        ctx.rotate(-p.delta_e * Math.PI / 180);
        ctx.fillStyle = '#000000ff';
        ctx.fillRect(-elevLen / 2, -elevH / 2, elevLen, elevH);
        ctx.restore();
      ctx.restore();                         
      
      requestAnimationFrame(update)
    }

    requestAnimationFrame(update);
  }, [])

  return (
    <div className="App">
      <div className="mainPanel">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
        />
        <input className='soujyukan'
          type="range"
          min="-30"
          max="30"
          defaultValue={0}
          onChange={(e) => { p.delta_e = Number(e.target.value) }} 
        />
        <p>{p.delta_e}</p>
      </div>
    </div>
  )
}
