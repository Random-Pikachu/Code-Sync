import React from 'react'
import Hero from '../../assets/hero_.svg'
import Form from './Form'


const Home = () => {
  return (
    <>
        <div className='bg-[#020013] h-[100vh] flex flex-row gap-[15px]  justify-center items-center px-32'>
            {/* Hero Image */}
            <div className='text-white flex-1'>
                <img src={Hero} alt="" className='scale-125 animate-move'/>
            </div>

            {/* Right Side */}
            <div className='flex-2 flex flex-col items-end'>
                <div className="heding-topic flex flex-row gap-6 items-baseline text-right">
                    <h1 className='text-white font-[Inter] text-[80px] font-[400]'>Code</h1>
                    <h1 className='text-[#4F91EC] font-[Inter] text-[80px] font-[400]'>Sync</h1>
                </div>

                <div className="flex">
                <p className='text-white font-[Fira_Code] text-[20px] text-right'>A collaborative Text Editor</p>
                </div>
                <br />
                <div className="flex w-full items-center justify-center sm:w-1/2">
                    <Form />
                </div>


            </div>
        </div>
    </>
  )
}

export default Home