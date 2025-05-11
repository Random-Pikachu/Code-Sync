import React, { useContext, useState } from 'react'
import {v4} from 'uuid'
import {useNavigate} from 'react-router-dom'

const Form = () => {
    const navigate = useNavigate()

    const [roomId, setRoomId] = useState('')
    const [userName, setUsername] = useState('')
    const createNewRoom = (e)=>{
        e.preventDefault()
        const id = v4()
        setRoomId(id)
        
        // console.log(id)
        
        
    }

    const joinRoom = () => {
        if (!roomId || !userName){
            return;
        }

        navigate(`/text-editor/${roomId}`, {
            state: {
                userName
            }, 
            replace: true
        })

    }

    return (
        <>  
        <div className="flex flex-col gap-4 w-full ">
            <form className='flex w-full flex-col gap-4'>
            <input
                    type="text"
                    name="roomId"
                    onChange={(e) => setRoomId(e.target.value)}
                    value={roomId}
                    placeholder="Room Id"
                    className=" rounded-md border font-[Fira_Code] border-white bg-darkHover px-3 py-3 bg-[#040024] focus:outline-none text-white placeholder-amber-50" 
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-md border font-[Fira_Code] bg-[#040024] border-white bg-darkHover px-3 py-3 focus:outline-none text-white placeholder-amber-50" 
                />
                <button
                    type='button'
                    className="mt-2 w-full rounded-md bg-primary px-8 py-3 text-lg font-bold text-[#040024] bg-[#4F91EC]"

                    onClick={() => {
                        joinRoom();
                    }}

                >
                    Join
                </button>           
            </form>   

            <button
                onClick={createNewRoom}
                className="cursor-pointer select-none underline text-white font-[Fira_Code]"
            >
                Generate Unique Room Id
            </button>
        </div>
        </>
    )
}

export default Form