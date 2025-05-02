import express from 'express';
import { registerController, loginController, testController } from "./../controller/authController.js";
import {isAdmin, requireSignIn} from './../middlewares/authMiddleware.js'


const router = express.Router();


router.post('/register', registerController);

router.post('/login',loginController);

router.get('/test',requireSignIn,isAdmin,testController );//order change na karto

//route to prevent not logedin user for accesing things
router.get("/user-auth", requireSignIn, (req,res)=>{
    res.status(200).send({ok:true})
})

export default router;
