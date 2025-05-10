import React, { useState } from 'react'
  
import CodeRun from '../Sidebar/CodeRun'
import Users from '../Sidebar/Users'
import FileManager from '../Sidebar/FileManager'
// import codicon from '@vscode/codicons'

const Sidebar = () => {

  const [activeComponent, setActiveComponent] = useState('1')

  const renderComponenet = () => {
    switch(activeComponent){
      case '1':
        return <FileManager/>
      
      case '2': 
        return <CodeRun />

      case '3':
        return <Users />


      default:
        return <FileManager />
    }
  }
    

    return (
      <>
        <div className="w-full h-full bg-gradient-to-b from-[#16003b] to-[#031f42] text-white">
          <div className='flex gap-8 px-17 pt-10 flex-row items-start'>
            <button onClick={() => setActiveComponent('1')}
              className={`${activeComponent === '1' ? 'text-white border-b-2 border-white' : 'text-gray-400'} pb-2`}              
            >
              <div className='codicon codicon-files scale-160'></div>
            </button>
            <button onClick={() => setActiveComponent('2')}
              className={`${activeComponent === '2' ? 'text-white border-b-2 border-white' : 'text-gray-400'} pb-2`}  
            >
              <div className='codicon codicon-play scale-160'></div>
            </button>
            <button onClick={() => setActiveComponent('3')}
              className={`${activeComponent === '3' ? 'text-white border-b-2 border-white' : 'text-gray-400'} pb-2`}  
            >
              <div className='codicon codicon-account scale-160'></div>
            </button>
          </div>
          {renderComponenet()}        
        </div>
      </>
    )
}

export default Sidebar