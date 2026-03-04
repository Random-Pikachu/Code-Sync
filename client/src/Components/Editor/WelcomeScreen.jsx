import React from 'react'
import { FileCode2, FolderOpen, Users, Terminal, Braces } from 'lucide-react'

const WelcomeScreen = () => {
    return (
        <div className="flex-1 flex items-center justify-center bg-editor-bg select-none">
            <div className="flex flex-col items-center gap-8 max-w-md w-full px-6">
                {/* Logo & Title */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#2a2a4a] flex items-center justify-center shadow-2xl">
                            <Braces size={36} className="text-blue-400" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-200 tracking-tight">
                        Code-Sync
                    </h1>
                    <p className="text-sm text-slate-500 text-center">
                        Select a file from the explorer to start editing
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="w-full flex flex-col gap-2">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">
                        Quick Actions
                    </span>

                    <WelcomeAction
                        icon={<FolderOpen size={16} strokeWidth={1.5} />}
                        label="Open File Explorer"
                        shortcut="Ctrl+Shift+E"
                        color="text-yellow-400"
                    />
                    <WelcomeAction
                        icon={<Terminal size={16} strokeWidth={1.5} />}
                        label="Run Code"
                        shortcut="Ctrl+Shift+R"
                        color="text-green-400"
                    />
                    <WelcomeAction
                        icon={<Users size={16} strokeWidth={1.5} />}
                        label="View Connected Users"
                        shortcut="Ctrl+Shift+U"
                        color="text-blue-400"
                    />
                </div>

                {/* Helpful Tips */}
                <div className="w-full border-t border-[#1a1a1a] pt-5">
                    <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                        Tips
                    </span>
                    <div className="mt-3 flex flex-col gap-2.5">
                        <TipItem text="Click on any file in the Explorer to open it in the editor" />
                        <TipItem text="Changes are synced in real-time with all connected users" />
                        <TipItem text="Right-click files or folders for more options" />
                    </div>
                </div>
            </div>
        </div>
    )
}

const WelcomeAction = ({ icon, label, shortcut, color }) => (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#141414] cursor-pointer transition-all duration-200 group">
        <span className={`${color} opacity-70 group-hover:opacity-100 transition-opacity`}>
            {icon}
        </span>
        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors flex-1">
            {label}
        </span>
        <kbd className="text-[10px] text-slate-600 bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a] font-mono">
            {shortcut}
        </kbd>
    </div>
)

const TipItem = ({ text }) => (
    <div className="flex items-start gap-2">
        <span className="text-slate-700 mt-0.5">•</span>
        <span className="text-xs text-slate-600 leading-relaxed">{text}</span>
    </div>
)

export default WelcomeScreen
