import React from 'react'
import Editor from './EditorWindow'
import Sidebar from './Sidebar'

const EditorPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex items-center px-4 h-12 border-b border-border-color bg-background-dark select-none">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 text-white w-[304px] shrink-0">
          <span className="material-symbols-outlined text-2xl">sync_alt</span>
        </div>
        {/* Center: Search */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-sidebar-bg border border-border-color rounded-md px-3 py-1 gap-2 w-72">
            <span className="material-symbols-outlined text-sm text-slate-500">search</span>
            <span className="text-xs text-slate-500">Search files...</span>
          </div>
        </div>
        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button className="text-[#a1a1a1] hover:text-white text-xs px-3 py-1 rounded border border-[#333] hover:border-[#555] flex items-center gap-1.5 transition-all">
            <span className="material-symbols-outlined text-[14px]">share</span>
            Share
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-lg">account_circle</span>
          </div>
        </div>
      </header>

      {/* Main IDE area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Editor />
      </div>
    </div>
  )
}

export default EditorPage