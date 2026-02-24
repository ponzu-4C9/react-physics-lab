import { useState } from 'react'
import EditableTxt from './EditableTxt'

export default function SettingTab({ useRef }: any) {
    const [activeTab, setActiveTab] = useState(1);

    return (
        <div>
            <div className='flex'>
                <div onClick={() => setActiveTab(1)} className={`p-2  shadow ${activeTab === 1 ? 'border-b-2 border-black-500' : ''}`}>機体設定</div>
                <div onClick={() => setActiveTab(2)} className={`p-2  shadow ${activeTab === 2 ? 'border-b-2 border-black-500' : ''}`}>舵角設定</div>
            </div>
            {activeTab === 1 &&
                <div className="p-4">
                    <EditableTxt def="Iyy: " nowvalue={useRef.current.Iyy} onCommit={(v: number) => { useRef.current.Iyy = v }} unit="kg·m²" />
                    <EditableTxt def="L_main: " nowvalue={useRef.current.L_main} onCommit={(v: number) => { useRef.current.L_main = v }} unit="N" />
                    <EditableTxt def="dure: " nowvalue={useRef.current.dure} onCommit={(v: number) => { useRef.current.dure = v }} unit="m" />
                    <EditableTxt def="rho: " nowvalue={useRef.current.rho} onCommit={(v: number) => { useRef.current.rho = v }} unit="kg/m³" />
                    <EditableTxt def="S_main: " nowvalue={useRef.current.S_main} onCommit={(v: number) => { useRef.current.S_main = v }} unit="m²" />
                    <EditableTxt def="平均翼幻聴: " nowvalue={useRef.current.barc} onCommit={(v: number) => { useRef.current.barc = v }} unit="m" />
                    <EditableTxt def="Cm0: " nowvalue={useRef.current.Cm0} onCommit={(v: number) => { useRef.current.Cm0 = v }} unit="" />
                    <EditableTxt def="l_tail: " nowvalue={useRef.current.l_tail} onCommit={(v: number) => { useRef.current.l_tail = v }} unit="m" />
                    <EditableTxt def="S_tail: " nowvalue={useRef.current.S_tail} onCommit={(v: number) => { useRef.current.S_tail = v }} unit="m²" />
                    <EditableTxt def="揚力傾斜: " nowvalue={useRef.current.elek} onCommit={(v: number) => { useRef.current.elek = v }} unit="" />
                </div>
            }
            {activeTab === 2 &&
                <div className="p-4">
                    <EditableTxt def="tau: " nowvalue={useRef.current.tau} onCommit={(v: number) => { useRef.current.tau = v }} unit="s" />
                    <EditableTxt def="K: " nowvalue={useRef.current.K} onCommit={(v: number) => { useRef.current.K = v }} unit="" />
                </div>
            }
        </div>

    )
}
