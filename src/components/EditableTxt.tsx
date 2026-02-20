import { useState } from 'react'

// EditableTxt.tsx
type Props = {
    def: string
    onCommit: (value: number) => void
    unit?: string
    nowvalue?: number
}

export default function EditableTxt({ def, onCommit, unit, nowvalue }: Props) {
    const [editing, setEditing] = useState(false)
    const [text, setText] = useState("")

    return (
        <div className='flex shadow' onClick={() => {
            setEditing(true);
            setText(String(nowvalue))
        }}>
            <p className='mr-1'>{def}</p>
            {editing ?
                <input
                    className='outline-none'
                    type="number"
                    autoFocus
                    defaultValue={nowvalue}
                    style={{ width: `${(text.length || 1) + 2}ch` }}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={() => {
                        onCommit(Number(text))
                        setEditing(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onCommit(Number(text))
                            setEditing(false)
                        }
                        if (e.key === 'Escape') setEditing(false)
                    }}
                /> :
                <p>{nowvalue?.toFixed(3)}</p>
            }
            <span className='ml-1'>{unit}</span>
        </div>
    )

}