import { useState, useEffect } from "react"
import { useAuth } from "./../context/auth";
import {Outlet} from "react-router-dom";
import axios from "axios";
import Error404 from "./../pages/pagenotfound.js"

export default function PrivateRoute(){
    const [ok, setOk] = useState(false);
    // eslint-disable-next-line
    const [auth, setAuth] = useAuth();

    useEffect(()=>{
        const authCheck = async()=>{
            const res = await axios.get("/api/v1/auth/user-auth");
            if(res.data.ok)
                setOk(true)
            else
                setOk(false)
            }
        if(auth?.token) 
            authCheck();
    },[auth?.token]);

    return ok ? <Outlet /> : <Error404/>
}
