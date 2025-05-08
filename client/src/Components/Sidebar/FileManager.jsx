import React from 'react'
import FileTree from './FileTree'
import data from './data.json'


const FileManager = () => {
  return (
    <>
        <div className=''>
          <FileTree data = {data}/>
        </div>
    </>
  )
}

export default FileManager