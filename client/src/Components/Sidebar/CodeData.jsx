import { createContext, useState } from "react";


export const CodeDataContext = createContext(null);

export const CodeDataProvider = ({children}) => {
    const [data, setData] = useState('')

    return(
        <CodeDataContext.Provider value={{data, setData}}>
            {children}
        </CodeDataContext.Provider>
    )   
}