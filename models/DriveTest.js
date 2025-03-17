const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const DriveTestSchema = new Schema({
    firstName: { type: String, default: 'default' },
    lastName: { type: String, default: 'default' },
    licenceNumber: { type: String, default: 'default' }, // Plain text, no encryption
    age: { type: Number, default: 0 },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Driver', 'Examiner', 'Admin'], default: 'Driver' },
    carDetails: {
        make: { type: String, default: 'default' },
        model: { type: String, default: 'default' },
        year: { type: Number, default: 0 },
        plateNumber: { type: String, default: 'default' }
    }
});

// Hash password before saving the user
DriveTestSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare password method for login validation
DriveTestSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const DriveTest = mongoose.model('DriveTest', DriveTestSchema);
module.exports = DriveTest;