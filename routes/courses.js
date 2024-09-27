const express = require('express')
const router = express.Router()

const {createCourse, getCourseDetails, getAllCourses} = require('../controllers/course')
const {createSection , updateSection, deleteSection} = require('../controllers/section')
const {createSubSection, updateSubSection, deleteSubSection} = require('../controllers/subSection')
const {createCategory, categoryPageDetails, showAllCategories} = require('../controllers/categories')
const {createRating, getAllRatings, getAllRatingsOfCourse, getAverageRating} = require('../controllers/reviewAndRatings')

// importing middlewares
const {auth, isAdmin, isInstructor, isStudent} = require('../middlewares/auth')


// course routes
// ---> protected routes for instructor
router.post("/createCourse", auth, isInstructor, createCourse)
router.post("/addSection", auth, isInstructor , createSection)
router.post("/updateSection", auth, isInstructor, updateSection)
router.post("/deleteSection", auth, isInstructor, deleteSection)
router.post("/addSubSection", auth, isInstructor, createSubSection)
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
// --> unprotected routes
router.get('/getAllCourses', getAllCourses)
router.get('/getCourseDetails', getCourseDetails)


//category routes
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.get("/getCategoryPageDetails", categoryPageDetails)


//rating and review routes
router.post("/createRating", auth, isStudent, createRating)
router.post("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRatings)
router.post("/getRatingsofCourse", getAllRatingsOfCourse)


module.exports = router
