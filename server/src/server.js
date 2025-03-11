import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {Server} from 'socket.io'

const app = express();
const PORT = process.env.PORT || 5600;
const server = createServer(app)


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
    
    
    
    socket.on('join', ({RoomID, userName}) => {
        roomUser[socket.id] = userName        
        socket.join(RoomID)

        const clients = getConnectedClients(RoomID)
        console.log(clients)


        clients.forEach(({socketId}) => {
            wsServer.to(socketId).emit('joined', {
                clients,
                userName,
                socketId: socket.id
            })
        })
    })
    

    
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
        delete roomUser[socket.id]

        
        console.log(clientList)

        socket.leave()
    })



})



server.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})