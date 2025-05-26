const mongoose = require('mongoose');
const Counter = require('./Counter');

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: Number,
        unique: true
    },
    categoryName: {
        type: String,
        required: true,
        unique: true
    },
    bgColor: {
        type: String,
        default: '#ffffff'
    },
    description: {
        type: String
    },
    categoryImage: { type: String },
}, {
    timestamps: true
});

categorySchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate({ id: 'categoryId' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
            this.categoryId = counter.seq;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Category', categorySchema);