import React, { useState } from 'react'
  
import CodeRun from '../Sidebar/CodeRun'
import Users from '../Sidebar/Users'
import FileManager from '../Sidebar/FileManager'

const Sidebar = () => {

  const [activeComponent, setActiveComponent] = useState('1')

  const renderComponenet = () => {
    switch(activeComponent){
      case '1':
        return <FileManager/>
      
      case '2': 
        return <CodeRun />


      default:
        return <FileManager />
    }
  }
    

    return (
      <>
        <div className="w-full h-full bg-[#181818] text-white">
          <div className='flex gap-3 p-3'>
            <button onClick={() => setActiveComponent('1')}>File Explorer</button>
            <button onClick={() => setActiveComponent('2')}>Run</button>
          </div>
          {renderComponenet()}        
        </div>
      </>
    )
}

export default Sidebar