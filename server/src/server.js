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

    if (!language || !files || !files[0]) {
        return res.status(400).json({ error: 'Missing language or files' })
    }

    const compilerMap = {
        'javascript': 'nodejs-20.11.0',
        'typescript': 'typescript-5.3.3',
        'python': 'cpython-3.12.1',
        'python3': 'cpython-3.12.1',
        'c': 'gcc-13.2.0',
        'c++': 'gcc-13.2.0',
        'cpp': 'gcc-13.2.0',
        'java': 'openjdk-jdk-21+35',
        'go': 'go-1.21.6',
        'rust': 'rust-1.76.0',
        'ruby': 'ruby-3.3.0',
        'php': 'php-8.3.2',
        'bash': 'bash',
    }

    const compiler = compilerMap[language.toLowerCase()]
    if (!compiler) {
        return res.status(400).json({ error: `Unsupported language: ${language}` })
    }

    const isC = ['c'].includes(language.toLowerCase())
    const isCpp = ['c++', 'cpp'].includes(language.toLowerCase())

    try {
        const wandboxBody = {
            code: files[0].content || '',
            compiler,
            stdin: stdin || '',
            ...(isC && { options: 'warning,c17' }),
            ...(isCpp && { options: 'warning,c++17' }),
        }

        const wandboxRes = await fetch('https://wandbox.org/api/compile.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wandboxBody)
        })

        if (!wandboxRes.ok) {
            const errorText = await wandboxRes.text()
            console.error(`Wandbox API error (${wandboxRes.status}):`, errorText)
            return res.status(wandboxRes.status).json({ error: `Execution service error: ${wandboxRes.status}` })
        }

        const result = await wandboxRes.json()

        // Normalize to Piston-compatible response format
        return res.json({
            run: {
                stdout: result.program_output || '',
                stderr: result.compiler_error || result.program_error || '',
                output: (result.program_output || '') + (result.compiler_error || result.program_error || ''),
                code: result.status || 0,
            }
        })
    } catch (error) {
        console.error('Execution proxy error:', error.message)
        return res.status(500).json({ error: 'Failed to reach execution service' })
    }
})

setupSockets(wsServer);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})