const express = require('express')
const router = express.Router()


const {updateProfile, deleteAccount, getUserDetails, getEnrolledCourses} = require('../controllers/profile')
const {auth} = require("../middlewares/auth")

// routes
router.delete("/deleteProfile", auth, deleteAccount) 
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getUserDetails)
router.get("/getEnrolledCourses", auth, getEnrolledCourses)

module.exports = router