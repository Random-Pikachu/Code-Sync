import React from 'react'

const Form = () => {
    return (
        <>  
        <div className="flex flex-col gap-4 w-full ">
            <form className='flex w-full flex-col gap-4'>
            <input
                    type="text"
                    name="roomId"
                    placeholder="Room Id"
                    className=" rounded-md border font-[Fira_Code] border-white bg-darkHover px-3 py-3 bg-[#040024] focus:outline-none text-white placeholder-amber-50" 
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full rounded-md border font-[Fira_Code] bg-[#040024] border-white bg-darkHover px-3 py-3 focus:outline-none text-white placeholder-amber-50" 
                />
                <button
                    type="submit"
                    className="mt-2 w-full rounded-md bg-primary px-8 py-3 text-lg font-bold text-[#040024] bg-[#4F91EC]"
                >
                    Join
                </button>           
            </form>   

            <button
                className="cursor-pointer select-none underline text-white font-[Fira_Code]"
            >
                Generate Unique Room Id
            </button>
        </div>
        </>
    )
}

export default Form