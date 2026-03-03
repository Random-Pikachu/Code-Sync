import React, { useState } from 'react'
import { Play, Users as UsersIcon, Settings, FileText } from 'lucide-react'
import { Resizable } from 'react-resizable'
import 'react-resizable/css/styles.css'

import CodeRun from '../Sidebar/CodeRun'
import Users from '../Sidebar/Users'
import FileManager from '../Sidebar/FileManager'

const Sidebar = () => {

  const [activeComponent, setActiveComponent] = useState('1')
  const [paneWidth, setPaneWidth] = useState(224)

  const renderComponenet = () => {
    switch (activeComponent) {
      case '1':
        return <FileManager />

      case '2':
        return <CodeRun />

      case '3':
        return <Users />


      default:
        return <FileManager />
    }
  }

  const onResize = (e, { size }) => {
    setPaneWidth(size.width)
  }

  return (
    <div className="flex shrink-0 h-full">
      {/* Activity Bar (Far Left) */}
      <aside className="w-12 flex flex-col items-center py-3 gap-2 bg-background-dark border-r border-border-color shrink-0">
        <div
          onClick={() => setActiveComponent('1')}
          className={`p-2.5 rounded-md cursor-pointer transition-colors ${activeComponent === '1' ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}
        >
          <FileText size={20} strokeWidth={1.5} />
        </div>
        <div
          onClick={() => setActiveComponent('2')}
          className={`p-2.5 rounded-md cursor-pointer transition-colors ${activeComponent === '2' ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}
        >
          <Play size={20} strokeWidth={1.5} />
        </div>
        <div
          onClick={() => setActiveComponent('3')}
          className={`p-2.5 rounded-md cursor-pointer transition-colors ${activeComponent === '3' ? 'text-white' : 'text-slate-600 hover:text-slate-300'}`}
        >
          <UsersIcon size={20} strokeWidth={1.5} />
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="p-2.5 text-slate-600 hover:text-slate-300 cursor-pointer transition-colors">
            <Settings size={20} strokeWidth={1.5} />
          </div>
        </div>
      </aside>

      {/* Resizable Sidebar Explorer Pane */}
      <Resizable
        width={paneWidth}
        height={0}
        axis="x"
        onResize={onResize}
        minConstraints={[160, 0]}
        maxConstraints={[480, 0]}
        handle={
          <div
            className="absolute right-0 top-0 bottom-0 w-[4px] cursor-col-resize z-10 hover:bg-[#007fd4] transition-colors"
            style={{ position: 'absolute' }}
          />
        }
      >
        <aside
          className="bg-sidebar-bg border-r border-border-color flex flex-col shrink-0 overflow-y-auto custom-scrollbar relative"
          style={{ width: paneWidth }}
        >
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              {activeComponent === '1' ? 'Explorer' : activeComponent === '2' ? 'Run Code' : 'Users'}
            </span>
            <span className="material-symbols-outlined text-sm text-slate-500 hover:text-slate-300 cursor-pointer">more_horiz</span>
          </div>

          <div className="flex flex-col flex-1 overflow-y-auto">
            {renderComponenet()}
          </div>
        </aside>
      </Resizable>
    </div>
  )
}

export default Sidebar