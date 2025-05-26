const Category = require('../models/Category');

exports.createCategory = async(req, res) => {
    try {
        const { categoryName } = req.body;

        const exists = await Category.findOne({ categoryName });
        if (exists) return res.status(400).json({ message: 'Category already exists' });


        const newCategory = new Category({
            ...req.body,
            categoryId: 100,
            categoryImage: req.file ? `/uploads/${req.file.filename}` : null,
        });

        await newCategory.save();
        res.status(201).json({
            status: 200,
            message: 'Category created successfully',
            data: {
                newCategory,
            },
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// ✏️ Update Category
exports.updateCategory = async(req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName, description, bgColor } = req.body;

        const updateData = {
            categoryName,
            description,
            bgColor,
        };

        if (req.file) {
            updateData.categoryImage = `/uploads/${req.file.filename}`;
        }

        const updatedCategory = await Category.findOneAndUpdate({ categoryId },
            updateData, { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'Category not found or not updated',
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Category updated successfully',
            category: updatedCategory,
        });

    } catch (error) {
        console.error('Update Category Error:', error.message);
        res.status(500).json({ message: 'Server Error', error });
    }
};


// ❌ Delete Category
exports.deleteCategory = async(req, res) => {
    try {
        const { categoryId } = req.params;
        const deletedCategory = await Category.findOneAndDelete({ categoryId });

        if (!deletedCategory) {
            return res.status(404).json({
                status: false,
                message: 'Category not found',
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Category deleted successfully',
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// 📥 Get All Categories
exports.getCategories = async(req, res) => {
    try {
        const categories = await Category.find()
            .select('_id categoryId description categoryName bgColor categoryImage')
            .sort({ categoryId: 1 })
            .lean();

        res.json({
            success: true,
            count: categories.length,
            data: categories,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};