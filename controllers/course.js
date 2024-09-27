const COURSES = require('../models/Course')
const USERS = require('../models/User')
const CATEGORIES = require('../models/Category')
const SECTIONS = require('../models/Section')
const SUBSECTIONS = require('../models/SubSection')
const {uploadToCloudinary} = require('../utils/imageUploader')


//TODO : write handler for getting most popular courses
//TODO : Write handler for getting get started with these courses
//TODO : handler for getting courses of a particular category


exports.createCourse = async (req, res) => {
    try{

        const{name , description, whatYouWillLearn, price, category, tags} = req.body;
        const thumbnail = req.files.thumbnail

        const instructor_id = req.user.id 

        const instructorDetails = USERS.findById(instructor_id)

        if(!name || !description || !whatYouWillLearn || !price || !thumbnail || !category || !tags){
            return res.status(400).json({
                success : false,
                message : "please fill all the deatils to create a course"
            })
        }

        const categoryDetails = await CATEGORIES.findOne({ name: category });
        if(!categoryDetails){
            return res.status(400).json({
                success : false,
                message : "invalid category"
            })
        }

        //upload thumbnail image to cloudinary
        const imageUploadResponse = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME);


        const newCourse = await COURSES.create({courseName : name, 
                                            courseDescription : description,
                                            instructor : instructor_id, //check this line
                                            whatYouWillLearn : whatYouWillLearn,
                                            price : price,
                                            thumbnail : imageUploadResponse.secure_url,
                                            category : categoryDetails._id,
                                            tags : tags
        })

        //update the user's ( For instructors) courses array in db as new course is created
        await USERS.findByIdAndUpdate(
            {_id : instructor_id},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true}
        )

        //update CATEGORIES too
        await CATEGORIES.findByIdAndUpdate(
            {_id : categoryDetails._id},
            {
                $push : {
                    courses : newCourse._id, 
                }
            },
            { new : true}
        )

        return res.status(200).json({
            success : true,
            message : "course created successfully",
            data : newCourse
        })


    } catch(err){
        return res.status(400).json({
            success : false,
            message : "error occured while creating course",
            error : err.message
        })
    }
}



exports.getAllCourses = async (req, res) => {
    try{

        const allCourses = await COURSES.find({},{ courseName : true,
                                                   price : true,
                                                   thumbnail: true,
                                                   instructor : true,
                                                   ratingAndReviews : true}).populate("instructor").exec();

        return res.status(200).json({
            success : true,
            message : "all courses fetched successfully",
            data : allCourses
        })

    } catch(err){
        return res.status(500).json({
            success : false,
            error : err.message,
            message : "error fetching all courses"
        })
    }
}



exports.getCourseDetails = async(req, res) => {
    try{
        const {courseId} = req.body;
        
        const course = await COURSES.find({_id : courseId})
                                        .populate(
                                            {
                                                path : "instructor",
                                                populate : {
                                                    path : "additionalDetails",
                                                },
                                            }
                                        )
                                        .populate("category")
                                        .populate("ratingAndReviews")
                                        .populate({
                                            path : "courseContent",
                                            populate : {
                                                path : "SubSection"
                                            },
                                        })
                                        .exec();


        if(!course){
            return res.status(404).json({
                success : false,
                message : "Course not found"
            })
        }


        return res.status(200).json({
            success : true,
            message : "Course detailes fetched",
            data : course
        })


    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}