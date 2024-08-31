const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

exports.dbConnection = async () => {
    try{
        await mongoose.connect(dbUrl);
        console.log('db Connected');
    } catch(err) {
        console.log('error connecting to db');
        console.log(err.message)
        process.exit(1);
    }
}