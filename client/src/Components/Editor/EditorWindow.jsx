import React, { useContext, useEffect, useRef, useState } from 'react'
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


    const { data, setData, fileId, fileStruct, RoomId, setRoomId } = useContext(CodeDataContext)




    const updateCursorDecorations = () => {
        if (!editorRef.current) return;

        const newDecorationMap = {}

        Object.keys(peerPosition).forEach((userName) => {
            if (userName === (location.state?.userName || "Anonymous")) return
            const position = peerPosition[userName]
            if (!position) return

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


        editor.onDidChangeCursorPosition((event) => {
            // console.log(event);
            const position = event.position;
            // console.log("Position of cursor: ", position)

            if (socketRef.current) {

                socketRef.current.emit('cursor-position', {
                    RoomID,
                    position,
                    userName: location.state?.userName || "Anonymous"
                })
            }

        })

        editor.focus();
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
            if (socketRef.current) socketRef.current.disconnect()



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


            socketRef.current.on('code-change', ({ value }) => {
                if (editorRef.current) {
                    const editor = editorRef.current;
                    const currentPosition = editor.getPosition();

                    setData(value)

                    setTimeout(() => {
                        if (currentPosition) {
                            editor.setPosition(currentPosition);
                        }
                    }, 0);
                }
            })

            socketRef.current.on('file-open', ({ file }) => {
                setData(file.content)
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

            socketRef.current.on('cursor-position', ({ position, userName }) => {
                if (!socketRef.current) return;

                setPeerPosition((prev) => ({
                    ...prev,
                    [userName]: position
                }))
            })

        };


        setupSocket()

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current.off('joined')
                socketRef.current.off('code-change')
                socketRef.current.off('user-disconnected')
                socketRef.current.off('cursor-position')
            }

            Object.keys(userColorsRef.current).forEach(userName => {
                const styleId = `cursor-${userName.replace(/\s+/g, '-')}`
                const styleEl = document.getElementById(styleId)
                if (styleEl) {
                    styleEl.remove()
                }
            })
        }


    }, [])






    return (
        <main className="flex-1 flex flex-col min-w-0 bg-editor-bg overflow-hidden">
            {/* Tab Bar */}
            <div className="h-9 flex items-center bg-background-dark border-b border-border-color overflow-x-auto select-none custom-scrollbar shrink-0">
                <div className="flex items-center h-full bg-editor-bg border-t-2 px-4 gap-2 border-r border-border-color min-w-[120px] border-white">
                    <span className="material-symbols-outlined text-[14px] text-yellow-400">javascript</span>
                    <span className="text-xs text-slate-200">main.js</span>
                    <X size={14} className="text-slate-500 hover:text-slate-300 ml-auto cursor-pointer" />
                </div>
                <div className="flex-1"></div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex overflow-hidden w-full relative">
                <div id='code-editor' className="flex-1 overflow-hidden h-full w-full">
                    <Editor
                        height="100%"
                        language={languageName === 'c++' ? 'cpp' : languageName}
                        theme='CustomDark'
                        onMount={onMount}

                        value={data}
                        onChange={(value) => {
                            setData(value)
                            socketRef.current.emit('code-change', {
                                RoomID,
                                value
                            })
                            socketRef.current.emit('update-file-content', {
                                RoomID,
                                fileId,
                                newContent: value
                            })
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

            <Toaster />
        </main>
    )
}

export default EditorWindow