const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName : {
        type : String,
        trim : true,
        required : true
    },
    courseDescription : {
        type : String,
        trim : true,
    },
    instructor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    whatYouWillLearn : {
        type : String,
    },
    courseContent : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Section"
        }
    ],
    ratingAndReviews : [
        {
            type  : mongoose.Schema.Types.ObjectId,
            ref : "RatingAndReview"
        }
    ],
    price : {
        type : Number,
        required : true,
    },
    thumbnail : {
        type : String,
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
    },
    tags : {
        type : [String],
        required: true
    },
    studentsEnrolled : [
        {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref : "User",
        }
    ],
    status : {
        type : String,
        enum : ["Draft", "Published"]
    },
})


module.exports = mongoose.model("Course", courseSchema);