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

app.post('/api/execute', async (req, res) => {
    const { language, version, files, stdin } = req.body

    if (!language || !files) {
        return res.status(400).json({ error: 'Missing language or files' })
    }

    try {
        const pistonRes = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language, version, files, stdin: stdin || '' })
        })

        if (!pistonRes.ok) {
            const errorText = await pistonRes.text()
            console.error(`Piston API error (${pistonRes.status}):`, errorText)
            return res.status(pistonRes.status).json({
                error: `Piston API returned ${pistonRes.status}`,
                details: errorText
            })
        }

        const data = await pistonRes.json()
        return res.json(data)
    } catch (error) {
        console.error('Execution proxy error:', error.message)
        return res.status(500).json({ error: 'Failed to reach execution service' })
    }
})

setupSockets(wsServer);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})