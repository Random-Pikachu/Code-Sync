import React from 'react'
import Editor from './EditorWindow'
import Sidebar from './Sidebar'


const EditorPage = () => {


    return (
      <>
        <div className='flex flex-row'>
          <div className="flex-5">
            <Editor />
          </div>
          <div className="flex-3">
            <Sidebar />
          </div>
        </div>
      </>
    )
}

export default EditorPage