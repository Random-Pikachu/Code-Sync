import React, { useState, useRef, useEffect, useContext } from 'react'
import { Play, Trash2, X, ChevronUp, Loader2 } from 'lucide-react'
import { executeCode } from '../../API/execution'
import { CodeDataContext } from '../Sidebar/CodeData'

const LANG_MAP = {
    'js': { id: 102, name: 'JavaScript (Node.js 22.08.0)' },
    'jsx': { id: 102, name: 'JavaScript (Node.js 22.08.0)' },
    'ts': { id: 101, name: 'TypeScript (5.6.2)' },
    'tsx': { id: 101, name: 'TypeScript (5.6.2)' },
    'py': { id: 100, name: 'Python (3.12.5)' },
    'java': { id: 91, name: 'Java (JDK 17.0.6)' },
    'c': { id: 104, name: 'C (Clang 18.1.8)' },
    'cpp': { id: 105, name: 'C++ (GCC 14.1.0)' },
    'go': { id: 107, name: 'Go (1.23.5)' },
    'rs': { id: 108, name: 'Rust (1.85.0)' },
    'rb': { id: 72, name: 'Ruby (2.7.0)' },
    'php': { id: 98, name: 'PHP (8.3.11)' },
    'sh': { id: 46, name: 'Bash (5.0.0)' },
    'bash': { id: 46, name: 'Bash (5.0.0)' },
    'cs': { id: 51, name: 'C# (Mono 6.6.0.161)' },
    'kt': { id: 111, name: 'Kotlin (2.1.10)' },
    'swift': { id: 83, name: 'Swift (5.2.3)' },
    'r': { id: 99, name: 'R (4.4.1)' },
    'scala': { id: 112, name: 'Scala (3.4.2)' },
    'sql': { id: 82, name: 'SQL (SQLite 3.27.2)' },
    'lua': { id: 64, name: 'Lua (5.3.5)' },
    'dart': { id: 90, name: 'Dart (2.19.2)' },
}

const TerminalPanel = ({ isOpen, onClose, getActiveFileContent, activeFileName }) => {
    const [output, setOutput] = useState([])
    const [isRunning, setIsRunning] = useState(false)
    const [panelHeight, setPanelHeight] = useState(250)
    const [stdinInput, setStdinInput] = useState('')
    const [showStdin, setShowStdin] = useState(false)
    const outputRef = useRef(null)
    const resizeRef = useRef(null)
    const startYRef = useRef(0)
    const startHeightRef = useRef(0)

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight
        }
    }, [output])

    const getLangInfo = (fileName) => {
        if (!fileName) return null
        const ext = fileName.split('.').pop().toLowerCase()
        return LANG_MAP[ext] || null
    }

    const runCode = async () => {
        const code = getActiveFileContent?.()
        if (!code && code !== '') {
            addOutput('error', 'No file is open to run.')
            return
        }

        const langInfo = getLangInfo(activeFileName)
        if (!langInfo) {
            addOutput('error', `Unsupported language for file: ${activeFileName}`)
            return
        }

        setIsRunning(true)
        addOutput('system', `$ Running ${activeFileName} (${langInfo.name})...`)

        const startTime = performance.now()

        try {
            const result = await executeCode(langInfo.id, code, stdinInput)
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(2)

            if (result.compile_output) {
                addOutput('stderr', result.compile_output)
            }
            if (result.stdout) {
                addOutput('stdout', result.stdout)
            }
            if (result.stderr) {
                addOutput('stderr', result.stderr)
            }
            if (!result.stdout && !result.stderr && !result.compile_output) {
                addOutput('system', '(no output)')
            }

            const statusDesc = result.status?.description || 'Unknown'
            const isSuccess = result.status?.id === 3 // 3 = Accepted
            addOutput(isSuccess ? 'success' : 'error', `\n[Done] ${statusDesc} in ${elapsed}s (${result.time || '?'}s CPU, ${result.memory ? (result.memory / 1024).toFixed(1) + 'MB' : '?'} memory)`)
        } catch (error) {
            addOutput('error', `Execution failed: ${error.response?.data?.error || error.message}`)
        } finally {
            setIsRunning(false)
        }
    }

    const addOutput = (type, text) => {
        setOutput(prev => [...prev, { type, text, id: Date.now() + Math.random() }])
    }

    const clearOutput = () => {
        setOutput([])
    }

    const handleResizeStart = (e) => {
        e.preventDefault()
        startYRef.current = e.clientY
        startHeightRef.current = panelHeight

        const handleMouseMove = (e) => {
            const diff = startYRef.current - e.clientY
            const newHeight = Math.min(Math.max(startHeightRef.current + diff, 120), window.innerHeight * 0.6)
            setPanelHeight(newHeight)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const getOutputColor = (type) => {
        switch (type) {
            case 'stderr':
            case 'error': return 'text-red-400'
            case 'success': return 'text-green-400'
            case 'system': return 'text-slate-400'
            default: return 'text-slate-200'
        }
    }

    if (!isOpen) return null

    return (
        <div className="flex flex-col bg-background-dark border-t border-border-color shrink-0" style={{ height: panelHeight }}>
            {/* Resize Handle */}
            <div
                className="h-[3px] cursor-ns-resize hover:bg-[#007fd4] transition-colors shrink-0"
                onMouseDown={handleResizeStart}
            />

            {/* Header */}
            <div className="h-8 flex items-center px-3 gap-2 border-b border-border-color shrink-0 select-none">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Terminal</span>

                <div className="ml-auto flex items-center gap-1">
                    {/* Stdin Toggle */}
                    <button
                        onClick={() => setShowStdin(prev => !prev)}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${showStdin ? 'bg-[#007fd4]/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                        title="Toggle stdin input"
                    >
                        stdin
                    </button>

                    {/* Run Button */}
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="p-1 text-slate-400 hover:text-green-400 transition-colors disabled:opacity-50"
                        title="Run active file"
                    >
                        {isRunning ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                    </button>

                    {/* Clear */}
                    <button
                        onClick={clearOutput}
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Clear terminal"
                    >
                        <Trash2 size={14} />
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Close terminal"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Stdin Input */}
            {showStdin && (
                <div className="flex items-start gap-2 px-3 py-1.5 border-b border-border-color shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 pt-1.5">stdin</span>
                    <textarea
                        value={stdinInput}
                        onChange={(e) => setStdinInput(e.target.value)}
                        placeholder={"Enter input for program...\nEach line is a separate input"}
                        rows={3}
                        className="flex-1 bg-[#0a0a0a] text-[12px] text-slate-200 border border-border-color outline-none px-2 py-1.5 rounded font-mono placeholder-slate-600 focus:border-[#007fd4] transition-colors resize-y min-h-[36px] max-h-[200px] custom-scrollbar"
                    />
                </div>
            )}

            {/* Output Area */}
            <div
                ref={outputRef}
                className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 font-mono text-[13px] leading-5"
            >
                {output.length === 0 ? (
                    <div className="text-slate-600 text-[12px] select-none">
                        Press <span className="text-slate-500">▶ Run</span> to execute the active file.
                    </div>
                ) : (
                    output.map((line) => (
                        <pre key={line.id} className={`${getOutputColor(line.type)} whitespace-pre-wrap break-words m-0`}>
                            {line.text}
                        </pre>
                    ))
                )}
            </div>
        </div>
    )
}

export default TerminalPanel
