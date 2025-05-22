const Product = require('../models/Product');

exports.getProducts = async(req, res) => {
    const products = await Product.find().populate('category');
    res.json(products);
};

exports.getProductById = async(req, res) => {
    const product = await Product.findById(req.params.productId).populate('category');
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
};

exports.createProduct = async(req, res) => {
    try {
        const { name, companyName, description, price, category, stock, rating } = req.body;

        const newProduct = new Product({
            name,
            companyName,
            description,
            price,
            category: category.categoryId,
            stock,
            rating,
            productId: 1,
            productImages: req.file ? `/uploads/${req.file.filename}` : null,
        });

        if (req.files.length > 0) {
            newProduct.productImages = req.files.map(file => {
                console.log(file.filename);
                return `/uploads/${file.filename}`;
            });

        }

        await newProduct.save();
        res.status(201).json({
            status: 201,
            message: 'New Product created successfully',
            data: {
                newProduct,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProduct = async(req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, category, stock, rating, companyName } = req.body;
        const newProduct = { name, description, price, category, stock, rating, companyName }


        if (req.files && req.files.length > 0) {
            newProduct.productImages = req.files.map(file => `/uploads/${file.filename}`);
        }

        const updatedProduct = await Product.findOneAndUpdate({ productId },
            newProduct, { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'product not found or not updated',
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Product updated successfully',
            category: updatedProduct,
        });

    } catch (error) {

        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

exports.deleteProduct = async(req, res) => {
    try {
        const { productId } = req.params;
        const deletedProduct = await Product.findOneAndDelete({ productId });

        if (!deletedProduct) {
            return res.status(404).json({
                status: false,
                message: 'Product not found',
            });
        }
        res.status(200).json({
            status: true,
            message: 'Product deleted successfully',
        });


    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};