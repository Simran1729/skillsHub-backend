const SECTIONS = require('../models/Section')
const COURSES = require('../models/Course')


exports.createSection = async (req, res) => {
    try{
        const{name, courseId} = req.body;

        if(!name){
            return res.status(400).json({
                success : false,
                message : "please give all the details"
            })
        }

        const newSection = await SECTIONS.create({name})

        const updatedCourseDetails = await COURSES.findByIdAndUpdate(courseId, 
            {
                $push : {
                    courseContent : newSection._id,
                    }
            },
            { new : true}
        ).populate({
            path : 'courseContent',
            model :'Section',
            populate : {
                path : 'subSection',
                model : 'Su bSection'
            }
        }).exec();

        return res.status(200).json({
            success : true,
            message : "section created successfully",
            updatedCourseDetails
        })


    } catch(err){
        return res.status(400).json({
            success : false,
            error : err.message,
            message : "error creating Section"
        })

    }
}


exports.deleteSection = async (req, res) => {
    try{
        
        // const {sectionId} = req.body;
        // getting id from params

        const {sectionId} = req.params
        const {courseId} = req.body

        if(!sectionId){
            return res.status(400).json({
                success : false,
                message : "please provide section ID"
            })
        }

        if(!courseId){
            return res.status(400).json({
                success : false,
                message : "please provide course id"
            })
        }

        await SECTIONS.findByIdAndDelete(sectionId)

        //remove the section from COURSES 
        await COURSES.findByIdAndUpdate(
            courseId,
            {
                $pull : { courseContent : sectionId}
            }, 
            {new : true}
        );

        return res.status(200).json({
            success : true,
            message : "section deleted successfully"
        })

    } catch(err){
        return res.status(500).json({
            success : false,
            message : "error deleting the section",
            error : err.message
        })
    }
}


exports.updateSection = async (req, res) => {
    try{
        const{sectionName, sectionId} = req.body;

        if(!sectionName){
            return res.stauts(400).json({
                success : false,
                message : "provide all details"
            })
        }

        await SECTIONS.findByIdAndUpdate(sectionId , 
            {
                name :sectionName
            },
            {new : true}
        );

        return res.stauts(200).json({
            success : true, 
            message : "Section updated successfully"
        })

    } catch(err){
        return res.status(500).json({
            success : false,
            message : "error updating the section",
            error : err.message
        })
    }
}