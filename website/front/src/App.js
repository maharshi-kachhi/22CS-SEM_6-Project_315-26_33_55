import {Routes,Route} from 'react-router-dom';
import Login from './pages/Auth/login.js';
import Signup from './pages/Auth/signup.js';
import Home from './pages/home.js'
import Error404 from './pages/pagenotfound.js';
import Profile from './pages/profile.js';
import PrivateRoute from './routes/private.js';
import Temp from './pages/temp.js';
import  Temp2 from './pages/temp2.js';



function App() {
  return (
    <>
      <Routes>
        <Route path='/temp2' element={<Temp2/>}/>
        <Route path='/temp' element={<Temp/>}/>


        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='*' element={<Error404/>}/>

        <Route path="profile" element={<PrivateRoute/>}>
          <Route path="" element={<Profile/>}/>
        </Route>
        

      </Routes>
    </>
  );
}

export default App;
