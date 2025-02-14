import React, { useEffect, useRef, useState } from 'react'
import * as Monaco from 'monaco-editor'
import {Editor, useMonaco} from '@monaco-editor/react'
import { initializeSocket } from '../../Connection/socket'
import { useLocation, useParams } from 'react-router-dom'




const EditorWindow = () => {

    const socketRef = useRef(null)

    

    const editorRef = useRef()
    const monaco = useMonaco()

    const [data, setData] = useState('')

    const onMount = (editor) =>{
        if (!editor) return;
        editorRef.current = editor
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


    const location = useLocation()
    const {RoomID} = useParams()

    useEffect(() => {
        const setupSocket = async () => {
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


                
            })


            socketRef.current.on('code-change', ({value}) => {
                setData(value)
            } )

            

            
        };


        setupSocket()

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off('joined')
            }
        }
        

    }, [])

  return (
    <>
        
        <div>
        <Editor
            height="100vh"
            width= "70%" 
            language='javascript'
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