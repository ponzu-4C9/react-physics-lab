import { useState } from 'react'
import EditableTxt from './EditableTxt'

export default function SettingTab({ useRef }: any) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div>
            <div className='flex'>
                <div onClick={() => setActiveTab(0)} className={`p-2  ${activeTab === 0 ? 'border-b-2 border-blue-500' : ''}`}>基本設定</div>
                <div onClick={() => setActiveTab(1)} className={`p-2  ${activeTab === 1 ? 'border-b-2 border-blue-500' : ''}`}>詳細設定</div>
            </div>
            {activeTab === 0 &&
                <div className="p-4">
                    <EditableTxt def="機体速度" nowvalue={useRef.current.V} onCommit={(v: number) => { useRef.current.V = v }} unit="m/s" />
                    <EditableTxt def="ピッチ角:" nowvalue={useRef.current.theta * 180 / Math.PI} onCommit={(v: number) => { useRef.current.theta = v * Math.PI / 180 }} unit="°" />
                </div>
            }
        </div>

    )
}
