import { createContext } from "react";



export const fileManagerContext = createContext(null)


export const fileManagerProvider = ({children}) => {
    //saved code data

    const [savedData, setSavedData] = useState('')  
    return(
        <fileManagerContext.Provider value = {{savedData, setSavedData}}>
            {children}
        </fileManagerContext.Provider>
    )
}