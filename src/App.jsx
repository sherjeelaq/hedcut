import { Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'

import './App.css'

function App() {
  return (
    <div>
      <Sidebar />
      <div className='content'>
        <Outlet />
      </div>
    </div>
  )
}

export default App
