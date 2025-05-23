import { createContext, useState } from "react";


export const CodeDataContext = createContext(null);

export const CodeDataProvider = ({children}) => {
    const [data, setData] = useState('')
    const [fileId, setFileId] = useState('')
    const [fileName, setFileName] = useState('')
    const [fileStruct, setFileStruct] = useState([])
    const [RoomId, setRoomId] = useState('')
    const [userlist, setUserlist] = useState([])

    return(
        <CodeDataContext.Provider value={{
            data, 
            setData,
            fileId,
            setFileId,
            fileName,
            setFileName,
            fileStruct,
            setFileStruct,
            RoomId,
            setRoomId,
            userlist, 
            setUserlist
        }}>
            {children}
        </CodeDataContext.Provider>
    )   
}