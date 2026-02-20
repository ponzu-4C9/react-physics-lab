import { useRef, useEffect, useState } from 'react'
import EditableTxt from './components/EditableTxt'
import SettingTab from './components/SettingTab'
import './App.css'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pitchParam = useRef({
    theta: 0,
    thetaDot: 0,

    V: 8,//m/s 機体速度

    delta_e: 0, //舵角

    Iyy: 197,
    L_main: 1960,//機体重量が200kgだから
    dure: 0.134,//重心と空力重心のずれ
    rho: 1.225,
    S_main: 45.6,
    barc: 1.2,
    Cm0: -0.13,

    l_tail: 5.79,//重心と尾翼までの長さ
    S_tail: 3.22,//エレベーターの面積

    elek: 4.54,//エレベーターの揚力傾斜


    //PID制御のためのパラメータ
    usePID: false,

    e: 0,

    target: 0,
    pre_error: 0,
    integral: 0,

    kp: -1,
    ki: -1,
    kd: -1,

    ipluslimit: 10,
    iminuslimit: -10
  });
  const p = pitchParam.current;

  const [, forceRender] = useState(0);

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
        p.delta_e * Math.PI / 180 +
        Math.atan(p.thetaDot * p.l_tail * (1 / p.V))
      )

      const M_tail = -p.l_tail *
        (1 / 2) *
        p.rho * p.V * p.V *
        p.S_tail * C_L_tail;

      const M_ac = (1 / 2) * p.rho * p.V * p.V *
        p.S_main * p.barc * p.Cm0

      const M_main = (-1) * p.L_main * p.dure + M_ac;

      p.thetaDot += (M_main / (p.Iyy) + M_tail / (p.Iyy)) * dt;
      p.theta += p.thetaDot * dt;

      //PID制御
      p.e = p.target - p.theta * 180 / Math.PI;

      p.integral += p.e * dt;
      // 積分のクリッピング
      if (p.integral > p.ipluslimit) p.integral = p.ipluslimit;
      if (p.integral < p.iminuslimit) p.integral = p.iminuslimit;

      const derivative = dt > 0.001 ? (p.e - p.pre_error) / dt : 0;
      const output = p.kp * p.e + p.ki * p.integral + p.kd * derivative;
      if (p.usePID) {
        p.delta_e = output;
      }
      p.pre_error = p.e;



      //びょうが
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
      forceRender(c => c + 1);
      requestAnimationFrame(update)
    }

    requestAnimationFrame(update);
  }, [])

  return (
    <div className="App">
      <div className="flex">
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
          disabled={p.usePID}
          onChange={(e) => { p.delta_e = Number(e.target.value) }}
        />
        <EditableTxt def="舵角:" nowvalue={p.delta_e} onCommit={(v) => { p.delta_e = v }} unit="°" />
      </div>
      <SettingTab useRef={pitchParam} />
      <div className="p-4">
        <div className='flex'>
          <button className='p-2 shadow' onClick={() => { p.usePID = !p.usePID; }}>PID制御</button>
        </div>
        <div className={`${p.usePID ? '' : 'pointer-events-none opacity-50'}`}>
          <div className='flex'>
            <div>
              <div className='flex p-2 space-x-8'>
                <EditableTxt def="Pゲイン:" nowvalue={p.kp} onCommit={(v) => { p.kp = v }} unit="" />
                <EditableTxt def="Iゲイン:" nowvalue={p.ki} onCommit={(v) => { p.ki = v }} unit="" />
                <EditableTxt def="Dゲイン:" nowvalue={p.kd} onCommit={(v) => { p.kd = v }} unit="" />
              </div>
              <div className='flex p-2 space-x-8'>
                <EditableTxt def="I積分上限:" nowvalue={p.ipluslimit} onCommit={(v) => { p.ipluslimit = v }} unit="" />
                <EditableTxt def="I積分下限:" nowvalue={p.iminuslimit} onCommit={(v) => { p.iminuslimit = v }} unit="" />
              </div>
            </div>
            <div className='flex items-center'>
              <input className='soujyukan'
                type="range"
                min="-30"
                max="30"
                defaultValue={0}
                onChange={(e) => { p.target = Number(e.target.value) }}
              />
              <EditableTxt def="目標ピッチ角:" nowvalue={p.target} onCommit={(v) => { p.target = v }} unit="°" />
            </div>
          </div>
          <div className='p-2 space-x-8 '>
            <p>error = 目標ピッチ角 - 現在のピッチ角（度）</p>
            <p>{p.e} = {p.target} - {p.theta * 180 / Math.PI}</p>
          </div>
          <div className='p-2 space-x-8 '>
            <p>舵角 = pゲイン*エラー + iゲイン*積分 + dゲイン*微分</p>
            <p>{p.delta_e} = {p.kp} * {p.e} + {p.ki} * {p.integral} + {p.kd}  * {(p.e - p.pre_error) / 0.01}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
