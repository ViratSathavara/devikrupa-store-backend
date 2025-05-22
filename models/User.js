const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        unique: true,
        required: true
    },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, select: false },
    secretId: { type: String },
    image: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate({ id: 'userId' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
            this.userId = counter.seq;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchId = function(id) {
    if (!id) return false;
    return id.trim() === this.secretId.trim();
};



module.exports = mongoose.model('User', userSchema);