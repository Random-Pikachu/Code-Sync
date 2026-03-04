import { data } from './models/scheme.models.js';
import ShortUniqueId from 'short-unique-id';

export const setupSockets = (wsServer) => {
    let clientList = []

    const roomUser = {}
    let userList = {}
    let roomToUsers = {}

    // In-memory buffer for pending file content saves — prevents DB race conditions
    const pendingSaves = new Map()

    // In-memory file content cache — always has the latest content for open files
    // Key: `${RoomID}:${fileId}`, Value: string content
    const fileContentCache = new Map()

    const createDefaultFileStructure = () => {
        const idObj = new ShortUniqueId({ length: 6 })
        const currId = idObj.rnd()
        return [{
            id: currId,
            name: "index.js",
            isFolder: false,
            content: ""
        }]
    }

    const getConnectedClients = (roomID) => {
        const room = wsServer.sockets.adapter.rooms.get(roomID)
        if (!room) return []

        let arr = Array.from(room)

        let mappedUsers = arr.map((socketId) => {
            return {
                socketId,
                username: roomUser[socketId],
            }
        })

        return mappedUsers;
    }

    const getRoomUserList = (roomID) => {
        if (!roomToUsers[roomID]) return {};

        const roomUsernames = roomToUsers[roomID];
        const roomSpecificUserList = {};

        roomUsernames.forEach(username => {
            if (userList[username]) {
                roomSpecificUserList[username] = userList[username];
            }
        });

        return roomSpecificUserList;
    }

    // Helper to find a file by ID in the file structure tree
    const findFileById = (fileStruct, fileId) => {
        for (const file of fileStruct) {
            if (file.id === fileId && !file.isFolder) return file

            if (file.isFolder && file.children) {
                const found = findFileById(file.children, fileId)
                if (found) return found
            }
        }
        return null
    }

    // Debounced save for file content — batches rapid writes into a single DB operation
    const scheduleContentSave = (RoomID, fileId, newContent) => {
        const key = `${RoomID}:${fileId}`
        const existing = pendingSaves.get(key)
        if (existing) clearTimeout(existing.timer)

        // Always update the in-memory cache immediately
        fileContentCache.set(key, newContent)

        const timer = setTimeout(async () => {
            pendingSaves.delete(key)
            try {
                const room = await data.findOne({ roomId: RoomID })
                if (!room) return

                const updateFileContent = (fileStruct, fileId, newContent) => {
                    return fileStruct.map(item => {
                        if (item.id === fileId && !item.isFolder) {
                            return { ...item, content: newContent }
                        }
                        if (item.isFolder && item.children) {
                            return { ...item, children: updateFileContent(item.children, fileId, newContent) }
                        }
                        return item
                    })
                }

                const updatedFileStruct = updateFileContent(room.fileStruct, fileId, newContent)
                await data.updateOne(
                    { roomId: RoomID },
                    { $set: { fileStruct: updatedFileStruct } }
                )
            } catch (error) {
                console.log("Error in debounced content save: ", error)
            }
        }, 500)

        pendingSaves.set(key, { timer, content: newContent })
    }

    wsServer.on('connection', (socket) => {
        clientList.push(socket.id);

        socket.on('join', async ({ RoomID, userName }) => {
            userList[userName] = socket.id
            roomUser[socket.id] = userName

            if (!roomToUsers[RoomID]) {
                roomToUsers[RoomID] = [];
            }
            if (!roomToUsers[RoomID].includes(userName)) {
                roomToUsers[RoomID].push(userName);
            }
            socket.join(RoomID)

            try {
                let room = await data.findOneAndUpdate(
                    { roomId: RoomID },
                    {
                        $setOnInsert: {
                            fileStruct: createDefaultFileStructure()
                        },
                        $addToSet: {
                            users: userName
                        }
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );

                socket.emit('init-file-structure', room.fileStruct)
                const roomUserList = getRoomUserList(RoomID)
                wsServer.to(RoomID).emit('user-list', {
                    RoomID,
                    userList: roomUserList
                })

                const clients = getConnectedClients(RoomID)

                clients.forEach(({ socketId }) => {
                    wsServer.to(socketId).emit('joined', {
                        clients,
                        userName,
                        socketId: socket.id
                    })
                })
            }
            catch (error) {
                console.log("Error joining room: ", error)
            }
        })


        socket.on('update-file-struct', async ({ RoomID, newFileStruct }) => {
            try {
                // Use atomic $set to avoid read-modify-write race
                await data.updateOne(
                    { roomId: RoomID },
                    { $set: { fileStruct: newFileStruct } }
                )
                socket.to(RoomID).emit('update-file-struct', newFileStruct)
            }
            catch (e) {
                console.log("Error updating the struct", e)
            }
        })


        socket.on('update-file-content', async ({ RoomID, fileId, newContent }) => {
            // Debounced DB save — prevents race conditions from rapid concurrent writes
            scheduleContentSave(RoomID, fileId, newContent)

            // Broadcast to other users who may have this file open — scoped by fileId
            socket.to(RoomID).emit('file-content-updated', { fileId, newContent });
        })


        // When a user opens a file, send them the latest content (from cache or DB)
        socket.on('file-open', async ({ RoomID, fileId }) => {
            try {
                const cacheKey = `${RoomID}:${fileId}`

                // Check in-memory cache first (has the latest unsaved edits)
                if (fileContentCache.has(cacheKey)) {
                    const cachedContent = fileContentCache.get(cacheKey)
                    socket.emit('file-opened', {
                        fileId,
                        content: cachedContent
                    })
                    return
                }

                // Fall back to DB
                const room = await data.findOne({ roomId: RoomID })
                if (!room) return

                const fileData = findFileById(room.fileStruct, fileId)
                if (fileData) {
                    socket.emit('file-opened', {
                        fileId,
                        content: fileData.content || ''
                    })
                }
            }
            catch (err) {
                console.log("Error while opening the file: ", err)
            }
        })


        // File-scoped live code sync — includes fileId so only relevant editors update
        socket.on('code-change', ({ RoomID, fileId, value }) => {
            // Update in-memory cache
            const cacheKey = `${RoomID}:${fileId}`
            fileContentCache.set(cacheKey, value)

            // Broadcast to others — scoped by fileId
            socket.to(RoomID).emit('code-change', { fileId, value })
        })

        socket.on('sync-code', ({ RoomID, value }) => {
            socket.to(RoomID).emit('sync-code', { value })
        })


        socket.on('cursor-position', ({ RoomID, position, userName, fileId }) => {
            socket.to(RoomID).emit("cursor-position", { position, userName, fileId })
        })

        socket.on('disconnect', () => {
            const index = clientList.indexOf(socket.id)
            if (index > -1) {
                clientList.splice(index, 1)
            }

            const userName = roomUser[socket.id]
            if (!userName) return;
            delete userList[userName]
            delete roomUser[socket.id]

            Object.keys(roomToUsers).forEach(roomId => {
                const userIndex = roomToUsers[roomId].indexOf(userName)
                if (userIndex > -1) {
                    roomToUsers[roomId].splice(userIndex, 1)

                    const roomUserList = getRoomUserList(roomId);
                    wsServer.to(roomId).emit('user-list', {
                        userList: roomUserList
                    })

                    socket.to(roomId).emit('user-disconnected', { userName })

                    try {
                        const clients = getConnectedClients(roomId)
                        clients.forEach(({ socketId }) => {
                            wsServer.to(socketId).emit('clients-updated', { clients })
                        })
                    } catch (error) {
                        console.log(`Error updating clients for room:`, error)
                    }
                }
            })
        })
    })
}
