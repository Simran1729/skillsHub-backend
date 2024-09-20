const mailSender = require('../utils/mailSender')

exports.contactUs = async (req, res) => {
    try{
        //get the data from contact form
        const {email, data} = req.body;

        //send the mail to your account with the data recieved
        const toSelfResponse = mailSender('simranb1306@gmail.com', data, `contact enquiry from ${email}`);

        if(!toSelfResponse){
            return res.status(501).json({
                success : false,
                message : "error sending mail to self"
            })
        }

        //send the mail to user /student that your mail has been receivee
        const toStudentResponse = mailSender(email, 'your data has been sent', 'you contacted SkillsHub')

        if(!toStudentResponse){
            return res.status(500).json({
                success : false,
                message : "error sending mail to user"
            })
        }

        return res.status(200).json({
            success : true,
            message : "response recorded successfully and mails sent"
        })

    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}