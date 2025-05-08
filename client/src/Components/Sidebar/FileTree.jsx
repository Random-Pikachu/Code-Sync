import React, {useEffect, useState, useRef, useContext} from 'react'
import ShortUniqueId from 'short-unique-id';
import  { getClass } from 'file-icons-js'
import { useLocation, useParams } from "react-router-dom"
import 'file-icons-js/css/style.css'

import { initializeSocket } from '../../Connection/socket';
import { CodeDataContext } from './CodeData';




const FileTree = ({data}) => {

    const [isOpen, setIsOpen] = useState({}) // {src: true}
    // const [isSelectedId, setIsSelectedId] = useState(null)
    const {fileId, setFileId, fileStruct, setFileStruct, roomId} = useContext(CodeDataContext)
    const [givenData, setGivenData] = useState(data)

    const socketRef = useRef(null)
    const location = useLocation()
    const {RoomID} = useParams()



    // const handleClickOutside = (e) =>{
    //     // console.log(e); //we displayed the tree elements using span toh agar clicked area span nahi hai iska matlab vo outside file tree hai
    //     const fileTree = document.getElementById('file-tree')

    //     if (fileTree && fileTree.contains(e.target)){
            
    //             const isFileItem = e.target.classList;
    //             var elements = [...isFileItem];
    //             console.log(elements)
    
    //      
    //             if (!elements.includes('file-tree-item')) {
    //                 setFileId(null);
    //             }

    //             else {
    //                 
    //                 console.log("Clicked on blank space inside file tree");
    //                 setFileId(null);
    //             }
            
    //     }
    // }

    const handleClickOutside = (e) => {
        const fileTree = document.getElementById('file-tree')
        const codeEditor = document.getElementById('code-editor')
        
        if (fileTree && !fileTree.contains(e.target) && codeEditor && !codeEditor.contains(e.target)) {
            setFileId(null)
        }
    };
    

    useEffect(() => {
            document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);



    useEffect(() => {
        const setupSocket = async () => {
            if (socketRef.current) socketRef.current.disconnect()
            socketRef.current = await initializeSocket()

            socketRef.current.emit("join", {RoomID, userName: location.state.userName})

            socketRef.current.on('init-file-structure', (fileStruct) =>{
                console.log("Received Initial File Structure:", fileStruct);
                setGivenData(fileStruct)
                setFileStruct(fileStruct)
            })

            socketRef.current.on('update-file-struct', (newFileStruct) =>{
                console.log("First: ", newFileStruct)
                setGivenData(newFileStruct)
                setFileStruct(newFileStruct)
                console.log("Second: ", fileStruct)
            })


            return () => {
                socketRef.current.off('init-file-structure')
                socketRef.current.off('update-file-struct')
            }
        }
        

        setupSocket()
    }, [])

    const emitFileStrucuture = (updatedFileStruct) =>{
        if (socketRef.current){
            socketRef.current.emit('update-file-struct', {RoomID, newFileStruct: updatedFileStruct})
        }
    }

    const printTree = (data) =>{

        const sortedData = [...data].sort((a,b) => {
            return b.isFolder - a.isFolder
        })

        return(
            <>
            <div> 
        < div className='text-white'>
            {/* printing the structure */}
            {sortedData.map((struct) => (
                <div  key={struct.id} className=''>
                    {/* {struct.isFolder && 
                        (
                            <span
                                onClick={() =>{
                                    setIsOpen((prev) => ({
                                        ...prev,
                                        [struct.name] : !prev[struct.name]
                                    }))
                                }}
                                
                            >{isOpen[struct.name] ? "-": "+"}</span>
                        )
                    } */}


                    <span onClick={() =>{ 
                        setFileId(struct.id);
                        
                        if (socketRef.current && !struct.ifFolder){
                            socketRef.current.emit("file-open", {RoomID, fileId: struct.id})
                        }

                        console.log(givenData)
                        setIsOpen((prev) => ({
                            ...prev,
                            [struct.name] : !prev[struct.name]
                        }))
                    
                    }                        
                        }
                        className='text-[15px] font-[Montserrat] text-gray-900 dark:text-white cursor-pointer flex items-center hover:bg-[#03a17c6f] hover:rounded-[4px] file-tree-item'
                        >{struct.isFolder ? (<svg 
                            stroke="currentColor" 
                            fill="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 1024 1024" 
                            className="mr-2 min-w-fit inline-block" 
                            height="24" 
                            width="24" 
                            xmlns="http://www.w3.org/2000/svg"><path d="M880 298.4H521L403.7 186.2a8.15 8.15 0 0 0-5.5-2.2H144c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V330.4c0-17.7-14.3-32-32-32zM840 768H184V256h188.5l119.6 114.4H840V768z"></path></svg>) : 
                            // (<img 
                            //     src={getIconForFile(struct.name)} 
                            //     alt="" />
                            // )

                            (
                                <span className={`${getClass(struct.name)} px-3`}></span>
                            )
                            
                            }{struct.name}</span>
                    
                    {/* printing the tree like structure for children */}
                    {isOpen[struct.name] && struct.isFolder  &&  
                    (<div className="pl-4">
                        {printTree(struct.children)}
                    </div>)
                }
                </div>
            ))}
        </div>
            </div>
            {console.log('Selected Id:', fileId, "RoomId: ", RoomID)}
            </>
        )
    }


        const isFileSelected = (data, id) => {
            for (let struct of data) {
                if (struct.id === id && !struct.isFolder) return true

                else if (struct.isFolder && struct.children.length > 0){
                    if (isFileSelected(struct.children, id)) return true
                }   
            }

            return false
        }        
        const addFolder = (data, parentID, newStructure) => {
            return (data.map((struct) => {
                if (struct.id === parentID && struct.isFolder){
                    return {
                        ...struct, 
                        children: [...struct.children, newStructure] //adding new folder to the children
                    }
                }

                else if (struct.isFolder){
                    return {
                        ...struct,
                        children: addFolder(struct.children, parentID, newStructure) //recursing through the children 
                    }
                }


                else return struct
            }))
        }

    const createFolder = () =>{
        const folderName = prompt("Enter the folder name: ")
        // console.log("Folder Name: ", folderName)
        let parentId = fileId;
        const idObj = new ShortUniqueId({length: 6})
        if (!folderName) return
        
        const currId = idObj.rnd()
        console.log(`Id for ${folderName}: ${currId}`)

        const newFolder = {
            id: currId, 
            name: folderName, 
            isFolder: true,
            children: []
        }

        const currentFileStruct = JSON.parse(JSON.stringify(givenData))

        let updatedFileStruct
        if (isFileSelected(givenData, parentId) || parentId === null) {
            updatedFileStruct = [...givenData, newFolder]
            setGivenData(updatedFileStruct)
        }

        else {
            updatedFileStruct = addFolder(givenData, parentId, newFolder)
            setGivenData(updatedFileStruct)
        }
        setGivenData(updatedFileStruct)
        setFileStruct(updatedFileStruct)
        emitFileStrucuture(updatedFileStruct)
    }


    const createFile = () => {
        const fileName = prompt("Enter the file name: ")
        // console.log("Folder Name: ", folderName)
        let parentId = fileId;
        const idObj = new ShortUniqueId({length: 6})
        if (!fileName) return
        
        const currId = idObj.rnd()
        console.log(`Id for ${fileName}: ${currId}`)

        const newFile = {
            id: currId, 
            name: fileName, 
            isFolder: false,
            content: ""
        }
        const currentFileStruct = JSON.parse(JSON.stringify(givenData))

        let updatedFileStruct

        if (isFileSelected(givenData, parentId) || parentId === null) {
            updatedFileStruct = [...givenData, newFile]
            setGivenData(updatedFileStruct)
        }

        else{
            updatedFileStruct = addFolder(givenData, parentId, newFile)
            setGivenData(updatedFileStruct)
        }

        setGivenData(updatedFileStruct);
        setFileStruct(updatedFileStruct)
        emitFileStrucuture(updatedFileStruct)

    }
 
    return (
        
        <>
        <div className='flex flex-col'>
            <div className='flex flex-row items-center justify-between w-full px-17 pt-10'>

                <h1 className='block text-[20px] font-[Montserrat_SemiBold] text-gray-900 dark:text-[#eeeeee]'>Files</h1>
                {/* <button 
                    type="button" 
                    onClick={createFolder}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    New Folder
                </button> */}


                <div className='flex flex-row gap-3'>
                    {/* <img 
                        src={newFolderIcon} 
                        alt="new-folder" 
                        className='invert w-8'
                        onClick={createFolder}            
                    /> */}
                    
                    <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 24 24" 
                        height="23" 
                        width="23" 
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={createFolder}
                    >
                        <path d="M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5ZM4 5V19H20V7H11.5858L9.58579 5H4ZM11 12V9H13V12H16V14H13V17H11V14H8V12H11Z"></path>
                    
                    </svg>

                    <svg 
                        stroke="currentColor" 
                        fill="currentColor" 
                        strokeWidth="0" 
                        viewBox="0 0 24 24" 
                        height="23" 
                        width="23" 
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={createFile}
                    >
                            <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 11V8H13V11H16V13H13V16H11V13H8V11H11Z"></path>
                    </svg>    
                    
                    {/* <img 
                        src={newFileIcon} 
                        alt="new-folder" 
                        className='invert w-7 h-7'
                        onClick={createFolder}            
                    /> */}
                </div>
                
            </div>


                <div className='w-[80%] h-[3px] bg-amber-50 mx-auto mt-2'></div>
                </div>
            
            

            <div className='px-17 mt-4' id = 'file-tree'>
            {printTree(givenData)}
            </div>
    </>
  )
}

export default FileTree