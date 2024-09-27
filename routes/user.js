const express = require('express')
const router = express.Router()

const {signUp, login, changePassword, sendOTP} = require('../controllers/authn')
const {contactUs} = require('../controllers/contactUs')
const {resetPassword, resetPasswordToken} = require('../controllers/resetPassword')

const {auth} = require('../middlewares/auth')

//authentication routes
router.post("/signUp", signUp)
router.post("/login", login)
router.post("/sendOTP", sendOTP)
router.post("/changePassword", auth, changePassword)


//reset password
router.post("/reset-password-token", resetPasswordToken)
router.post("/reset-password", resetPassword)

module.exports = router