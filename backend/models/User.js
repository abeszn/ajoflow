const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone:    { type: String, default: '' },
    password: { type: String },           // absent for Google-only accounts
    googleId: { type: String },           // present for Google-linked accounts
    avatar:   { type: String, default: '' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },

    // Forgot password
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false; // Google-only account — no local password
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
