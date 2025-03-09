import { createContext, useState } from "react";


export const inputContext = createContext(null)

export const InputProvider = ({children}) => {
    const [input, setInput] = useState('')
    const [languageName, setLanguageName] = useState('javascript')
    const [ver, setVersion] = useState('1.32.3')

    return (
        <inputContext.Provider value={{input, 
            setInput, 
            languageName,
            setLanguageName,
            ver,
            setVersion    
        }}>
            {children}
        </inputContext.Provider>
    )
}