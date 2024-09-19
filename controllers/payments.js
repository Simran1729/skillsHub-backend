/* 
for payment gateway intergration
1. we need to capture the payment
2. then the razorpay module opens up
3. You will see qr code and user pays thorugh it
4. bank transfers money to razorpay
5. if payment is successful - we have a webhook in razorpay
   webhook --> if xyz happens then hit this server on this api lets say verify signature
   and our signature will verify the secret key we sent it for authentication and authorization


--> read proxy server

*/

const mongoose = require('mongoose')

const {razorpayInstance} = require('../config/razorpay')
const COURSES = require('../models/Course')
const USERS = require('../models/User')
const mailSender = require('../utils/mailSender')
const crypto = require('crypto')


exports.capturePayment = async (req, res) => {
    try{
        const {courseId} = req.body
        const userId = req.user.id;
        
        //validation for courseId
        if(!courseId){
            return res.status(400).json({
                success : false,
                message : "provide the courseId"
            })
        }


        let courseDetails = await COURSES.findById(courseId)
            if(!courseDetails){
                return res.status(404).json({
                    success : false,
                    message : "not course found"
                })
            }

            //converting string user id to mongoose objectid
            let user_object_id = mongoose.Types.ObjectId(userId)
            //check if user has already bought the course
            
            if(courseDetails.studentsEnrolled.includes(user_object_id)){
                return res.status(200).json({
                    success : false,
                    message : "student is already enrolled"
                })
            }

            //create order
            const amount = courseDetails.price;
            const currency = "INR";

            const options = {
                amount : amount*100,
                currency,
                receipt : Math.random(Date.now()).toString(),
                notes : {
                    courseId,
                    userId
                }
            }

            //function call
            try{
                 //initiate the payment using razorpay
                 const paymentResponse = await razorpayInstance.orders.create(options);
                 console.log(paymentResponse)

                 return res.status(200).json({
                    success : true,
                    message : "payment successfully initiated",
                    courseName : courseDetails.courseName,
                    courseDescription : courseDetails.courseDescription,
                    courseThumbnail : courseDetails.thumbnail,
                    orderId : paymentResponse.id,
                    amount : paymentResponse.amount
                 })

            } catch(err){
                return res.status(200).json({
                    success : false,
                    error : err.message,
                    message : "error initiating payment"
                })
            }

    } catch(err){
        return res.status(400).json({
            success : false,
            message : "error in capturing payment"
        })
    }
}


exports.verifySignature = async(req, res) => {
    try{
        const webhookSecret = '0123456789'
        const signature = req.headers["x-razorpay-signature"];

        const shaSum = crypto.createHmac("sha256", webhookSecret); //step1
        shaSum.update(JSON.stringify(req.body)) //converting into string
        const digest = shaSum.digest("hex");

        if(signature === digest){
            console.log("payment is authorized")
            //that means you can enroll the student in the course
            //remeber that you passed userId and courseID in the notes of the order in previous controller
            const {courseId,userId} = req.body.payload.payment.entity.notes;

            try{
                //perform the action
                const enrolledCourse = await COURSES.findByIdAndUpdate(
                                                    {_id : courseId},                              
                                                    {$push : {studentsEnrolled : userId}},                                                               
                                                    {new : true},                                                                
                                                );
                

                if(!enrolledCourse){
                    return res.status(500).json({
                        success : false,
                        message : "Something went wrong while updating Course information"
                    })
                }

                console.log(enrolledCourse);

                //now update teh studnet too
                const updatedStudent = await USERS.findByIdAndUpdate(
                    {_id : userId},
                    {$push : {courses : courseId}},
                    {new : true},
                )

                if(!updatedStudent){
                    return res.status(500).json({
                        success : false,
                        message : "Something went wrong while updating student information"
                    })
                }

                console.log(updatedStudent);

                //send the confirmation mail to student
                const emailResponse = mailSender(
                    updatedStudent.email,
                    "Congratulations, you are now enrolled in new course. Please Log in to your dashboard",
                    "Congratulations!"
                )

                console.log(emailResponse);
                return res.status(200).json({
                    success : true,
                    message : "Signature verified and course added"
                })
            } catch(err){
                return res.status(500).json({
                    success : false,
                    message : err.message
                })
            }
        } else{
            return res.status(400).json({
                success : false,
                message : "signature not matching"
            })
        }

    } catch(err){
        return res.status(500).json({
            success : false,
            message : "server error while verfiying signature"
        })
    }
}