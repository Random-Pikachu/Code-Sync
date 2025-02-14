import {io} from 'socket.io-client'


export const initializeSocket = async ()=>{
   
    try{ 
    
    const options = {
        transports: ['websocket']
    }

    return io(`http://localhost:5600`, options)
    
    }

    catch(e){
        console.log('error in connection ', e)
    }
}