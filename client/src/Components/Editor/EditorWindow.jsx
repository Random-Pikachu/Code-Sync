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
import WelcomeScreen from './WelcomeScreen'


const EditorWindow = () => {
    const { languageName } = useContext(inputContext)
    const socketRef = useRef(null)

    // Multi-tab state: array of { id, name, content }
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

    // Per-file content cache — keeps content for all open tabs
    const tabContentRef = useRef({})

    // Track open tab IDs via ref to avoid stale closure issues
    const openTabIdsRef = useRef(new Set())


    const { data, setData, fileId, setFileId, fileName, setFileName, fileStruct, RoomId, setRoomId } = useContext(CodeDataContext)

    // Helper: find file content from the local file structure tree
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

    // Keep activeTabId ref in sync so closures always have the latest value
    useEffect(() => {
        activeTabIdRef.current = activeTabId
    }, [activeTabId])


    // When fileId changes from the file tree, open/activate the tab
    useEffect(() => {
        if (!fileId || !fileName) return

        // If tab is already open, just switch to it
        if (openTabIdsRef.current.has(fileId)) {
            setActiveTabId(fileId)
            return
        }

        // Mark this tab as open
        openTabIdsRef.current.add(fileId)

        // Load content from local file structure (instant, no server round-trip)
        const localContent = findFileContent(fileStruct, fileId) || ''
        tabContentRef.current[fileId] = localContent

        // Also request latest from server (in case another user edited it)
        if (socketRef.current) {
            socketRef.current.emit('file-open', { RoomID, fileId })
        }

        // Add the new tab with content already loaded
        setOpenTabs(prev => [...prev, { id: fileId, name: fileName, content: localContent }])
        setActiveTabId(fileId)
    }, [fileId, fileName])


    // When switching tabs, update the editor content
    useEffect(() => {
        if (!activeTabId || !editorRef.current) return
        const model = editorRef.current.getModel()
        if (!model) return

        // Use cached content (always the latest)
        const content = tabContentRef.current[activeTabId] ?? ''
        isRemoteChange.current = true
        model.setValue(content)
        isRemoteChange.current = false
    }, [activeTabId])


    const closeTab = (tabId, e) => {
        e?.stopPropagation()
        // Remove from cache and tracking
        delete tabContentRef.current[tabId]
        openTabIdsRef.current.delete(tabId)

        // Calculate the new state before calling any setState
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
        // Save current editor content before switching
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
                userColorsRef.current[userName] = randomcolor(
                    {
                        luminosity: 'light',
                        format: 'hex'
                    }
                )
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


        // Debounce cursor position emissions to avoid flooding the server
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

        // If there's an active tab waiting for content to be loaded, load it
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


            // File-scoped code change — works with both old server (no fileId) and new server (with fileId)
            socketRef.current.on('code-change', ({ fileId: changedFileId, value }) => {
                // If old server doesn't send fileId, assume it's for the active file
                const targetFileId = changedFileId || activeTabIdRef.current
                if (!targetFileId) return

                // Update our local cache for this file
                tabContentRef.current[targetFileId] = value

                // Only update the visible editor if we're viewing this file
                if (targetFileId === activeTabIdRef.current && editorRef.current) {
                    const editor = editorRef.current
                    const model = editor.getModel()
                    if (!model) return
                    const currentValue = model.getValue()

                    // Skip if content is identical (prevents unnecessary updates)
                    if (currentValue === value) return

                    const position = editor.getPosition()
                    const selections = editor.getSelections()
                    isRemoteChange.current = true
                    model.setValue(value)
                    isRemoteChange.current = false
                    if (position) editor.setPosition(position)
                    if (selections) editor.setSelections(selections)
                }

                // Also update the tab content state
                setOpenTabs(prev => prev.map(tab =>
                    tab.id === targetFileId ? { ...tab, content: value } : tab
                ))
            })

            // Response to our file-open request — server sends us the file content
            socketRef.current.on('file-opened', ({ fileId: openedFileId, content }) => {
                // Cache the content
                tabContentRef.current[openedFileId] = content

                // Update tab content
                setOpenTabs(prev => prev.map(tab =>
                    tab.id === openedFileId ? { ...tab, content } : tab
                ))

                // If this is the currently active tab, load into editor
                if (openedFileId === activeTabIdRef.current && editorRef.current) {
                    const model = editorRef.current.getModel()
                    if (model) {
                        isRemoteChange.current = true
                        model.setValue(content)
                        isRemoteChange.current = false
                    }
                }
            })

            // When another user updates file content (via debounced save), update our cache
            socketRef.current.on('file-content-updated', ({ fileId: updatedFileId, newContent }) => {
                tabContentRef.current[updatedFileId] = newContent

                // Update tab if open
                setOpenTabs(prev => prev.map(tab =>
                    tab.id === updatedFileId ? { ...tab, content: newContent } : tab
                ))

                // If we're viewing this file in the editor, update it
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


    // Get file extension icon helper
    const getFileIcon = (name) => {
        if (!name) return 'description'
        const ext = name.split('.').pop().toLowerCase()
        const iconMap = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'javascript',
            tsx: 'javascript',
            css: 'css',
            html: 'html',
            json: 'data_object',
            md: 'description',
            py: 'code',
            java: 'code',
            cpp: 'code',
            c: 'code',
        }
        return iconMap[ext] || 'description'
    }

    const getIconColor = (name) => {
        if (!name) return 'text-slate-400'
        const ext = name.split('.').pop().toLowerCase()
        const colorMap = {
            js: 'text-yellow-400',
            jsx: 'text-blue-400',
            ts: 'text-blue-500',
            tsx: 'text-blue-400',
            css: 'text-purple-400',
            html: 'text-orange-400',
            json: 'text-yellow-300',
            md: 'text-slate-400',
            py: 'text-green-400',
        }
        return colorMap[ext] || 'text-slate-400'
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

    // Determine the language for the active tab
    const activeTab = openTabs.find(t => t.id === activeTabId)
    const editorLanguage = activeTab ? getLanguageFromFileName(activeTab.name) : (languageName === 'c++' ? 'cpp' : languageName)


    return (
        <main className="flex-1 flex flex-col min-w-0 bg-editor-bg overflow-hidden">
            {openTabs.length === 0 ? (
                <WelcomeScreen />
            ) : (
                <>
                    {/* Tab Bar */}
                    <div className="h-9 flex items-center bg-background-dark border-b border-border-color overflow-x-auto select-none custom-scrollbar shrink-0">
                        {openTabs.map(tab => (
                            <div
                                key={tab.id}
                                onClick={() => switchTab(tab)}
                                className={`flex items-center h-full px-4 gap-2 border-r border-border-color min-w-[120px] cursor-pointer transition-colors shrink-0
                                    ${tab.id === activeTabId
                                        ? 'bg-editor-bg border-t-2 border-white'
                                        : 'bg-background-dark border-t-2 border-transparent hover:bg-[#0f0f0f]'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[14px] ${getIconColor(tab.name)}`}>{getFileIcon(tab.name)}</span>
                                <span className={`text-xs ${tab.id === activeTabId ? 'text-slate-200' : 'text-slate-500'}`}>{tab.name}</span>
                                <X
                                    size={14}
                                    className="text-slate-500 hover:text-slate-300 ml-auto cursor-pointer"
                                    onClick={(e) => closeTab(tab.id, e)}
                                />
                            </div>
                        ))}
                        <div className="flex-1"></div>
                    </div>

                    {/* Editor Content */}
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

                                    // Update local cache
                                    tabContentRef.current[currentFileId] = value

                                    // Live sync to other users — fires immediately, scoped by fileId
                                    socketRef.current.emit('code-change', {
                                        RoomID,
                                        fileId: currentFileId,
                                        value
                                    })

                                    // Debounced DB save — fires 1s after user stops typing
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