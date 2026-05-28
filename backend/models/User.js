const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = mongoose.Schema({
    supabaseId: { type: String, unique: true, sparse: true }, // Supabase auth UUID
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true },
    phone:      { type: String, default: '' },
    password:   { type: String },            // kept for bcrypt on legacy accounts
    avatar:     { type: String, default: '' },
    role:       { type: String, enum: ['admin', 'member'], default: 'member' },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
