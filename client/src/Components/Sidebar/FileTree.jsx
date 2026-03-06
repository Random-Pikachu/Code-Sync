import React, { useEffect, useState, useRef, useContext } from 'react'
import ShortUniqueId from 'short-unique-id';
import { Icon } from '@iconify/react';
import { FilePlus, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { useLocation, useParams } from "react-router-dom"

import { initializeSocket } from '../../Connection/socket';
import { CodeDataContext } from './CodeData';


const FileTree = ({ data }) => {

    const [isOpen, setIsOpen] = useState({})
    const [projectOpen, setProjectOpen] = useState(true)
    const { fileId, setFileId, fileName, setFileName, fileStruct, setFileStruct, roomId, userlist, setUserlist } = useContext(CodeDataContext)
    const [givenData, setGivenData] = useState(data)
    const [contextMenu, setContextMenu] = useState(null)
    const [renamingId, setRenamingId] = useState(null)
    const [renameValue, setRenameValue] = useState('')
    const renameInputRef = useRef(null)

    // Inline creation state: { parentId: string|null, isFolder: boolean } or null
    const [creating, setCreating] = useState(null)
    const [createValue, setCreateValue] = useState('')
    const createInputRef = useRef(null)

    const socketRef = useRef(null)
    const location = useLocation()
    const { RoomID } = useParams()

    const handleClickOutside = (e) => {
        const fileTree = document.getElementById('file-tree')
        const codeEditor = document.getElementById('code-editor')

        if (fileTree && !fileTree.contains(e.target) && codeEditor && !codeEditor.contains(e.target)) {
            setFileId(null)
        }
        if (contextMenu) setContextMenu(null);
    };


    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu]);


    useEffect(() => {
        const setupSocket = async () => {
            socketRef.current = await initializeSocket()

            socketRef.current.on('init-file-structure', (fileStruct) => {
                setGivenData(fileStruct)
                setFileStruct(fileStruct)
            })

            socketRef.current.on('update-file-struct', (newFileStruct) => {
                setGivenData(newFileStruct)
                setFileStruct(newFileStruct)
            })

            socketRef.current.on('user-list', (userList) => {
                setUserlist(userList)
            })

            socketRef.current.emit("join", { RoomID, userName: location.state?.userName || "Anonymous" })
        }

        setupSocket()

        return () => {
            if (socketRef.current) {
                socketRef.current.off('init-file-structure')
                socketRef.current.off('update-file-struct')
                socketRef.current.off('user-list')
            }
        }
    }, [])

    const emitFileStrucuture = (updatedFileStruct) => {
        if (socketRef.current) {
            socketRef.current.emit('update-file-struct', { RoomID, newFileStruct: updatedFileStruct })
        }
    }

    const getFileIcon = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        const iconMap = {
            'js': 'vscode-icons:file-type-js-official',
            'jsx': 'vscode-icons:file-type-reactjs',
            'ts': 'vscode-icons:file-type-typescript-official',
            'tsx': 'vscode-icons:file-type-reactts',
            'css': 'vscode-icons:file-type-css',
            'scss': 'vscode-icons:file-type-scss',
            'html': 'vscode-icons:file-type-html',
            'json': 'vscode-icons:file-type-json',
            'md': 'vscode-icons:file-type-markdown',
            'py': 'vscode-icons:file-type-python',
            'java': 'vscode-icons:file-type-java',
            'c': 'vscode-icons:file-type-c',
            'cpp': 'vscode-icons:file-type-cpp',
            'go': 'vscode-icons:file-type-go',
            'rs': 'vscode-icons:file-type-rust',
            'rb': 'vscode-icons:file-type-ruby',
            'php': 'vscode-icons:file-type-php',
            'svg': 'vscode-icons:file-type-svg',
            'png': 'vscode-icons:file-type-image',
            'jpg': 'vscode-icons:file-type-image',
            'gif': 'vscode-icons:file-type-image',
            'env': 'vscode-icons:file-type-dotenv',
            'gitignore': 'vscode-icons:file-type-git',
            'yml': 'vscode-icons:file-type-yaml',
            'yaml': 'vscode-icons:file-type-yaml',
            'xml': 'vscode-icons:file-type-xml',
            'sh': 'vscode-icons:file-type-shell',
            'bash': 'vscode-icons:file-type-shell',
            'txt': 'vscode-icons:file-type-text',
            'pdf': 'vscode-icons:file-type-pdf2',
            'lock': 'vscode-icons:file-type-lock',
            'toml': 'vscode-icons:file-type-toml',
            'vue': 'vscode-icons:file-type-vue',
            'svelte': 'vscode-icons:file-type-svelte',
            'astro': 'vscode-icons:file-type-astro',
            'docker': 'vscode-icons:file-type-docker',
            'sql': 'vscode-icons:file-type-sql',
        };
        return iconMap[ext] || 'vscode-icons:default-file';
    }

    const getFolderIcon = (name, isExpanded) => {
        const folderMap = {
            'src': isExpanded ? 'vscode-icons:folder-type-src-opened' : 'vscode-icons:folder-type-src',
            'components': isExpanded ? 'vscode-icons:folder-type-component-opened' : 'vscode-icons:folder-type-component',
            'public': isExpanded ? 'vscode-icons:folder-type-public-opened' : 'vscode-icons:folder-type-public',
            'assets': isExpanded ? 'vscode-icons:folder-type-asset-opened' : 'vscode-icons:folder-type-asset',
            'node_modules': isExpanded ? 'vscode-icons:folder-type-node-opened' : 'vscode-icons:folder-type-node',
            'utils': isExpanded ? 'vscode-icons:folder-type-utils-opened' : 'vscode-icons:folder-type-utils',
            'config': isExpanded ? 'vscode-icons:folder-type-config-opened' : 'vscode-icons:folder-type-config',
            'test': isExpanded ? 'vscode-icons:folder-type-test-opened' : 'vscode-icons:folder-type-test',
            'tests': isExpanded ? 'vscode-icons:folder-type-test-opened' : 'vscode-icons:folder-type-test',
            'dist': isExpanded ? 'vscode-icons:folder-type-dist-opened' : 'vscode-icons:folder-type-dist',
            'build': isExpanded ? 'vscode-icons:folder-type-dist-opened' : 'vscode-icons:folder-type-dist',
            'styles': isExpanded ? 'vscode-icons:folder-type-css-opened' : 'vscode-icons:folder-type-css',
            'css': isExpanded ? 'vscode-icons:folder-type-css-opened' : 'vscode-icons:folder-type-css',
            'images': isExpanded ? 'vscode-icons:folder-type-images-opened' : 'vscode-icons:folder-type-images',
            'api': isExpanded ? 'vscode-icons:folder-type-api-opened' : 'vscode-icons:folder-type-api',
            'hooks': isExpanded ? 'vscode-icons:folder-type-hook-opened' : 'vscode-icons:folder-type-hook',
            'lib': isExpanded ? 'vscode-icons:folder-type-library-opened' : 'vscode-icons:folder-type-library',
            'pages': isExpanded ? 'vscode-icons:folder-type-view-opened' : 'vscode-icons:folder-type-view',
            'views': isExpanded ? 'vscode-icons:folder-type-view-opened' : 'vscode-icons:folder-type-view',
        };
        const lowerName = name.toLowerCase();
        return folderMap[lowerName] || (isExpanded ? 'vscode-icons:default-folder-opened' : 'vscode-icons:default-folder');
    }

    const renameItem = (data, itemId, newName) => {
        return data.map((struct) => {
            if (struct.id === itemId) {
                return { ...struct, name: newName };
            }
            if (struct.isFolder && struct.children) {
                return { ...struct, children: renameItem(struct.children, itemId, newName) };
            }
            return struct;
        });
    }

    const handleRename = (item) => {
        setRenamingId(item.id);
        setRenameValue(item.name);
        setTimeout(() => renameInputRef.current?.focus(), 0);
    }

    const commitRename = (itemId) => {
        const trimmed = renameValue.trim();
        if (!trimmed || trimmed === getItemName(givenData, itemId)) {
            setRenamingId(null);
            return;
        }
        const updated = renameItem(givenData, itemId, trimmed);
        setGivenData(updated);
        setFileStruct(updated);
        emitFileStrucuture(updated);
        if (fileId === itemId) setFileName(trimmed);
        setRenamingId(null);
    }

    const cancelRename = () => {
        setRenamingId(null);
        setRenameValue('');
    }

    const getItemName = (data, itemId) => {
        for (const struct of data) {
            if (struct.id === itemId) return struct.name;
            if (struct.isFolder && struct.children) {
                const found = getItemName(struct.children, itemId);
                if (found) return found;
            }
        }
        return null;
    }

    const handleContextMenu = (e, struct) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, item: struct });
    }

    const handleBackgroundContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item: null });
    }

    const deleteItem = (data, itemId) => {
        return data
            .filter((struct) => struct.id !== itemId)
            .map((struct) => {
                if (struct.isFolder && struct.children) {
                    return { ...struct, children: deleteItem(struct.children, itemId) };
                }
                return struct;
            });
    }

    const handleDelete = (itemId) => {
        const updated = deleteItem(givenData, itemId);
        setGivenData(updated);
        setFileStruct(updated);
        emitFileStrucuture(updated);
        if (fileId === itemId) {
            setFileId(null);
            setFileName(null);
        }
    }

    // --- Inline creation logic ---

    const startCreating = (parentId, isFolder) => {
        setCreating({ parentId, isFolder })
        setCreateValue('')

        // If creating inside a folder, expand it
        if (parentId) {
            const folderName = getItemName(givenData, parentId)
            if (folderName) {
                setIsOpen(prev => ({ ...prev, [folderName]: true }))
            }
        }

        setTimeout(() => createInputRef.current?.focus(), 0)
    }

    const commitCreate = () => {
        if (!creating) return
        const trimmed = createValue.trim()
        if (!trimmed) {
            setCreating(null)
            return
        }

        const idObj = new ShortUniqueId({ length: 6 })
        const newItem = creating.isFolder
            ? { id: idObj.rnd(), name: trimmed, isFolder: true, children: [] }
            : { id: idObj.rnd(), name: trimmed, isFolder: false, content: "" }

        let updated
        if (creating.parentId) {
            updated = addFolder(givenData, creating.parentId, newItem)
        } else {
            updated = [...givenData, newItem]
        }

        setGivenData(updated)
        setFileStruct(updated)
        emitFileStrucuture(updated)
        setCreating(null)
        setCreateValue('')
    }

    const cancelCreate = () => {
        setCreating(null)
        setCreateValue('')
    }

    const createFileInFolder = (folderId) => {
        startCreating(folderId, false)
    }

    const createFolderInFolder = (folderId) => {
        startCreating(folderId, true)
    }

    // Inline creation input row component
    const renderCreateInput = (depth) => {
        if (!creating) return null

        const icon = creating.isFolder
            ? 'vscode-icons:default-folder'
            : (createValue ? getFileIcon(createValue) : 'vscode-icons:default-file')

        return (
            <div
                className="flex items-center h-[22px] text-[13px] pr-2"
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
                <span className="w-[16px] mr-0.5 shrink-0"></span>
                <Icon icon={icon} className="text-[16px] mr-1.5 shrink-0" />
                <input
                    ref={createInputRef}
                    type="text"
                    value={createValue}
                    placeholder={creating.isFolder ? "Folder name..." : "File name..."}
                    onChange={(e) => setCreateValue(e.target.value)}
                    onBlur={() => commitCreate()}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); commitCreate(); }
                        if (e.key === 'Escape') { e.preventDefault(); cancelCreate(); }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#0a0a0a] text-[13px] text-white border border-[#007fd4] outline-none px-1 py-0 rounded-sm w-full min-w-0 font-inherit"
                    style={{ lineHeight: '20px' }}
                />
            </div>
        )
    }


    const printTree = (data, depth = 0) => {
        const sortedData = [...data].sort((a, b) => b.isFolder - a.isFolder);

        return sortedData.map((struct) => {
            const isSelected = fileId === struct.id;
            const isExpanded = isOpen[struct.name];

            return (
                <div key={struct.id}>
                    <div
                        onClick={() => {
                            if (!struct.isFolder) {
                                setFileId(struct.id);
                                setFileName(struct.name);
                            }

                            setIsOpen((prev) => ({
                                ...prev,
                                [struct.name]: !prev[struct.name]
                            }));
                        }}
                        onContextMenu={(e) => handleContextMenu(e, struct)}
                        className={`flex items-center h-[22px] cursor-pointer text-[13px] pr-2 file-tree-item
                            ${isSelected ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'}
                        `}
                        style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    >
                        {struct.isFolder ? (
                            <span className={`material-symbols-outlined text-[16px] text-slate-500 mr-0.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            >chevron_right</span>
                        ) : (
                            <span className="w-[16px] mr-0.5 shrink-0"></span>
                        )}

                        {struct.isFolder ? (
                            <Icon icon={getFolderIcon(struct.name, isExpanded)} className="text-[16px] mr-1.5 shrink-0" />
                        ) : (
                            <Icon icon={getFileIcon(struct.name)} className="text-[16px] mr-1.5 shrink-0" />
                        )}

                        {renamingId === struct.id ? (
                            <input
                                ref={renameInputRef}
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onBlur={() => commitRename(struct.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); commitRename(struct.id); }
                                    if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#0a0a0a] text-[13px] text-white border border-[#007fd4] outline-none px-1 py-0 rounded-sm w-full min-w-0 font-inherit"
                                style={{ lineHeight: '20px' }}
                            />
                        ) : (
                            <span className="truncate">{struct.name}</span>
                        )}
                    </div>

                    {isExpanded && struct.isFolder && struct.children && (
                        <div className="relative">
                            <div className="absolute top-0 bottom-0 border-l border-slate-700/50" style={{ left: `${depth * 16 + 16}px` }}></div>
                            {printTree(struct.children, depth + 1)}
                            {creating && creating.parentId === struct.id && renderCreateInput(depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    }


    const isFileSelected = (data, id) => {
        for (let struct of data) {
            if (struct.id === id && !struct.isFolder) return true
            else if (struct.isFolder && struct.children.length > 0) {
                if (isFileSelected(struct.children, id)) return true
            }
        }
        return false
    }

    const addFolder = (data, parentID, newStructure) => {
        return (data.map((struct) => {
            if (struct.id === parentID && struct.isFolder) {
                return {
                    ...struct,
                    children: [...struct.children, newStructure]
                }
            }
            else if (struct.isFolder) {
                return {
                    ...struct,
                    children: addFolder(struct.children, parentID, newStructure)
                }
            }
            else return struct
        }))
    }

    const createFolder = () => {
        let parentId = fileId;
        if (isFileSelected(givenData, parentId) || parentId === null) {
            startCreating(null, true)
        } else {
            startCreating(parentId, true)
        }
    }

    const createFile = () => {
        let parentId = fileId;
        if (isFileSelected(givenData, parentId) || parentId === null) {
            startCreating(null, false)
        } else {
            startCreating(parentId, false)
        }
    }

    return (
        <div className="flex flex-col h-full relative">
            <div
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-white/5 cursor-pointer group"
                onClick={() => setProjectOpen(prev => !prev)}
            >
                <span className={`material-symbols-outlined text-[12px] text-slate-400 transition-transform duration-150 ${projectOpen ? 'rotate-90' : ''}`}>chevron_right</span>
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-tight">Project</span>
                <div
                    className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                >
                    <FilePlus size={14} className="text-slate-400 hover:text-white cursor-pointer" onClick={createFile} />
                    <FolderPlus size={14} className="text-slate-400 hover:text-white cursor-pointer" onClick={createFolder} />
                </div>
            </div>

            {projectOpen && (
                <div
                    className="flex-1 overflow-y-auto custom-scrollbar"
                    id='file-tree'
                    onContextMenu={handleBackgroundContextMenu}
                >
                    {printTree(givenData)}
                    {creating && creating.parentId === null && renderCreateInput(0)}
                </div>
            )}

            {contextMenu && (
                <div
                    className="fixed z-50 bg-[#1e1e1e] border border-[#333] rounded shadow-xl py-1 min-w-[160px] text-[12px]"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={() => setContextMenu(null)}
                >
                    {/* New File & New Folder — only for folders or empty space */}
                    {(!contextMenu.item || contextMenu.item.isFolder) && (
                        <>
                            <div
                                className="px-3 py-1.5 text-slate-300 hover:bg-[#094771] hover:text-white cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                    if (contextMenu.item?.isFolder) {
                                        createFileInFolder(contextMenu.item.id);
                                    } else {
                                        startCreating(null, false);
                                    }
                                    setContextMenu(null);
                                }}
                            >
                                <FilePlus size={14} />
                                New File
                            </div>

                            <div
                                className="px-3 py-1.5 text-slate-300 hover:bg-[#094771] hover:text-white cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                    if (contextMenu.item?.isFolder) {
                                        createFolderInFolder(contextMenu.item.id);
                                    } else {
                                        startCreating(null, true);
                                    }
                                    setContextMenu(null);
                                }}
                            >
                                <FolderPlus size={14} />
                                New Folder
                            </div>
                        </>
                    )}

                    {/* Rename & Delete - only when right-clicking an actual item */}
                    {contextMenu.item && (
                        <>
                            {contextMenu.item.isFolder && <div className="border-t border-[#333] my-0.5"></div>}
                            <div
                                className="px-3 py-1.5 text-slate-300 hover:bg-[#094771] hover:text-white cursor-pointer flex items-center gap-2"
                                onClick={() => { handleRename(contextMenu.item); setContextMenu(null); }}
                            >
                                <Pencil size={14} />
                                Rename
                            </div>
                            <div
                                className="px-3 py-1.5 text-red-400 hover:bg-[#5a1d1d] hover:text-red-300 cursor-pointer flex items-center gap-2"
                                onClick={() => { handleDelete(contextMenu.item.id); setContextMenu(null); }}
                            >
                                <Trash2 size={14} />
                                Delete
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default FileTree