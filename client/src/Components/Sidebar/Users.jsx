import React, { useContext, useEffect } from 'react'
import { CodeDataContext } from './CodeData'
import Avatar from 'react-avatar'
// import { useLocation, useParams } from 'react-router-dom'
import { Toaster, toast } from 'alert';

const Users = () => {
  const {userlist, RoomId} = useContext(CodeDataContext)
  // const {RoomID} = useParams()


  return (
    <>
         <Toaster />

          {/* <button onClick={() => console.log(userlist)}>Click me</button> */}

        <h1 className='block text-[20px] font-[Montserrat_SemiBold] text-gray-900 dark:text-[#eeeeee] px-17 pt-8'> Connected Clients</h1>
        <div className='w-[80%] h-[3px] bg-amber-50 mx-auto mt-2'></div>
        {
          Object.keys(userlist.userList).map((name) => (
              <>
                
                
                  <Avatar className = 'mt-3 ml-6 mr-6' name={name} size="70" round={true} />
              
              </>
          ))
        }

          <div className='fixed bottom-10 w-[40%] left-[68%]'>
          <button 
                type="button" 
                onClick={() => {
                  navigator.clipboard.writeText(RoomId);
                  toast('Room ID copied to clipboard!')
                }}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 w-[60%] dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                
            >Copy Room ID</button>
            </div>
    </>
  )
}

export default Users