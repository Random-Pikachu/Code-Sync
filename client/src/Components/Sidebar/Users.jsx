import React, { useContext } from 'react'
import { CodeDataContext } from './CodeData'
import { Copy, Check } from 'lucide-react'
import Avatar from 'boring-avatars'
import { useState } from 'react'

const AVATAR_COLORS = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']

const Users = () => {
  const { userlist, RoomId } = useContext(CodeDataContext)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(RoomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const users = Object.keys(userlist.userList || {})

  return (
    <div className="flex flex-col h-full px-3 py-2">
      {/* User Count */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[11px] text-slate-400 font-medium">
          {users.length} {users.length === 1 ? 'user' : 'users'} online
        </span>
      </div>

      {/* User List */}
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
        {users.map((name) => (
          <div
            key={name}
            className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="shrink-0">
              <Avatar
                size={32}
                name={name}
                variant="beam"
                colors={AVATAR_COLORS}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] text-slate-200 font-medium truncate">
                {name}
              </span>
              <span className="text-[10px] text-green-500/70">active</span>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-[12px] text-slate-600 text-center py-8">
            No users connected
          </div>
        )}
      </div>

      {/* Copy Room ID */}
      <div className="mt-auto pt-3 border-t border-border-color">
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-border-color text-slate-300 text-[12px] font-medium transition-all active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Room ID</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Users