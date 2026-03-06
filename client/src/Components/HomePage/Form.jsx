import React, { useState } from 'react'
import { v4 } from 'uuid'
import { useNavigate } from 'react-router-dom'

const Form = () => {
    const navigate = useNavigate()

    const [roomId, setRoomId] = useState('')
    const [userName, setUsername] = useState('')
    const [mode, setMode] = useState('join') // 'join' or 'create'

    const handleAction = () => {
        if (!userName) return;

        let targetRoomId = roomId;

        if (mode === 'create') {
            targetRoomId = v4();
            setRoomId(targetRoomId); // Optional, but good if they navigate back
        } else if (!targetRoomId) {
            return; // Requires Room ID to join
        }

        navigate(`/text-editor/${targetRoomId}`, {
            state: {
                userName
            },
            replace: true
        })
    }

    return (
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm w-full text-left">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{mode === 'join' ? 'Join a session' : 'Create a session'}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Jump straight into a collaborative workspace with your team.</p>
            </div>
            <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-8">
                <button
                    onClick={() => setMode('join')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-all ${mode === 'join' ? 'text-slate-900 dark:text-white border-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Join Room
                </button>
                <button
                    onClick={() => setMode('create')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-all ${mode === 'create' ? 'text-slate-900 dark:text-white border-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Create Room
                </button>
            </div>

            <form className={`grid grid-cols-1 ${mode === 'join' ? 'md:grid-cols-2' : ''} gap-6 mb-8`} onSubmit={(e) => { e.preventDefault(); handleAction(); }}>
                {mode === 'join' && (
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Room ID</label>
                        <input
                            type="text"
                            name="roomId"
                            onChange={(e) => setRoomId(e.target.value)}
                            value={roomId}
                            placeholder="e.g. ALPHA-DELTA-9"
                            className="w-full h-12 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Username</label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Display name"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleAction();
                            }
                        }}
                        className="w-full h-12 px-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>
            </form>

            <button
                type="button"
                onClick={handleAction}
                className="w-full h-12 bg-[#d4d4d4] text-black text-sm font-bold rounded-lg hover:bg-[#c0c0c0] transition-colors"
            >
                {mode === 'join' ? 'Join Room' : 'Start Session'}
            </button>
        </div>
    )
}

export default Form