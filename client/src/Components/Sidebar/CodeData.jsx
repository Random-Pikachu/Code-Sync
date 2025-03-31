import { createContext, useState } from "react";


export const CodeDataContext = createContext(null);

export const CodeDataProvider = ({children}) => {
    const [data, setData] = useState('')
    const [fileId, setFileId] = useState('')

    return(
        <CodeDataContext.Provider value={{
            data, 
            setData,
            fileId,
            setFileId
        }}>
            {children}
        </CodeDataContext.Provider>
    )   
}