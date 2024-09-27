const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

// const otpSchema = new mongoose.Schema({
//     email : {
//         type : String,
//         required : true,
//     },
//     otp : {
//         type : String,
//         required : true,
//     },
//     createdAt : {
//         type : Date,
//         default : Date.now(),
//         index: { expires: '5m' }
//     }
// });

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Use Date.now without parentheses
    }
});

// Add the index to the schema
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }); // 300 seconds = 5 minutes


// pre hook to send verification email
async function sendVerificationMail (email, otp) {
    try {
        const mailResponse = await mailSender(email, otp, "verification email from SkillsHub");
        console.log("Email sent successfully", mailResponse);
    }
    catch(err){
        console.log("eror while sending email", err.message);
        throw err;
    }
}


//this.email and this.otp --> current object's data
otpSchema.pre("save", async function (next){
    await sendVerificationMail(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP", otpSchema);