
import './App.css'
import { Button } from './components/ui/button'
import Login from './pages/Login'
import Home from './pages/Home'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
 
  return (
  <Router>
    <Routes>
      <Route path='/'element={<Login/>}/>
      <Route path='/home'element={<Home/>}/>

    </Routes>
  </Router>

  )
}

export default App
