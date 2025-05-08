import { createContext, useState } from "react";


export const CodeDataContext = createContext(null);

export const CodeDataProvider = ({children}) => {
    const [data, setData] = useState('')
    const [fileId, setFileId] = useState('')
    const [fileStruct, setFileStruct] = useState([])
    const [RoomId, setRoomId] = useState('  ')

    return(
        <CodeDataContext.Provider value={{
            data, 
            setData,
            fileId,
            setFileId,
            fileStruct,
            setFileStruct,
            RoomId,
            setRoomId
        }}>
            {children}
        </CodeDataContext.Provider>
    )   
}