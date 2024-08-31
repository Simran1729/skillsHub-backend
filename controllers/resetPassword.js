const USERS = require('../models/User');
const mailSender = require('../utils/mailSender')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

//reset password token
exports.resetPasswordToken = async (req , res) => {
    try{
        const {email} = req.body
        if(!email){
            return res.status(400).json({
                success : false,
                message : "Enter email"
            })
        }

        const user = USERS.findOne({email})
        if(!user){
            return res.status(400).json({
                success : false,
                message : "No valid user found"
            })
        }

        const token = crypto.randomUUID();
    
        //user found, now genearte a link
        const url = `http://localhost:5173/reset-password/${token}`

        //update the user
        const updatedUserDetails = await USERS.findOneAndUpdate({email : email}, {
                                                                    token : token,
                                                                    resetPasswordExpires : Date.now() + 5*60*1000
                                                                }, {new : true});
        
        console.log(updatedUserDetails);

        //send mail with this url now
        await mailSender(email,
                        `Password Reset Link : ${url}`,
                        "Password Reset Link");


        return res.status(200).json({
            success : true,
            message : "Mail sent successfully, Please check your mail and reset password"
        })

    } catch(err){
        return res.status(500).json({
            success : false,
            error : err.message,
            message : "error sending resetting link"
        })
    }
}


//resetPassword
exports.resetPassword = async (req, res) => {
    try{
        // we will get the token from the parameter, frontend will do this for us
        const{token, password, confirmPassword} = req.body;
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "password not matching"
            })
        }

        const user = await USERS.findOne({token : token});
        if(!user){
            return res.status(400).json({
                success : false,
                message : "Token is invalid"
            })
        }

        if(user.resetPasswordExpires < Date.now()){
            return res.status(400).json({
                successs : false,
                message : "token expired, try resetting again"
            })
        }
        
        //token is still valid now
        //first hash the password
        const hashedPassword = bcrypt.hash(password, 10);

        await USERS.findOneAndUpdate({token : token}, {password : hashedPassword}, {new : true})

        return res.status(200).json({
            success : true,
            message : "Password reset successful"
        })
        

    } catch(err){
        return res.status(500).json({
            success : false,
            error : err.message,
            message : "error resetting password"
        })
    }
}