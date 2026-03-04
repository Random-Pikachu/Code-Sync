import React from 'react'
import Editor from './EditorWindow'
import Sidebar from './Sidebar'

const EditorPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Editor />
      </div>
    </div>
  )
}

export default EditorPage