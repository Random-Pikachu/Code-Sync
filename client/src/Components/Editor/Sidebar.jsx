import React from 'react'
  
import CodeRun from '../Sidebar/CodeRun'
import Users from '../Sidebar/Users'
import FileManager from '../Sidebar/FileManager'

const Sidebar = () => {
    

    return (
      <>
        <div className="w-full h-full bg-[#181818] text-white">
          <FileManager />          
        </div>
      </>
    )
}

export default Sidebar