const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DriveTestSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Ensure password is required
    userType: { type: String, required: true },
    firstName: { type: String, default: 'default' },
    lastName: { type: String, default: 'default' },
    licenceNumber: { type: String, default: 'default' },
    age: { type: Number, default: 0 },
    carDetails: {
        make: { type: String, default: 'default' },
        model: { type: String, default: 'default' },
        year: { type: Number, default: 0 },
        plateNumber: { type: String, default: 'default' }
    }
});

// Hash password before saving
DriveTestSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Corrected comparePassword method
DriveTestSchema.methods.comparePassword = async function (candidatePassword) {
    if (!candidatePassword || !this.password) {
        throw new Error('Password comparison requires both values.');
    }

    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('DriveTest', DriveTestSchema);
