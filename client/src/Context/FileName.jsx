import { createContext } from "react";


export const fileContext = createContext(null)

const fileProvider = ({children}) =>{
    const [fileName, setFileName] = useState('');


    return (
        <fileContext.Provider value={{fileName, setFileName}}>
            {children}
        </fileContext.Provider>
    )
}

export default fileProvider