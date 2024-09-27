const USERS = require('../models/User');
const PROFILE = require('../models/Profile')
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken')
const OTP = require('../models/OTP')
const { v4: uuidv4 } = require('uuid');

function generateOTP() {
    const uuid = uuidv4();
    // Convert UUID to numeric string and take the first 6 digits
    return parseInt(uuid.replace(/[^0-9]/g, '').substring(0, 6), 10);
}




// contains logic for signup, login and changePassword

exports.signUp = async(req, res) => {

    try{
        const {firstName, lastName, email, password, confirmPassword, accountType, otp, gender} = req.body;
        if(!email || !firstName || !password || !accountType || !lastName || !confirmPassword || !otp || !gender){
            return res.status(401).json({
                success : false,
                message : "fill complete details"
            })
        }

        //check if both passwords match or not
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "password and confirm password fields doesn't match"
            })
        }

        //check if user exist in db
        const userExists = await USERS.findOne({email, firstName, accountType})
        if(userExists){
            return res.status(400).json({
                message : "user already exists, try logging in"
            })
        }else{

            //get the genearted otp from db - latest one for the email
            const latest_otp = await OTP.findOne({email}).sort({createdAt : -1}).limit(1);
            console.log("latest_otp from db : ", latest_otp)

            if(latest_otp.length == 0){
                return res.status(400).json({
                    success : false,
                    message : "no otp found, try sending otp again"
                })
            }

            if(otp != latest_otp.otp){
                return res.status(400).json({
                    success : false,
                    message : "otp doesn't match, try creating a new otp"
                })
            }

            //otp matched -->
            //hash the password and store the user in db
            let hashedPassword;
            try{
                hashedPassword = await bcrypt.hash(password, 10);
            }catch(err){
                return res.status(500).json({
                    success : false,
                    message : "error hashing password"
                })
            }


            const profileDetails  = await PROFILE.create({
                gender : gender,
                dateOfBirth : null,
                about : null,
                contactNumber : null
            })

            let image_api = 'https://avatar.iran.liara.run/public/girl'
            if(gender != 'female'){
                image_api = 'https://avatar.iran.liara.run/public/boy'
            }

            const user = await USERS.create({
                firstName, lastName, email, accountType, password : hashedPassword,
                additionalDetails : profileDetails._id,
                image : image_api
            })

            
            return res.status(200).json({
                success : true,
                message : "user created successfully",
                user : user
            })
        }
    } 
    catch(err){
        res.status(500).json({
            error : "error signing up",
            message : err.message
        })
    }

}



exports.login = async(req , res) => {
    try{

        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "fill complete details"
            })
        }
            
        let user = await USERS.findOne({email});

        if(!user){
                return res.status(404).json({
                    success : false,
                    message : "user doesn't exist, try signing up"
                })
        }

        //user exists, check the hashed passwrod against password
        if(await bcrypt.compare(password, user.password)){
            
            const payload = {
                firstName : user.firstName,
                lastName : user.lastName,
                email : user.email,
                id : user._id,
                accountType : user.accountType
            }

            let token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
                expiresIn : "3h",
            });

            user = user.toObject();
            user.token = token;
            user.password = undefined;

            const options = {
                expires : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly : true,
            }

            res.cookie("token", token, options).status(200).json({
                message : "logged in successfully",
                success : true,
                user,
                token
            })
        
        }else{
            return res.status(403).json({
                success : false,
                message : "password doesn't match"
            })
        }
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message,
            error : "error signing up"
        })
    }
}



exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await USERS.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};


exports.sendOTP = async (req, res) => {
    try{
        const {email} = req.body;

        const user = await USERS.findOne({email})
        if(user){
            return res.status(400).json({
                success : false,
                message : "user already registered"
            })
        }

        //new user
        const otp = generateOTP();
        const otp_saved = await OTP.create({email, otp});
        console.log("otp-body: ", otp_saved)

        return res.status(200).json({
            success : true,
            message : "otp sent successfully"
        })

    } catch(err){
        return res.status(400).json({
            success : false,
            message : "error sending otp"
        })
    }
}