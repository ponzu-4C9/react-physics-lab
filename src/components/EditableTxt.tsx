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
        <div className='flex'>
            <p className='mr-1'>{def}</p>
            {editing ?
                <input
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
                <p className='shadow' onClick={() => {
                    setEditing(true);
                    setText(String(nowvalue))
                }}>{nowvalue}</p>
            }
            <span className='ml-1'>{unit}</span>
        </div>
    )

}