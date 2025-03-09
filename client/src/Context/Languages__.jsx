import { createContext, useState } from "react";


export const LanguageContext = createContext(null)

export const LanguageProvider = ({children}) => {
    const [language, setLanguage]  = useState([])
    return(
        <LanguageContext.Provider value = {{language, setLanguage}}>
            {children}
        </LanguageContext.Provider>
    )
}