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
    dure: -0.134,//重心と空力重心のずれ
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

    kp: -3,
    ki: -3,
    kd: -1,

    ipluslimit: 10,
    iminuslimit: -10,
    dTerm: 0, // UI表示用のD項

    //舵角の運動についてのパラメータ
    now_u: 0,
    u: [] as number[],
    mudatime: 0.1,
    tau: 1,
    K: 1,
    delta_eDot: 0,
    pre_delta_e: 0

  });
  const p = pitchParam.current;

  const [, forceRender] = useState(0);

  const lastTime = useRef(0);

  useEffect(() => {
    let animationFrameId: number;
    const update = (timestamp: number) => {
      // dt を計算（秒に変換）
      const dt = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      // 初回はdtが大きすぎるのでスキップ
      if (dt > 0.1) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      const canvas = canvasRef.current
      if (!canvas) return
      
      //無駄時間を再現するためのu配列への登録
      p.u.push(p.now_u);

      // 無駄時間分のサンプル数を超えたら古い値を取り出す
      const delaySamples = Math.max(1, Math.round(p.mudatime / dt));
      const delayedU = p.u.length > delaySamples ? p.u.shift()! : p.u[0];

      //舵角の運動 
      p.delta_eDot = (p.K * delayedU - p.delta_e) / p.tau;
      p.delta_e += p.delta_eDot * dt;

      //機体の運動
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
      p.dTerm = p.kd * derivative; // モニター用に保存
      if (p.usePID) {
        p.now_u = output;
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
      animationFrameId = requestAnimationFrame(update)
    }

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
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
          onChange={(e) => { p.now_u = Number(e.target.value) }}
        />
        <div className='p-4'>
          <EditableTxt def="入力値:" nowvalue={p.now_u} onCommit={(v) => { p.now_u = v }} unit="" />
        </div>
        <div className="p-4 text-lg">
          <EditableTxt def="機体速度" nowvalue={p.V} onCommit={(v: number) => { p.V = v }} unit="m/s" />
          <EditableTxt def="ピッチ角:" nowvalue={p.theta * 180 / Math.PI} onCommit={(v: number) => { p.theta = v * Math.PI / 180 }} unit="°" />
        </div>
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
          <div className='mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-3 font-[JetBrains_Mono]'>
            <h3 className='text-sm font-bold text-gray-500 tracking-wide uppercase font-sans'>PID Monitor</h3>
            <div className='space-y-1'>
              <p className='text-xs text-gray-400 font-sans'>error = target - θ</p>
              <p className='text-lg'>
                <span className={`font-bold ${p.e >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{p.e.toFixed(3)}</span>
                <span className='text-gray-400 text-sm'> = {p.target.toFixed(3)} - {(p.theta * 180 / Math.PI).toFixed(3)}°</span>
              </p>
            </div>
            <hr className='border-gray-200' />
            <div className='space-y-1'>
              <p className='text-xs text-gray-400 font-sans'>δe = Kp·e + Ki·∫e + Kd·ė</p>
              <p className='text-lg'>
                <span className={`font-bold ${p.delta_e >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>{p.delta_e.toFixed(3)}°</span>
              </p>
              <div className='flex gap-4 text-xs text-gray-500'>
                <span>P: <span className='text-gray-700 font-medium'>{(p.kp * p.e).toFixed(3)}</span></span>
                <span>I: <span className='text-gray-700 font-medium'>{(p.ki * p.integral).toFixed(3)}</span></span>
                <span>D: <span className='text-gray-700 font-medium'>{p.dTerm.toFixed(3)}</span></span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
