const User = require('../../models/user')
const Expense = require('../../models/expense')
const SavingGoal = require('../../models/savingGoal')
const MonthlyReport = require('../../models/monthlyReport')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendVerificationEmail = require('../../auth/sendVerificationEmail')
const sendResetEmail = require('../../auth/sendResetEmail')

const userResolver = {
    Query: {
        users: async () => {
            try {
                const users = await User.find()
                return users.map((user) => ({
                    id: user._id.toString(),
                    ...user.toObject()
                }))
            } catch (error) {
                console.error('Error fetching users', error)
                throw new Error('Failed to fetch users')
            }
        },

        user: async (_, { id }) => {
            try {
                const user = await User.findById(id)
                if (!user) {
                    throw new Error(`User with ${id} doesn't exist`)
                }
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    estimatedMonthlyIncome: user.estimatedMonthlyIncome,
                    address: user.address,
                    country: user.country,
                    currency: user.currency,
                    verified: user.verified,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString()
                }
            } catch (error) {
                console.error(`Error fetching user with ${id}`, error)
                throw new Error('Failed to fetch user')
            }
        }
    },

    Mutation: {
        login: async (_, { email, password }) => {
            try {
                const user = await User.findOne({ email })
                if (!user) {
                    throw new Error(`User with ${email} doesn't exist`)
                }
                const match = await bcrypt.compare(password, user.password)
                if (!match) {
                    throw new Error('Invalid email or password')
                }

                if (!user.verified) {
                    const crypto = require('crypto')
                    const sendVerificationEmail = require('../../auth/sendVerificationEmail')

                    if (!user.verificationToken || user.verificationExpires < Date.now()) {
                        user.verificationToken = crypto.randomBytes(32).toString("hex")
                        user.verificationExpires = Date.now() + 3600000 // 1hr
                        await user.save()
                    }

                    await sendVerificationEmail(user.email, user.verificationToken)
                    throw new Error('Please verify your email before logging in. A new verification link has been sent.')
                }

                const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' })
                return {
                    token,
                    user: {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        verified: user.verified
                    }
                }
            } catch (error) {
                console.log('Error loggin in', error)
                throw new Error(error.message)
            }
        },

        register: async (_, { name, email, password, estimatedMonthlyIncome, currency }) => {
            try {
                const existingUser = await User.findOne({ email })
                if (existingUser) {
                    if (!existingUser.verified) {
                        throw new Error('User already exists but not verified!')
                    }
                    throw new Error('User already exists')
                }
                const hashedPassword = await bcrypt.hash(password, 10)
                const verificationToken = crypto.randomBytes(32).toString('hex')
                const verificationExpires = Date.now() + 1000 * 60 * 60
                const newUser = new User({
                    name,
                    email,
                    password: hashedPassword,
                    estimatedMonthlyIncome,
                    currency,
                    verificationToken,
                    verificationExpires,
                    verified: false
                })

                await newUser.save()
                await sendVerificationEmail(email, verificationToken)
                return {
                    id: newUser._id.toString(),
                    name: newUser.name,
                    email: newUser.email,
                    estimatedMonthlyIncome: newUser.estimatedMonthlyIncome,
                    currency: newUser.currency,
                    verified: newUser.verified,
                    createdAt: newUser.createdAt.toISOString(),
                    updatedAt: newUser.updatedAt.toISOString()
                }
            } catch (error) {
                console.error('Error creating user', error)
                throw new Error(error.message)
            }
        },

        resendVerificationEmail: async (_, { email }) => {
            const user = await User.findOne({ email })

            if (!user) throw new Error("User not found")

            if (user.verified) throw new Error("User already verified")

            const crypto = require('crypto')
            const sendVerificationEmail = require('../../auth/sendVerificationEmail')

            // Regenerate token if expired or missing
            if (!user.verificationToken || user.verificationExpires < Date.now()) {
                user.verificationToken = crypto.randomBytes(32).toString('hex')
                user.verificationExpires = Date.now() + 1000 * 60 * 60 // 1hr
                await user.save()
            }

            await sendVerificationEmail(user.email, user.verificationToken)
            return true
        },

        resetPassword: async (_, { email }) => {
            const user = await User.findOne({ email })
            if (!user) throw new Error("User not found")

            const token = crypto.randomBytes(32).toString('hex')
            user.resetPwdToken = token
            user.resetPwdExpires = Date.now() + 60 * 60 * 1000  // 1 hour
            await user.save()

            await sendResetEmail(email, token)
            return true
        },

        confirmResetPassword: async (_, { token, newPassword }) => {
            const user = await User.findOne({
                resetPwdToken: token,
                resetPwdExpires: { $gt: Date.now() }
            })
            if (!user) throw new Error("Invalid or expired token")

            user.password = await bcrypt.hash(newPassword, 10)
            user.resetPwdToken = null
            user.resetPwdExpires = null
            await user.save()

            return true
        },

        updateProfile: async (_, { id, name, estimatedMonthlyIncome, address, country, currency }) => {
            try {
                const updatedUser = await User.findByIdAndUpdate(id, { name, estimatedMonthlyIncome, address, country, currency }, { new: true })
                if (!updatedUser) {
                    throw new Error(`Updating user with ${id} not found`)
                }
                return {
                    id: updatedUser._id.toString(),
                    name: updatedUser.name,
                    estimatedMonthlyIncome: updatedUser.estimatedMonthlyIncome,
                    address: updatedUser.address,
                    country: updatedUser.country,
                    currency: updatedUser.currency,
                    updatedAt: updatedUser.updatedAt.toISOString()
                }
            } catch (err) {
                console.error("Error updating user.", err)
                throw new Error(err.message)
            }
        },

        deleteUser: async (_, { id }) => {
            try {
                const user = await User.findByIdAndDelete(id)
                if (!user) {
                    throw new Error("User not found or already deleted");
                }
                await Expense.deleteMany({ userId: id })
                await SavingGoal.deleteOne({ userId: id })
                await MonthlyReport.deleteMany({ userId: id })

                return true
            } catch (err) {
                console.error("Error deleting user.", err)
                throw new Error(err.message)
            }
        }
    }
}

module.exports = userResolver