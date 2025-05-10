import React, { useContext, useState } from 'react'
import { inputContext } from '../../Context/CodeInput'
import LangButton from '../LangButton'
import { executeCode } from '../../API/execution'
import { CodeDataContext } from './CodeData'

const CodeRun = () => {

    
    const {input, setInput, languageName, setLanguageName, ver, setVersion} = useContext(inputContext) 

    const {data} = useContext(CodeDataContext)

    const [output, setOutput] = useState('')


    const runCode = async () =>{      
        const code = data
        const codeInput = input
        const language = languageName
        const version = ver

        if(!code) return;
        try{
            const response = await executeCode(language, version, code, codeInput);
            const result = response.run;
            setOutput(result.output);
        }
        catch(error){
            console.log(error)
        }

    }

  return (
    <>
        <div className='flex items-center justify-center flex-col gap-4'>
            <div className='flex flex-col '>
            <div className='flex flex-row justify-between'>
                <label 
                htmlFor="input" 
                className="block mt-12 mb-2  text-[20px] font-[Montserrat_SemiBold] text-gray-900 dark:text-white"
                >Input</label>
            
            <div className='mt-12 mb-2'>
            <LangButton />
            </div>
            </div>
            
            
            <textarea 
                id="input" 
                rows="10" 
                onChange={(e) => setInput(e.target.value)}
                className="block p-2.5 w-[400px] font-[Inter] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter the Input"
            />
            
            <button 
                type="button" 
                onClick={runCode}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-2 w-full dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                
            >Run Code</button>

            </div>

            <br/>
            <div>

            <h3 className='block mb-2 text-[20px] font-[Montserrat_SemiBold] text-gray-900 dark:text-white'>Output</h3>
            <textarea 
                id='output'
                value={output}
                rows="10" 
                className="block p-2.5 w-[400px] font-[Inter] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Output"
                readOnly
            />

            </div>
            
        </div>
    </>
  )
}

export default CodeRun