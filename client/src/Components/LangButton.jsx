import React, { useContext, useEffect, useState } from 'react'
import { LanguageContext } from '../Context/Languages__'
import { getLanguages } from '../API/Languages'
import { inputContext } from '../Context/CodeInput'

const LangButton = () => {
    const {language, setLanguage} = useContext(LanguageContext)
    const{languageName, setLanguageName, ver, setVersion} = useContext(inputContext)
    const [isOpen, setIsOpen] = useState(false);
    
    
    useEffect(() => {
        getLanguages().then((data) => {
            setLanguage(data)
        })  
    },[])


    
    // const handleClick = () => {
    //     console.log(language)
    // }
    
    return (
        <>

        <div className="relative inline-block">
            <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            type="button"
            >   
                <div className='flex items-start justify-center gap-2'>
                <span className="font-[Montserrat_SemiBold] text-sm">{languageName}</span>  
                <span className="font-[Montserrat]  text-sm font-light text-gray-200">({ver})</span> 
                </div>
            <svg
                className="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
            >
                <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
                />
            </svg>
            </button>

        {isOpen && (
            <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-md w-44 dark:bg-gray-700 mt-2 
                max-h-70 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    {language.map((lang, idx) => (
                        <li key = {idx}>
                            <button
                                onClick={()=>{
                                    setIsOpen(false)
                                    setLanguageName(lang.language)
                                    setVersion(lang.version)
                                }}

                                className={`w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 
                                `}
                            >
                                <div className={`flex items-start justify-center gap-2
                                    ${
                                        (languageName===lang.language   && ver === lang.version)? "text-[#ffe01b] font-bold" : ""
                                        } `}>
                                    <span className="font-[Montserrat]  text-sm">{lang.language}</span>  
                                    <span className="font-[Montserrat]  text-sm font-light">({lang.version})</span> 
                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )} 
        </div>
    </>
  )
}

export default LangButton