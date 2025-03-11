import React, { useContext, useEffect, useRef, useState } from 'react'
import * as Monaco from 'monaco-editor'
import {Editor, useMonaco} from '@monaco-editor/react'
import { initializeSocket } from '../../Connection/socket'
import { useLocation, useParams } from 'react-router-dom'
import { inputContext } from '../../Context/CodeInput'
import { CodeDataContext } from '../Sidebar/CodeData'
import randomcolor from 'randomcolor'


const EditorWindow = () => {
    const {languageName} = useContext(inputContext)
    const socketRef = useRef(null)

    

    const editorRef = useRef()
    const monaco = useMonaco()
    
    const [peerPosition, setPeerPosition] = useState({})
    const [cursorDecorations, setCursorDecorations] = useState({})
    const userColorsRef = useRef({})

    const {data, setData} = useContext(CodeDataContext)


    const updateCursorDecorations = () =>{
        if (!editorRef.current) return;
        
        const decorations = []

        Object.keys(peerPosition).forEach((userName) => {
            if (userName === location.state.userName) return
            const position = peerPosition[userName]
            if (!position) return

            if (!userColorsRef.current[userName]){
                userColorsRef.current[userName] = randomcolor(
                    {
                        luminosity: 'light',
                        format: 'hex'
                    }
                )
            }
            const userColor = userColorsRef.current[userName];

            decorations.push({
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column+1),

                options: {
                    className: `cursor-${userName.replace(/\s+/g, "-")}`,
                    hoverMessage: {value: userName},
                    beforeContentClassName: 'cursor-decoration',
                }
            })

            addCursorStyle(userName, userColor)
        })


        if(editorRef.current){
            const oldDecorations = Object.values(cursorDecorations).flat()
            const newDecorations = editorRef.current.deltaDecorations(oldDecorations, decorations)


            setCursorDecorations(prev => ({
                ...prev,
                cursors: newDecorations
            }))
        }
    }


    const addCursorStyle = (userName, userColor) => {
        const styleId = `cursor-${userName.replace(/\s+/g, '-')}`
        let styelEl = document.getElementById(styleId)

        if (!styelEl){
            styelEl = document.createElement('style')
            styelEl.id = styleId
            document.head.appendChild(styelEl)
        }

        styelEl.innerHTML = `
            .cursor-${userName.replace(/\s+/g, '-')} {
                background-color: ${userColor};
                width: 2px !important;
            }

            .cursor-decoration::before {
                content: '';
                position: absolute;
                width: 2px;
                height: 18px;
                background-color: inherit;
                z-index: 1;
            }
        `
    }

    const onMount = (editor) =>{
        if (!editor) return;
        editorRef.current = editor


        editor.onDidChangeCursorPosition((event) => {
            // console.log(event);
            const position = event.position;
            // console.log("Position of cursor: ", position)

            if (socketRef.current){
                // sending cursor position data
                socketRef.current.emit('cursor-position', {
                    RoomID,
                    position,
                    userName: location.state.userName
                })
            }
            
        })

        editor.focus();
    }

    useEffect(()=>{
        if (!monaco) return;
       
            monaco.editor.defineTheme("Cobalt2", {
                base: 'vs-dark',
                inherit: true,
                rules:[
                    { token: "comment", foreground: "0088ff", fontStyle: "italic" },
                    { token: "constant", foreground: "ff628c"},
                    { token: "entity", foreground: "ffc600"},
                    { token: "invalid", foreground: "f44542"},
                    { token: "keyword", foreground: "ff9d00"},
                    { token: "string", foreground: "a5ff90"},
                    { token: "variable", foreground: "e1efff"},
                    { token: "export default", foreground: "ff9d00", fontStyle: "italic"},
                    
                ],
                colors: {
                    "editor.background": "#193549",
                }
            })

            monaco.editor.setTheme("Cobalt2")
        
    },[monaco])

    useEffect(() => {
        updateCursorDecorations()
    }, [peerPosition])

    const location = useLocation()
    const {RoomID} = useParams()

    useEffect(() => {
        const setupSocket = async () => {
            if (socketRef.current) socketRef.current.disconnect()
            
            socketRef.current = await initializeSocket()

            socketRef.current.emit('join', {
                RoomID,
                userName: location.state.userName,
            })


            socketRef.current.on('joined', ({clients, userName, socketId})=>{
                
                // checking ki processed username === current username
                if (userName !== location.state.userName){
                    console.log(`${userName} joined the room`)
                }

                // giving color to new user
                if (!userColorsRef.current[userName]) {
                    userColorsRef.current[userName] = randomcolor({
                        luminosity: 'light',
                        format: 'hex'
                    })
                }


                
            })


            socketRef.current.on('code-change', ({value}) => {
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
            } )


            socketRef.current.on('user-disconnected', ({userName}) => {
                console.log(`${userName} has disconnected`)
                setPeerPosition((prev) => {
                    const newPositions = {...prev}
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

            socketRef.current.on('cursor-position', ({position, userName}) =>{
                if (!socketRef.current) return;
                console.log("received cursor position for ", userName, ": ", position)
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
    <>
        
        <div>
        <Editor
            // width= "70%" 
            height="100vh"
            language={languageName === 'c++' ? 'cpp' : languageName}
            theme='Cobalt2'           
            onMount={onMount}

            value={data}
            onChange={(value, event) => {
                setData(value)
                console.log('change: ', value);
                socketRef.current.emit('code-change', {
                    RoomID, 
                    value
                })                
            }}

            options={{
                fontFamily: "'Cascadia Code', JetBrains Mono, Fira Code",
                fontSize: 18,
                fontLigatures: true
            }}
        />

        </div>
    </>
  )
}

export default EditorWindow