import {BrowserRouter, Route, Routes} from 'react-router-dom'


import Home from './Components/HomePage/Home'
import EditorPage from './Components/Editor/EditorPage'

function App() {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/text-editor/:RoomID' element={<EditorPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App