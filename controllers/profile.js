const USERS = require('../models/User')
const PROFILES = require('../models/Profile')
const COURSES = require('../models/Course')
const mongoose = require('mongoose')

exports.updateProfile = async (req, res) => {
    try{
        
        const{dateOfBirth="", contactNumber, about} = req.body;
        const {userId} = req.user.userId

        if(!userId){
            return res.status(400).json({
                success : false,
                message : "please provide userID"
            })
        }

        if(!contactNumber || !about){
            return res.status(400).json({
                success : false,
                message : "provide the required fields"
            })
        }
    
        //find profile
        const userDetails = await USERS.findById(userId);
        const profileId = userDetails.additionalDetails; //this will contain profile id since aditionalDetails contain ids and not direct objects or data

        const profileDetails = await PROFILES.findById(profileId);

        profileDetails.contactNumber = contactNumber
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about

        //use save when you have an instance of mongodb document and made changes to as you did in the above line, use save then
        await profileDetails.save()

        return res.status(200).json({
            success : true,
            message : "profile updated successfully"
        })
 
    } catch(err){
        return res.status(400).json({
            success : false,
            message : "error updating profile, try again"
        })
    }
}



exports.deleteAccount = async (req, res) => {
    try{
        const userId = req.user.id;

        const userDetails = await USERS.findById(userId)
        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : "user not found"
            })
        }

        const profileid = userDetails.additionalDetails

        //convert my strings userid to mongoose object id
        const user_object_id = mongoose.Types.ObjectId(userId)

        //delete the user from course's enrolled students array
        await COURSES.updateMany(
          { studentsEnrolled : user_object_id},
          {
            $pull : { studentsEnrolled : user_object_id}
          }
        );

        //delete the corresponding datea form profiles
        await PROFILES.findByIdAndDelete(profileid);

        //now delete the user
        await USERS.findByIdAndDelete(userId);

        return res.status(200).json({
            success : true,
            message : "account deleted successfully"
        })

    } catch(err){
        return res.status(400).json({
            success : false,
            message : "error deleting account"
        })
    }
}


exports.getUserDetails = async(req, res) => {
    try{
        const userId = req.user.id
        
        const userDetails = USERS.findById(userId).populate("additionalDetails").exec();

        return res.status(200).json({
            success : true,
            message : "User data fetched successfully",
            userDetails
        })

    } catch(err){
        return res.status(400).json({
            success : False,
            message : "Error getting user details"
        })
    }
}


/* 
we have this cron job scheduler to schedule the delete after 5 days and even cancel it in between
const cron = require('node-cron');

// Create a map to store the scheduled jobs
const scheduledJobs = new Map();

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const userDetails = await USERS.findById(userId)
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "user not found"
      })
    }

    // Calculate the cron expression for 5 days from now
    const date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const minute = date.getMinutes();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;

    // Create a cron expression
    const cronExpression = `${minute} ${hour} ${day} ${month} *`;

    // Schedule the account deletion using a cron job
    const job = cron.schedule(cronExpression, async () => {
      try {
        const profileid = userDetails.additionalDetails
        // Delete the corresponding data from profiles
        await PROFILES.findByIdAndDelete(profileid);

        // Now delete the user
        await USERS.findByIdAndDelete(userId);
      } catch (err) {
        console.error(err);
      }
    }, {
      // Run the cron job only once
      scheduled: true,
      timezone: "America/New_York" // Set the timezone
    });

    // Store the scheduled job in the map
    scheduledJobs.set(userId, job);

    return res.status(200).json({
      success: true,
      message: "Account deletion scheduled for 5 days from now"
    })
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Error scheduling account deletion"
    })
  }
}

// New function to cancel the scheduled job
exports.cancelAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the scheduled job from the map
    const job = scheduledJobs.get(userId);

    if (job) {
      // Cancel the scheduled job
      job.destroy();

      // Remove the job from the map
      scheduledJobs.delete(userId);

      return res.status(200).json({
        success: true,
        message: "Account deletion cancelled"
      })
    } else {
      return res.status(404).json({
        success: false,
        message: "No scheduled job found"
      })
    }
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Error cancelling account deletion"
    })
  }
}


*/