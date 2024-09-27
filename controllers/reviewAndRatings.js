//create rating
//get average rating
//get all ratings

const RATINGandREVIEWS = require('../models/RatingAndReview');
const COURSES = require('../models/Course');
const USERS = require('../models/User');
const mongoose = require('mongoose')

exports.createRating = async(req, res) => {
    try{
        const userId = req.user.id;
        const {rating, review, courseId} = req.body;

        //now check if the user is enrolled in the course or not
        const userEnrolled = await COURSES.findOne(
                                {_id : courseId,
                                    studentsEnrolled : {$elemMatch : {$eq : userId}}
                                })

        if(!userEnrolled){
            return res.status(404).json({
                success : false,
                message : "Student is not enrolled in the course"
            })
        }

        //check if user has already reviewd the course
        const alreadyReviewed = await RATINGandREVIEWS.findOne({
                    user : userId,
                    course : courseId
        })

        if(alreadyReviewed){
            return res.status(403).json({
                success : false,
                message : "Course has already been reviewed by the user"
            })
        }

        //now create a new rating and review
        const ratingAndReview = await RATINGandREVIEWS.create({
            rating, review, 
            user : userId, 
            course : courseId
        })


        const updatedCourse = await COURSES.findOneAndUpdate({_id : courseId},
                                                            {
                                                                $push : {
                                                                    ratingAndReviews : ratingAndReview._id
                                                                }
                                                            },
                                                            {new : true}
                                                        )

            console.log(updatedCourse)
            //return response
            return res.status(200).json({
                success : true,
                message : "Successfully created rating and review"
            })
        

    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}


exports.getAllRatingsOfCourse = async(req, res) => {
    try{

        const {courseId} = req.body

        const allRatings = await RATINGandREVIEWS.find(
                                {course : mongoose.Types.ObjectId(courseId)})
                                .sort({rating : "desc"})
                                .populate({
                                    path : "User",
                                    select : "firstName lastName email image"
                                })
                                .populate({
                                    path : "Course",
                                    select : "courseName"
                                }).exec()

        if(!allRatings){
            return res.status(200).json({
                success : true,
                message : "No ratings found for this course"
            })
        }

        return res.status(200).json({
            success : true,
            message : "All ratings fetched successfully",
            data : allRatings
        })
        
    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}



exports.getAllRatings = async(req, res) => {
    try{

        const {courseId} = req.body

        const allRatings = await RATINGandREVIEWS.find({})
            .sort({rating : "desc"})
            .populate({
                path : "User",
                select : "firstName lastName email image"
            })
            .populate({
                path : "Course",
                select : "courseName"
            }).exec()

        return res.status(200).json({
            success : true,
            message : "All ratings fetched successfully",
            data : allRatings
        })


    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}




exports.getAverageRating = async(req, res) => {
    try{

        const {courseId} = req.body

        const result = await RATINGandREVIEWS.aggregate([
            {
                $match : { course : mongoose.Types.ObjectId(courseId)}
            },
            {
                $group : {
                    _id : null,
                    avgRating : {$avg : "$rating"}
                }
            }
        ])

        //the aggregate gives the response in arrays

        if(result.length > 0){
            return res.status(200).json({
                success : true,
                averageRating : result[0].avgRating,
            })
        }

        // no rating found
        return res.status(200).json({
            success : true,
            message : "no rating found for this course",
            averageRating : 0
        })


    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}