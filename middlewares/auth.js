const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.auth = (req , res, next) => {
    // get the token
    try{

        //get token from either body or header or cookie
        const token = req.body.token || req.cookies.token || req.header("Authorization").replace("Bearer", "");

        if(!token || token == undefined){
            return res.status(401).json({
                success : false,
                message : "token is missing"
            })
        }

        //verify the token
        try{
            const decode = jwt.decode(token, process.env.JWT_SECRET_KEY)

            req.user = decode;
            
            next();

        } catch(error){
            return res.status(401).json({
                success : false,
                message : "invalid token"
            })
        }

    }
    catch(err){
        return res.status(401).json({
            success : false,
            message : "authentication failed",
            error : err.message
        })
    }
}

exports.isStudent = (req, res, next) => {
    try{
        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success : false,
                message : "This is a protected route for students"
            })
        }

        next();
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "Error occured whlie student authorization"
        })
    }
}


exports.isInstructor = (req, res, next) => {
    try{
        if(req.user.accountType !== 'Instructor'){
            return res.status(401).json({
                success : false,
                message : "This is a protected route for Instructors"
            })
        }

        next();
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "Error occured whlie Instructor authorization"
        })
    }
}


