import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io'
import connectdb from './db/connection.js'
import { setupSockets } from './socket.js';
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

setupSockets(wsServer);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})