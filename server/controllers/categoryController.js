const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
    "Food",
    "Shopping",
    "Travel",
    "Bill",
    "Others",
];

// Get categories
const getCategories = async (req, res) => {
    try {
        const user = req.params.user;

        // ===============================
        // DEFAULT CATEGORIES
        // ===============================

        for (const name of DEFAULT_CATEGORIES) {
            await Category.findOneAndUpdate(
                {
                    user,
                    name: {
                        $regex: `^${name}$`,
                        $options: "i",
                    },
                },
                {
                    $setOnInsert: {
                        user,
                        name,
                    },
                },
                {
                    upsert: true,
                }
            );
        }


        // ===============================
        // GET ALL CATEGORIES
        // ===============================

        const categories = await Category.find({
            user,
        }).sort({
            name: 1,
        });


        res.status(200).json(categories);

    } catch (error) {

        console.error(
            "Get Categories Error:",
            error
        );

        res.status(500).json({
            message: error.message,
        });
    }
};


// Add category
const addCategory = async (req, res) => {
    try {
        const { user, name } = req.body;

        if (!user || !name?.trim()) {
            return res.status(400).json({
                message: "User and category name are required.",
            });
        }

        const trimmedName = name.trim();

        const existingCategory = await Category.findOne({
            user,
            name: {
                $regex: `^${trimmedName}$`,
                $options: "i",
            },
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists.",
            });
        }

        const category = await Category.create({
            user,
            name: trimmedName,
        });

        res.status(201).json(category);

    } catch (error) {
        console.error("Add Category Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};


// Delete category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(
            req.params.id
        );

        if (!category) {
            return res.status(404).json({
                message: "Category not found.",
            });
        }

        await category.deleteOne();

        res.status(200).json({
            message: "Category deleted successfully.",
        });

    } catch (error) {
        console.error("Delete Category Error:", error);

        res.status(500).json({
            message: error.message,
        });
    }
};


module.exports = {
    getCategories,
    addCategory,
    deleteCategory,
};