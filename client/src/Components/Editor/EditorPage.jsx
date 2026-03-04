import React, { useContext, useRef, useState } from 'react'
import Editor from './EditorWindow'
import Sidebar from './Sidebar'
import TerminalPanel from './TerminalPanel'
import { CodeDataContext } from '../Sidebar/CodeData'

const EditorPage = () => {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const contentGetterRef = useRef(null)
  const { fileName } = useContext(CodeDataContext)

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onToggleTerminal={() => setTerminalOpen(prev => !prev)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Editor contentGetterRef={contentGetterRef} />
          <TerminalPanel
            isOpen={terminalOpen}
            onClose={() => setTerminalOpen(false)}
            getActiveFileContent={() => contentGetterRef.current?.()}
            activeFileName={fileName}
          />
        </div>
      </div>
    </div>
  )
}

export default EditorPage