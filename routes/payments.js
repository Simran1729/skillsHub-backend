const express = require("express")
const router = express.Router()


//controllers
const {capturePayment, verifySignature } = require('../controllers/payments')

//middlewares
const {auth, isStudent, isInstructor, isAdmin} = require('../middlewares/auth')

router.post("/capturePayment", auth, isStudent, capturePayment)
router.post("/verifySignature", verifySignature)

module.exports = router