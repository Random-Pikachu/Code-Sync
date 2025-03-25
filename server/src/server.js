import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {Server} from 'socket.io'
import connectdb from './db/connection.js'
import { data } from './models/scheme.models.js';
import ShortUniqueId from 'short-unique-id';




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

const createDefaultFileStructure = () => {
    const idObj = new ShortUniqueId({length: 6})
    const currId = idObj.rnd()
    // return [{
    //     id: currId,
    //     name: "index.js",
    //     isFolder: false,
    //     content: ""
    // }]

    return []
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



wsServer.on('connection', (socket) => {
    // console.log(`connected to server: ${socket.id}`)
    clientList.push(socket.id);
    
    
    
    socket.on('join', async({RoomID, userName}) => {

        
        roomUser[socket.id] = userName        
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

            const clients = getConnectedClients(RoomID)
            console.log(clients)


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
    socket.on('update-file-struct', async({RoomID, newFileStruct}) => {
        try{
            await data.findOneAndUpdate(
                {roomId: RoomID},  //kaha pe update karne ka hai
                {fileStruct: newFileStruct}
            )


            console.log("RoomId: ", RoomID, "\nNew file  Structure: \n",newFileStruct)
            socket.to(RoomID).emit('update-file-struct', newFileStruct)
        }

        catch(error) {
            console.log("Error updating the file structure: ", error)
        }
    })


    socket.on('update-file-content', async({RoomID, fileId, newContent}) =>{
        try{
            let room = await data.findOne({roomId: RoomID})
            if (!room) return

            const updateFileContent = (fileStruct, fileId, newContent) => {
                return fileStruct.map(item => {
                    if (item.id === fileId && !item.isFolder){
                        return {...item, content: newContent}
                    }

                    if (item.isFolder && item.children){
                        return{...item, children: updateFileContent(item.children, fileId, newContent)}
                    }

                    return item
                })
            }


            const updateFileStruct = updateFileContent(room.fileStruct, fileId, newContent)

            await room.findOneAndUpdate(
                {roomId: RoomID},
                {fileStruct: updateFileStruct}
            )

            socket.to(RoomID).emit('file-content-updated', {RoomID, newContent});
        }   

        catch(error){
            console.log("Error updating file content in db: ", error)
        }
    })



    

    // code handling
    socket.on('code-change', ({RoomID, value}) => {
        console.log(value)
        socket.to(RoomID).emit('code-change', {value})
    })
    
    socket.on('sync-code', ({RoomID, value}) => {
        console.log(value)
        socket.to(RoomID).emit('sync-code', {value})
    })


    socket.on('cursor-position', ({RoomID, position, userName}) => {
        socket.to(RoomID).emit("cursor-position", {position, userName})
    })

    socket.on('disconnect', ()=>{
        console.log(`Client Disconnected: ${socket.id}`)
        const index = clientList.indexOf(socket.id)
        if (index > -1) {
            clientList.splice(index, 1)
        }

        const userName = roomUser[socket.id]

        Object.keys(wsServer.sockets.adapter.rooms).forEach(roomId => {
            socket.to(roomId).emit('user-disconnected', {userName})

            try{
                const clients = getConnectedClients(roomId)
                clients.forEach(({socketId}) => {
                    wsServer.to(socketId).emit('clients-updated', {clients})
                })
            }

            catch (error) {
                console.log(`Error updating clients for room ${roomID}:`, error)
            }

            
        })

        
        delete roomUser[socket.id]
        console.log(clientList)
        
    })



})



server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})