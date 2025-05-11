import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {Server} from 'socket.io'
import connectdb from './db/connection.js'
import { data } from './models/scheme.models.js';
import ShortUniqueId from 'short-unique-id';
import 'dotenv/config'



const app = express();
app.use(express.json())
const PORT = process.env.PORT || 5600;
const server = createServer(app)

connectdb()

app.use(cors());

const wsServer = new Server(server, {
    cors: {
        origin: '*'
    }
})




app.get('/', (req, res) => {
    return res.status(200).send('Server is running')
})

let clientList = []

const roomUser = {}
let userList = {}
let roomToUsers = {}

const createDefaultFileStructure = () => {
    const idObj = new ShortUniqueId({length: 6})
    const currId = idObj.rnd()
    return [{
        id: currId,
        name: "index.js",
        isFolder: false,
        content: ""
    }]

    // return []
}


const getConnectedClients = (roomID)=>{
    let arr = Array.from(wsServer.sockets.adapter.rooms.get(roomID))

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



wsServer.on('connection', (socket) => {
    // console.log(`connected to server: ${socket.id}`)
    clientList.push(socket.id);
    
    
    
    socket.on('join', async({RoomID, userName}) => {

        userList[userName] = socket.id

        // console.log('User List: ', userList)
        
        roomUser[socket.id] = userName    
        if (!roomToUsers[RoomID]) {
            roomToUsers[RoomID] = [];
        }
        if (!roomToUsers[RoomID].includes(userName)) {
            roomToUsers[RoomID].push(userName);
        }    
        socket.join(RoomID)

        try{
            let room = await data.findOne({roomId: RoomID})
            if (!room) {
                room = new data({
                    roomId: RoomID,
                    users: [userName],
                    fileStruct: createDefaultFileStructure()
                })

                await room.save()
                
            }

            else {
                
                if (!room.users.includes(userName)){
                    room.users.push(userName)
                    await room.save()
                }
            }

            socket.emit('init-file-structure', room.fileStruct)
            const roomUserList = getRoomUserList(RoomID)
            wsServer.to(RoomID).emit('user-list', {
                RoomID,
                userList: roomUserList
            })

            const clients = getConnectedClients(RoomID)
            // console.log(clients)


            clients.forEach(({socketId}) => {
                wsServer.to(socketId).emit('joined', {
                    clients,
                    userName,
                    socketId: socket.id
                })
            })
        }

        catch(error){
            console.log("Error joining room: ", error)
        }


        
    })

    // fileStrucutre handling
    /*socket.on('update-file-struct', async({RoomID, newFileStruct}) => {
        try{
            // await data.findOneAndUpdate(
            //     {roomId: RoomID},  //kaha pe update karne ka hai
            //     {fileStruct: newFileStruct}
            // )

            await data.findOneAndUpdate(
                { roomId: RoomID },
                { $push: { fileStruct: { $each: newFileStruct } } }
            )


            console.log("RoomId: ", RoomID, "\nNew file  Structure: \n",newFileStruct)
            socket.to(RoomID).emit('update-file-struct', newFileStruct)
        }

        catch(error) {
            console.log("Error updating the file structure: ", error)
        }
    })*/


    socket.on('update-file-struct', async({RoomID, newFileStruct}) => {
        try{
                const doc = await data.findOne({roomId: RoomID})
                if (!doc) return 

                const existingStruct = JSON.parse(JSON.stringify(doc.fileStruct))

                const merge = (existingStruct, incoming) => {
                    const map = new Map()
                
                    for (const node of existingStruct) {
                        map.set(node.id, { ...node })
                    }
                
                    for (const node of incoming) {
                        const existingNode = map.get(node.id);
                
                        if (!existingNode) {
                            // New node (folder or file)
                            map.set(node.id, { ...node })
                        } else {
                            if (node.isFolder) {
                                map.set(node.id, {
                                    ...existingNode,
                                    ...node,
                                    children: merge(existingNode.children || [], node.children || [])
                                })
                            } 
                            
                            else {
                                map.set(node.id, {
                                    ...existingNode,
                                    ...node,
                                    content: node.content !== undefined ? node.content : existingNode.content
                                })
                            }
                        }
                    }
                    
                    // console.log("Map: ", map)
                    return Array.from(map.values())
                }
                
                
                const updatedStruct = merge(existingStruct, newFileStruct)
                await data.updateOne({ roomId: RoomID }, { fileStruct: updatedStruct })
                socket.to(RoomID).emit('update-file-struct', updatedStruct)
                
        }

        catch(e){ 
            console.log("Error updating the struct", e)
        }
    })


    socket.on('update-file-content', async({RoomID, fileId, newContent}) => {
        try {
            let room = await data.findOne({roomId: RoomID})
            if (!room) return
    
            const updateFileContent = (fileStruct, fileId, newContent) => {
                return fileStruct.map(item => {
                    if (item.id === fileId && !item.isFolder) {
                        // console.log(`Updating File ID: ${fileId}, New Content: ${newContent}`)
                        return {...item, content: newContent}
                    }
    
                    if (item.isFolder && item.children) {
                        return {...item, children: updateFileContent(item.children, fileId, newContent)}
                    }
    
                    return item
                })
            }
    
            const updatedFileStruct = updateFileContent(room.fileStruct, fileId, newContent)
            console.log("Updated File Structure:", JSON.stringify(updatedFileStruct, null, 2))
    
            // Replace the direct MongoDB update with this approach
            // await data.findOneAndUpdate(
            //     { roomId: RoomID },
            //     { $set: { fileStruct: updatedFileStruct } },
            //     { new: true }
            // )
            room.fileStruct = updatedFileStruct;
            await room.save()
    
            socket.to(RoomID).emit('file-content-updated', {fileId, newContent});
        }   
        catch(error) {
            console.log("Error updating file content in db: ", error)
        }
    })
    

    socket.on('file-open', async ({RoomID, fileId}) => {
        // console.log("RoomId: ", RoomID, "File ID: ", fileId)
        try{
            const room = await data.findOne({roomId: RoomID})
            if (!room) return


            const fileById = (fileStruct, fileId) => {
                for (const file of fileStruct) {
                    if (file.id === fileId && !file.isFolder) return file

                    if (file.isFolder && file.children){
                        const found = fileById(file.children, fileId)
                        if (found) return found
                    }
                }

                return null
            }
            let fileData = fileById(room.fileStruct, fileId)
            socket.to(RoomID).emit("file-open", {file: fileData})
        }

        catch(err){
            console.log("Error while opening the file: ", err)
        }



    })


    

    // code handling
    socket.on('code-change', ({RoomID, value}) => {
        // console.log(value)
        socket.to(RoomID).emit('code-change', {value})
    })
    
    socket.on('sync-code', ({RoomID, value}) => {
        // console.log(value)
        socket.to(RoomID).emit('sync-code', {value})
    })


    socket.on('cursor-position', ({RoomID, position, userName}) => {
        socket.to(RoomID).emit("cursor-position", {position, userName})
    })

    socket.on('disconnect', () => {
        // console.log(`Client Disconnected: ${socket.id}`)
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
                    clients.forEach(({socketId}) => {
                        wsServer.to(socketId).emit('clients-updated', { clients })
                    })
                } catch (error) {
                    console.log(`Error updating clients for room:`, error)
                }
            }
        })
        
        // console.log('Updated User List:', userList)
        // console.log('Updated Room Users:', roomToUsers)
    })



})



server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})