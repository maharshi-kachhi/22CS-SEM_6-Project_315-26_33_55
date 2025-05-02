import userModel from "./../models/userModel.js"
import {comparePassword, hashPassword,} from './../helpers/authHelper.js';
import JWT from "jsonwebtoken";

export const registerController = async (req,res) => {
    try{
        const {name,email,password,phone}=req.body;
        if (!name)      {return res.send({ error: "Name is Required" })}
        if (!email)     {return res.send({ message: "Email is Required" })}
        if (!password)  {return res.send({ message: "Password is Required" })}
        if (!phone)     {return res.send({ message: "Phone no is Required" })}

        
        //check karva mate
        const existingUser=await userModel.findOne({email});
        if (existingUser){
            return res.status(200).send({
                success:false,
                message:"account already exists with this mail"
            })
        }


        const hashedPassowrd = await hashPassword(password);
        const user=await new userModel({name,email, phone,password:hashedPassowrd,}).save();


        res.status(201).send({
            success:true,
            message:"user registered succesfully",
            user,
        })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({
          success: false,
          message: "Error in Registeration",
          error,
        })
    }
}

//login 
export const loginController=async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(404).send({
                success:false,
                message:"invalid email or passwors"
            })
        }

        const user=await userModel.findOne({email});
        if(!user){
            return res.status(404).send({
                success:false,
                message:"email not registered"
            })
        }

        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password",
            })
        }
        
        //token
        const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {expiresIn: "7d",})

        res.status(200).send({
            success:true,
            message:"login sucessfully",
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
                phone:user.phone, 
                role:user.role,    
            },
            token,
        })
    }
    catch(error){
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in login",
            error
        })
    }
}


//test mate nu che aa
export const testController = (req, res) => {
    try {
        res.send("this route is protected for admin");
    } 
    catch (error) {
        console.log(error)
        res.send({error})
    }
}