const CATEGORIES = require('../models/Category')

exports.createCategory = async (req, res) => {
    try{
        const {name, description} = req.body

        if(!name || !description){
            return res.status(400).json({
                success : false,
                message : "please give complete details for category creation"
            })
        }

        //now add the category
        await CATEGORIES.create({name, description})
        return res.status(200).json({
            success : true,
            message : "Category created successfully"
        })
        
        
    } catch(err){
        return res.status(500).json({
            success : false,
            message : "error occured while creating category",
            error : err.message
        })
    }
}


exports.showAllCategories = async(req, res) => {
    try{
        const allCategories = await CATEGORIES.find({}, {name : true, description : true})
        res.status(200).json({
            success : true,
            message : "Got all the categories",
            allCategories
        })
    } catch(err){
        return res.status(500).json({
            success : false,
            message : "error showing all categories"
        })
    }
}


exports.categoryPageDetails = async(req, res) => {
    try{
        
        const {categoryID} = req.body;

        //get courses of this category
        const selectedCategory = await CATEGORIES.findById(categoryID)
                                                            .populate("courses").exec();

        if(!selectedCategory){
            return res.status(404).json({
                success : false,
                message : 'Data not found'
            })
        }

        //now get courses of different categories
        const differentCategories = await CATEGORIES.find({
            _id : {$ne : categoryID}
        }).populate("courses").exec();

        // $ne operator for not equal to


        //get most popular courses --- TOOOOOOOOODOOOOOOOOO

        return res.status(200).json({
            success : true,
            message: "Courses fetched",
            data : {
                selectedCategory,
                differentCategories
            }
        })


    } catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}