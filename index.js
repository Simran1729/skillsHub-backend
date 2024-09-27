const express = require('express');
const app = express();

const expressFileUpload = require('express-fileupload')
const { connectCloudinary } = require('./config/cloudinary')
const { dbConnection } = require('./config/database')
require('dotenv').config();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const userRoutes = require("./routes/user")
const paymentRoutes = require('./routes/payments')
const profileRoutes = require('./routes/profile')
const courseRoutes = require('./routes/courses')


connectCloudinary();

dbConnection();

const PORT = process.env.PORT || 4000

app.use(expressFileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin : "http://localhost:3000",
        credentials : true,
    })
)


//routes
app.use("api/v1/auth", userRoutes)
app.use("api/v1/profile", profileRoutes)
app.use("api/v1/course", courseRoutes)
app.use("api/v1/payment", paymentRoutes)


app.get('/', (req, res) => {
    return res.status(200).json({
        success : true,
        message : "Your server is running"
    })
})


app.listen(PORT, () => {
    console.log(`App is running at port number - ${PORT}`)
})