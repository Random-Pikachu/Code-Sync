import { io } from 'socket.io-client'

let socketInstance = null

export const initializeSocket = async () => {
    if (socketInstance && socketInstance.connected) {
        return socketInstance
    }

    try {
        const options = {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        }

        socketInstance = io(`https://code-sync-rlsh.onrender.com`, options)
        return socketInstance
    }
    catch (e) {
        console.log('error in connection ', e)
    }
}

export const getSocket = () => socketInstance