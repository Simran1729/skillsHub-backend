const SUBSECTIONS = require('../models/SubSection')
const SECTIONS = require('../models/Section');
const { uploadToCloudinary } = require('../utils/imageUploader');
require('dotenv').config()

exports.createSubSection = async(req, res) => {
    try{

        const {title, timeDuration, description, sectionId} = req.body;
        const video = req.files.videoFile

        if(!title || !timeDuration || !video || !description){
            return res.status(400).json({
                success: false,
                message : "please give all the details"
            })
        }

        //uplpoad teh video on cloudinary and get the url for it
        const videoUploadResponse = await uploadToCloudinary(video, process.env.FOLDER_NAME);
        const videoUrl = videoUploadResponse.secure_url;

        const newSubSection = await SUBSECTIONS.create({
            title, description, timeDuration, videoUrl
        })


        //update the section for this section_id
        const updatedSection = await SECTIONS.findByIdAndUpdate(sectionId, 
            {
                $push : { subSection : newSubSection._id }
            },
            {new : true}
        ).populate("subSection").exec()

        return res.status(200).json({
            success : true,
            message : "subsection created",
            updatedSection
        })

    } catch(err) {
        return res.status(400).json({
            success : false,
            message : "error createing subsection",
            error : err.message
        })
    }
}



exports.updateSubSection = async(req, res) => {
    try{

        const{title, timeDuration, description, subSectionId} = req.body
        const video = req.files ?  req.files.videoFile : null


        if(!subSectionId){
            return res.status(400).json({
                success : false,
                messagse : "Subsection id is required"
            })
        };

        const updateData = {}
        if (title){
            updateData.title = title;
        }   
        if(timeDuration){
            updateData.timeDuration = timeDuration
        }
        if(description){
            updateData.description = description
        }


        if(video){
            const videoUploadResponse = await uploadToCloudinary(video, process.env.FOLDER_NAME);
            updateData.videoUrl = videoUploadResponse.secure_url;
        }

        //update the subsection
        const updatedSubsection = await SUBSECTIONS.findByIdAndUpdate(subSectionId, updateData, {new : true}).exec();

        if(!updatedSubsection){
            return res.status(404).json({
                success : false,
                message : "Subsection not found"
            })
        }

        return res.status(200).json({
            success : true,
            message : "subsection updated successfully"
        })

    } catch(err){
        return res.status(500).json({
            success : false,
            message : "error updating subSection",
            error : err.message
        })
    }
}


exports.deleteSubSection = async(req, res) => {
    try{

        const{ subSectionId , sectionId} = req.body;
        if(!subSectionId || !sectionId){
            return res.status(400).json({
                success : false,
                message : "please provide subsection and section id"
            })
        }

        //delete the subsectin by id
        await SUBSECTIONS.findByIdAndDelete(subSectionId);

        //now update the sections
        await SECTIONS.findByIdAndUpdate(sectionId, 
            {
                $pull : {
                    subSection : subSectionId
                }
            },
            { new : true}
        )

        return res.status(200).json({
            success : true,
            message : "subsection deleted successfully"
        })

    } catch(err){
        return res.status(500).json({
            success : false,
            message : "error deleting subsection",
            error : err.message
        })
    }
}