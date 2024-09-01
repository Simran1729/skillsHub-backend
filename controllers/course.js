const COURSES = require('../models/Course')
const USERS = require('../models/User')
const CATEGORIES = require('../models/Category')
const SECTIONS = require('../models/Section')
const SUBSECTIONS = require('../models/SubSection')
const {uploadToCloudinary} = require('../utils/imageUploader')

exports.createCourse = async (req, res) => {
    try{

        const{name , description, whatYouWillLearn, price, category} = req.body;
        const thumbnail = req.files.thumbnail

        const instructor_id = req.user.id 

        const instructorDetails = USERS.findById(instructor_id)

        if(!name || !description || !whatYouWillLearn || !price || !thumbnail || !category){
            return res.status(400).json({
                success : false,
                message : "please fill all the deatils to create a course"
            })
        }

        const categoryDetails = await CATEGORIES.findById(category)
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
                                            category : categoryDetails._id
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
            {_id : category},
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


