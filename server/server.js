import express from 'express';
import cors from 'cors';
import {createServer} from 'http';

const app = express();
const PORT = process.env.PORT || 5600;

app.use(cors());

app.get('/', (req, res) => {
    return res.status(200).send('Server is running')
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})