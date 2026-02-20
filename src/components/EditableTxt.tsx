import { useState } from 'react'

// EditableTxt.tsx
type Props = {
    onCommit: (value: number) => void
    unit?: string
    nowvalue?: number
}

export default function EditableTxt({ onCommit, unit, nowvalue }: Props) {
    const [editing, setEditing] = useState(false)
    const [text, setText] = useState("")

    if (editing) {
        return (
            <div className='flex'>
                <input
                    type="number"
                    autoFocus
                    defaultValue={nowvalue}
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
                />
                <span className='ml-1'>{unit}</span>
            </div>
        )
    }

    return <p onClick={() => { setEditing(true); setText(nowvalue?.toString() || "") }}>{nowvalue}{unit}</p>
}