import {io} from 'socket.io-client'

export const initializeSocket = async ()=>{
   
    try{ 
    
    const options = {
        transports: ['websocket']
    }

    return io(`https://code-sync-rlsh.onrender.com`, options)
    
    }

    catch(e){
        console.log('error in connection ', e)
    }
}