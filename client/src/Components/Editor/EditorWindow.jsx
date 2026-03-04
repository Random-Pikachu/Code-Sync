import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import * as Monaco from 'monaco-editor'
import { Editor, useMonaco } from '@monaco-editor/react'
import { initializeSocket } from '../../Connection/socket'
import { useLocation, useParams } from 'react-router-dom'
import { inputContext } from '../../Context/CodeInput'
import { CodeDataContext } from '../Sidebar/CodeData'
import randomcolor from 'randomcolor'
import hexRgb from 'hex-rgb'
import toast, { Toaster } from 'react-hot-toast'
import { X } from 'lucide-react'
import { Icon } from '@iconify/react'
import WelcomeScreen from './WelcomeScreen'


const EditorWindow = () => {
    const { languageName } = useContext(inputContext)
    const socketRef = useRef(null)

    const [openTabs, setOpenTabs] = useState([])
    const [activeTabId, setActiveTabId] = useState(null)

    const editorRef = useRef()
    const monaco = useMonaco()

    const [peerPosition, setPeerPosition] = useState({})
    const [cursorDecorations, setCursorDecorations] = useState({})
    const userColorsRef = useRef({})
    const isRemoteChange = useRef(false)
    const saveTimerRef = useRef(null)
    const cursorTimerRef = useRef(null)
    const activeTabIdRef = useRef(null)
    const tabContentRef = useRef({})
    const openTabIdsRef = useRef(new Set())

    const { data, setData, fileId, setFileId, fileName, setFileName, fileStruct, RoomId, setRoomId } = useContext(CodeDataContext)

    const findFileContent = (struct, targetId) => {
        for (const item of struct) {
            if (item.id === targetId && !item.isFolder) return item.content || ''
            if (item.isFolder && item.children) {
                const found = findFileContent(item.children, targetId)
                if (found !== null) return found
            }
        }
        return null
    }

    useEffect(() => {
        activeTabIdRef.current = activeTabId
    }, [activeTabId])

    useEffect(() => {
        if (!fileId || !fileName) return

        if (openTabIdsRef.current.has(fileId)) {
            setActiveTabId(fileId)
            return
        }

        openTabIdsRef.current.add(fileId)

        const localContent = findFileContent(fileStruct, fileId) || ''
        tabContentRef.current[fileId] = localContent

        if (socketRef.current) {
            socketRef.current.emit('file-open', { RoomID, fileId })
        }

        setOpenTabs(prev => [...prev, { id: fileId, name: fileName, content: localContent }])
        setActiveTabId(fileId)
    }, [fileId, fileName])

    useEffect(() => {
        if (!activeTabId || !editorRef.current) return
        const model = editorRef.current.getModel()
        if (!model) return

        const content = tabContentRef.current[activeTabId] ?? ''
        isRemoteChange.current = true
        model.setValue(content)
        isRemoteChange.current = false
    }, [activeTabId])


    const closeTab = (tabId, e) => {
        e?.stopPropagation()
        delete tabContentRef.current[tabId]
        openTabIdsRef.current.delete(tabId)

        const updated = openTabs.filter(t => t.id !== tabId)

        if (activeTabId === tabId) {
            if (updated.length > 0) {
                const lastTab = updated[updated.length - 1]
                setActiveTabId(lastTab.id)
                setFileId(lastTab.id)
                setFileName(lastTab.name)
            } else {
                setActiveTabId(null)
                setFileId('')
                setFileName('')
            }
        }

        setOpenTabs(updated)
    }

    const switchTab = (tab) => {
        if (editorRef.current && activeTabIdRef.current) {
            const model = editorRef.current.getModel()
            if (model) tabContentRef.current[activeTabIdRef.current] = model.getValue()
        }

        setActiveTabId(tab.id)
        setFileId(tab.id)
        setFileName(tab.name)
    }


    const updateCursorDecorations = () => {
        if (!editorRef.current) return;

        const newDecorationMap = {}

        Object.keys(peerPosition).forEach((userName) => {
            if (userName === (location.state?.userName || "Anonymous")) return
            const posData = peerPosition[userName]
            if (!posData || posData.fileId !== activeTabIdRef.current) return

            const position = posData.position

            if (!userColorsRef.current[userName]) {
                userColorsRef.current[userName] = randomcolor({
                    luminosity: 'light',
                    format: 'hex'
                })
            }
            const userColor = userColorsRef.current[userName];

            const decoration = {
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1),
                options: {
                    className: `remote-cursor cursor-${userName.replace(/\s+/g, "-")}`,
                    hoverMessage: { value: userName },
                }
            }

            newDecorationMap[userName] = [decoration]
            addCursorStyle(userName, userColor, position.lineNumber)
        })

        const updatedDecorations = {}

        Object.keys(newDecorationMap).forEach(userName => {
            const oldUserDecorations = cursorDecorations[userName] || []
            const newUserDecorations = editorRef.current.deltaDecorations(oldUserDecorations, newDecorationMap[userName])
            updatedDecorations[userName] = newUserDecorations
        })

        Object.keys(cursorDecorations).forEach(userName => {
            if (!newDecorationMap[userName]) {
                editorRef.current.deltaDecorations(cursorDecorations[userName], [])
            }
        })

        setCursorDecorations(updatedDecorations)
    }


    const addCursorStyle = (userName, userColor, lineNumber) => {
        const styleId = `cursor-${userName.replace(/\s+/g, '-')}`
        let styelEl = document.getElementById(styleId)

        if (!styelEl) {
            styelEl = document.createElement('style')
            styelEl.id = styleId
            document.head.appendChild(styelEl)
        }

        const bgColor = hexToRgb(userColor, 0.5)
        const topPosition = lineNumber === 1 ? "24px" : "-24px"

        styelEl.innerHTML = `
            .cursor-${userName.replace(/\s+/g, '-')} {
                background-color: ${bgColor};
                width: 4px !important;
                position: relative;
            }

            .cursor-${userName.replace(/\s+/g, '-')}::after{
                content: '${userName}';
                position: absolute;
                min-width: ${userName.length * 8}px;
                padding: 2px 4px;
                color: white;
                height: 26px;
                top: ${topPosition};
                left: 0;
                background-color: ${bgColor};
                z-index: ${1000 + lineNumber};
                white-space: nowrap;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 3px;
            }
        `
    }


    const hexToRgb = (hex, opacity) => {
        hex = hex.replace(/^#/, "")
        let r = parseInt(hex.substring(0, 2), 16)
        let g = parseInt(hex.substring(2, 4), 16)
        let b = parseInt(hex.substring(4, 6), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
    };

    const onMount = (editor) => {
        if (!editor) return;
        editorRef.current = editor

        editor.onDidChangeCursorPosition((event) => {
            const position = event.position;

            if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current)
            cursorTimerRef.current = setTimeout(() => {
                if (socketRef.current) {
                    socketRef.current.emit('cursor-position', {
                        RoomID,
                        position,
                        userName: location.state?.userName || "Anonymous",
                        fileId: activeTabIdRef.current
                    })
                }
            }, 50)
        })

        editor.focus();

        if (activeTabIdRef.current) {
            const content = tabContentRef.current[activeTabIdRef.current] ?? ''
            if (content) {
                isRemoteChange.current = true
                editor.getModel().setValue(content)
                isRemoteChange.current = false
            }
        }
    }

    useEffect(() => {
        if (!monaco) return;

        monaco.editor.defineTheme("CustomDark", {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: "comment", foreground: "a1a1a1" },
                { token: "string", foreground: "58c760" },
                { token: "keyword", foreground: "f05b8d" },
                { token: "keyword.operator", foreground: "f05b8d" },
                { token: "storage", foreground: "f05b8d" },
                { token: "storage.type", foreground: "f05b8d" },
                { token: "constant", foreground: "62a6ff" },
                { token: "entity", foreground: "62a6ff" },
                { token: "entity.name", foreground: "62a6ff" },
                { token: "entity.name.function", foreground: "b675f1" },
                { token: "entity.other.attribute-name", foreground: "b675f1" },
                { token: "support", foreground: "f05b8d" },
                { token: "support.type", foreground: "62a6ff" },
                { token: "support.class.component", foreground: "62a6ff" },
                { token: "variable", foreground: "ededed" },
                { token: "variable.parameter", foreground: "ededed" },
                { token: "variable.other", foreground: "ededed" },
                { token: "invalid", foreground: "f05b8d" },
                { token: "tag", foreground: "58c760" },
                { token: "attribute.name", foreground: "b675f1" },
                { token: "attribute.value", foreground: "58c760" },
                { token: "number", foreground: "62a6ff" },
                { token: "type", foreground: "62a6ff" },
                { token: "delimiter", foreground: "ededed" },
                { token: "delimiter.bracket", foreground: "ededed" },
            ],
            colors: {
                "editor.background": "#0a0a0a",
                "editor.foreground": "#ededed",
                "editor.lineHighlightBackground": "#ffffff1a",
                "editor.selectionBackground": "#ffffff1a",
                "editor.inactiveSelectionBackground": "#ffffff1a",
                "editorCursor.foreground": "#ededed",
                "editorLineNumber.foreground": "#878787",
                "editorLineNumber.activeForeground": "#a1a1a1",
                "editorIndentGuide.background1": "#242424",
                "editorIndentGuide.activeBackground1": "#242424",
                "editorBracketMatch.background": "#ffffff1a",
                "editorBracketMatch.border": "#00000000",
                "editorGutter.addedBackground": "#58c760",
                "editorGutter.deletedBackground": "#f05b8d",
                "editorGutter.modifiedBackground": "#f99902",
                "editorOverviewRuler.border": "#000000",
                "editorWidget.background": "#000000",
                "editorWidget.border": "#333333",
                "editorHoverWidget.background": "#000000",
                "editorWhitespace.foreground": "#878787",
                "editor.findMatchBackground": "#f9990288",
                "editor.findMatchHighlightBackground": "#f9990222",
                "editor.wordHighlightBackground": "#ffffff1a",
                "scrollbar.shadow": "#00000000",
                "scrollbarSlider.background": "#333333",
                "scrollbarSlider.hoverBackground": "#333333",
                "scrollbarSlider.activeBackground": "#333333",
            }
        })

        monaco.editor.setTheme("CustomDark")

    }, [monaco])

    useEffect(() => {
        updateCursorDecorations()
    }, [peerPosition])

    const location = useLocation()
    const { RoomID } = useParams()

    useEffect(() => {
        setRoomId(RoomID)
    }, [RoomId])


    useEffect(() => {
        const setupSocket = async () => {

            socketRef.current = await initializeSocket()

            socketRef.current.emit('join', {
                RoomID,
                userName: location.state?.userName || "Anonymous",
            })

            socketRef.current.on('joined', ({ clients, userName, socketId }) => {
                if (!userColorsRef.current[userName]) {
                    userColorsRef.current[userName] = randomcolor({
                        luminosity: 'light',
                        format: 'hex'
                    })
                }
            })

            socketRef.current.on('code-change', ({ fileId: changedFileId, value }) => {
                const targetFileId = changedFileId || activeTabIdRef.current
                if (!targetFileId) return

                tabContentRef.current[targetFileId] = value

                if (targetFileId === activeTabIdRef.current && editorRef.current) {
                    const editor = editorRef.current
                    const model = editor.getModel()
                    if (!model) return
                    const currentValue = model.getValue()

                    if (currentValue === value) return

                    const position = editor.getPosition()
                    const selections = editor.getSelections()
                    isRemoteChange.current = true
                    model.setValue(value)
                    isRemoteChange.current = false
                    if (position) editor.setPosition(position)
                    if (selections) editor.setSelections(selections)
                }

                setOpenTabs(prev => prev.map(tab =>
                    tab.id === targetFileId ? { ...tab, content: value } : tab
                ))
            })

            socketRef.current.on('file-opened', ({ fileId: openedFileId, content }) => {
                tabContentRef.current[openedFileId] = content

                setOpenTabs(prev => prev.map(tab =>
                    tab.id === openedFileId ? { ...tab, content } : tab
                ))

                if (openedFileId === activeTabIdRef.current && editorRef.current) {
                    const model = editorRef.current.getModel()
                    if (model) {
                        isRemoteChange.current = true
                        model.setValue(content)
                        isRemoteChange.current = false
                    }
                }
            })

            socketRef.current.on('file-content-updated', ({ fileId: updatedFileId, newContent }) => {
                tabContentRef.current[updatedFileId] = newContent

                setOpenTabs(prev => prev.map(tab =>
                    tab.id === updatedFileId ? { ...tab, content: newContent } : tab
                ))

                if (updatedFileId === activeTabIdRef.current && editorRef.current) {
                    const model = editorRef.current.getModel()
                    if (!model) return
                    const currentValue = model.getValue()
                    if (currentValue === newContent) return

                    const position = editorRef.current.getPosition()
                    const selections = editorRef.current.getSelections()
                    isRemoteChange.current = true
                    model.setValue(newContent)
                    isRemoteChange.current = false
                    if (position) editorRef.current.setPosition(position)
                    if (selections) editorRef.current.setSelections(selections)
                }
            })

            socketRef.current.on('user-disconnected', ({ userName }) => {
                setPeerPosition((prev) => {
                    const newPositions = { ...prev }
                    delete newPositions[userName]
                    return newPositions
                })

                const styleId = `cursor-${userName.replace(/\s+/g, '-')}`
                const styleEl = document.getElementById(styleId)
                if (styleEl) {
                    styleEl.remove()
                }

                if (userColorsRef.current[userName]) {
                    delete userColorsRef.current[userName]
                }
            })

            socketRef.current.on('cursor-position', ({ position, userName, fileId: cursorFileId }) => {
                if (!socketRef.current) return;

                setPeerPosition((prev) => ({
                    ...prev,
                    [userName]: { position, fileId: cursorFileId }
                }))
            })

        };

        setupSocket()

        return () => {
            if (socketRef.current) {
                socketRef.current.off('joined')
                socketRef.current.off('code-change')
                socketRef.current.off('file-opened')
                socketRef.current.off('file-content-updated')
                socketRef.current.off('user-disconnected')
                socketRef.current.off('cursor-position')
            }

            if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
            if (cursorTimerRef.current) clearTimeout(cursorTimerRef.current)

            Object.keys(userColorsRef.current).forEach(userName => {
                const styleId = `cursor-${userName.replace(/\s+/g, '-')}`
                const styleEl = document.getElementById(styleId)
                if (styleEl) {
                    styleEl.remove()
                }
            })
        }

    }, [])


    const getVscodeIcon = (name) => {
        if (!name) return 'vscode-icons:default-file'
        const ext = name.split('.').pop().toLowerCase()
        const iconMap = {
            'js': 'vscode-icons:file-type-js-official',
            'jsx': 'vscode-icons:file-type-reactjs',
            'ts': 'vscode-icons:file-type-typescript-official',
            'tsx': 'vscode-icons:file-type-reactts',
            'css': 'vscode-icons:file-type-css',
            'scss': 'vscode-icons:file-type-scss',
            'html': 'vscode-icons:file-type-html',
            'json': 'vscode-icons:file-type-json',
            'md': 'vscode-icons:file-type-markdown',
            'py': 'vscode-icons:file-type-python',
            'java': 'vscode-icons:file-type-java',
            'c': 'vscode-icons:file-type-c',
            'cpp': 'vscode-icons:file-type-cpp',
            'go': 'vscode-icons:file-type-go',
            'rs': 'vscode-icons:file-type-rust',
            'rb': 'vscode-icons:file-type-ruby',
            'php': 'vscode-icons:file-type-php',
            'svg': 'vscode-icons:file-type-svg',
            'sh': 'vscode-icons:file-type-shell',
            'bash': 'vscode-icons:file-type-shell',
            'sql': 'vscode-icons:file-type-sql',
            'xml': 'vscode-icons:file-type-xml',
            'yml': 'vscode-icons:file-type-yaml',
            'yaml': 'vscode-icons:file-type-yaml',
            'env': 'vscode-icons:file-type-dotenv',
            'txt': 'vscode-icons:file-type-text',
        }
        return iconMap[ext] || 'vscode-icons:default-file'
    }

    const getLanguageFromFileName = (name) => {
        if (!name) return 'plaintext'
        const ext = name.split('.').pop().toLowerCase()
        const langMap = {
            js: 'javascript', jsx: 'javascript',
            ts: 'typescript', tsx: 'typescript',
            css: 'css', scss: 'scss',
            html: 'html',
            json: 'json',
            md: 'markdown',
            py: 'python',
            java: 'java',
            c: 'c', cpp: 'cpp',
            go: 'go', rs: 'rust',
            rb: 'ruby', php: 'php',
            sh: 'shell', bash: 'shell',
            sql: 'sql', xml: 'xml',
            yaml: 'yaml', yml: 'yaml',
        }
        return langMap[ext] || 'plaintext'
    }

    const activeTab = openTabs.find(t => t.id === activeTabId)
    const editorLanguage = activeTab ? getLanguageFromFileName(activeTab.name) : (languageName === 'c++' ? 'cpp' : languageName)


    return (
        <main className="flex-1 flex flex-col min-w-0 bg-editor-bg overflow-hidden">
            {openTabs.length === 0 ? (
                <WelcomeScreen />
            ) : (
                <>
                    <div className="h-9 flex items-center bg-background-dark overflow-x-auto select-none custom-scrollbar shrink-0 border-b border-border-color">
                        {openTabs.map(tab => {
                            const isActive = tab.id === activeTabId
                            return (
                                <div
                                    key={tab.id}
                                    onClick={() => switchTab(tab)}
                                    className={`relative flex items-center h-full px-3 gap-2 min-w-[120px] max-w-[180px] cursor-pointer transition-all duration-200 shrink-0 border-r border-border-color
                                        ${isActive
                                            ? 'bg-editor-bg text-slate-200'
                                            : 'bg-background-dark text-slate-500 hover:text-slate-400 hover:bg-[#0a0a0a]'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
                                    )}
                                    <Icon icon={getVscodeIcon(tab.name)} className="text-[16px] shrink-0" />
                                    <span className="text-[12px] truncate">{tab.name}</span>
                                    <X
                                        size={13}
                                        className={`shrink-0 ml-auto rounded-sm p-[1px] transition-colors duration-150
                                            ${isActive
                                                ? 'text-slate-500 hover:text-slate-200 hover:bg-white/10'
                                                : 'opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-300 hover:bg-white/10'
                                            }`}
                                        onClick={(e) => closeTab(tab.id, e)}
                                    />
                                </div>
                            )
                        })}
                        <div className="flex-1 bg-background-dark"></div>
                    </div>

                    <div className="flex-1 flex overflow-hidden w-full relative">
                        <div id='code-editor' className="flex-1 overflow-hidden h-full w-full">
                            <Editor
                                height="100%"
                                language={editorLanguage}
                                theme='CustomDark'
                                onMount={onMount}

                                defaultValue=""
                                onChange={(value) => {
                                    if (isRemoteChange.current) return

                                    const currentFileId = activeTabIdRef.current
                                    if (!currentFileId) return

                                    tabContentRef.current[currentFileId] = value

                                    socketRef.current.emit('code-change', {
                                        RoomID,
                                        fileId: currentFileId,
                                        value
                                    })

                                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
                                    saveTimerRef.current = setTimeout(() => {
                                        if (socketRef.current) {
                                            socketRef.current.emit('update-file-content', {
                                                RoomID,
                                                fileId: currentFileId,
                                                newContent: value
                                            })
                                        }
                                    }, 1000)
                                }}

                                options={{
                                    fontFamily: "'Dank Mono', 'Cascadia Code', 'JetBrains Mono', 'Fira Code'",
                                    fontSize: 16,
                                    fontLigatures: true,
                                    minimap: { enabled: false },
                                    scrollbar: {
                                        vertical: 'hidden',
                                        horizontal: 'hidden'
                                    }
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            <Toaster />
        </main>
    )
}

export default EditorWindow