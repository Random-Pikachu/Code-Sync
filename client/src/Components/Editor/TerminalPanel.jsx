import React, { useState, useRef, useEffect, useContext } from 'react'
import { Play, Trash2, X, ChevronUp, Loader2 } from 'lucide-react'
import { executeCode } from '../../API/execution'
import { CodeDataContext } from '../Sidebar/CodeData'

const LANG_MAP = {
    'js': { language: 'javascript', version: '1.32.3' },
    'jsx': { language: 'javascript', version: '1.32.3' },
    'ts': { language: 'typescript', version: '5.0.3' },
    'tsx': { language: 'typescript', version: '5.0.3' },
    'py': { language: 'python', version: '3.10.0' },
    'java': { language: 'java', version: '15.0.2' },
    'c': { language: 'c', version: '10.2.0' },
    'cpp': { language: 'c++', version: '10.2.0' },
    'go': { language: 'go', version: '1.16.2' },
    'rs': { language: 'rust', version: '1.68.2' },
    'rb': { language: 'ruby', version: '3.0.1' },
    'php': { language: 'php', version: '8.2.3' },
    'sh': { language: 'bash', version: '5.2.0' },
    'bash': { language: 'bash', version: '5.2.0' },
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
        addOutput('system', `$ Running ${activeFileName} (${langInfo.language} ${langInfo.version})...`)

        const startTime = performance.now()

        try {
            const response = await executeCode(langInfo.language, langInfo.version, code, stdinInput)
            const result = response.run
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(2)

            if (result.stdout) {
                addOutput('stdout', result.stdout)
            }
            if (result.stderr) {
                addOutput('stderr', result.stderr)
            }
            if (!result.stdout && !result.stderr) {
                addOutput('system', '(no output)')
            }

            const exitCode = result.code ?? 0
            const status = exitCode === 0 ? 'success' : 'error'
            addOutput(status, `\n[Done] exited with code ${exitCode} in ${elapsed}s`)
        } catch (error) {
            addOutput('error', `Execution failed: ${error.message}`)
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
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border-color shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0">stdin</span>
                    <input
                        type="text"
                        value={stdinInput}
                        onChange={(e) => setStdinInput(e.target.value)}
                        placeholder="Enter input for program..."
                        className="flex-1 bg-[#0a0a0a] text-[12px] text-slate-200 border border-border-color outline-none px-2 py-1 rounded font-mono placeholder-slate-600 focus:border-[#007fd4] transition-colors"
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
