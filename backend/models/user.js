const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    estimatedMonthlyIncome: { type: Number, required: true, default: 0 },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    verificationExpires: { type: Date, default: null },
    resetPwdToken: { type: String, default: null },
    resetPwdExpires: { type: Date, default: null },
    address: { type: String, default: null },
    country: { type: String, default: null },
    currency: { type: String, default: 'CAD' },
}, {
    timestamps: {
        currentTime: () => {
            const now = new Date();
            const offset = now.getTimezoneOffset();
            return new Date(now.getTime() - offset * 60000);
        }
    }
})

const User = mongoose.model("User", userSchema)

module.exports = User