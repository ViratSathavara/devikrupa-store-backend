const mongoose = require('mongoose');
const Counter = require('./Counter');

const productSchema = new mongoose.Schema({
    productId: {
        type: Number,
        unique: true
    },
    name: { type: String, required: true },
    companyName: { type: String },
    description: { type: String, required: true },
    price: { type: Number },
    categoryId: { type: Number, ref: 'Category' },
    stock: { type: Number },
    rating: { type: Number },
    productImages: [{ type: String, required: true }],
}, { timestamps: true });

productSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate({ id: 'productId' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
            this.productId = counter.seq;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Product', productSchema);