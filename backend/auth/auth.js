const express = require('express')
const router = express.Router()
const User = require('../models/user')

router.get('/verify-email', async (req, res) => {
    const token = req.query.token
    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationExpires: { $gt: Date.now() }
        })

        if (!user) {
            return res.redirect('http://localhost:3000/login?verify=failed')
        }

        user.verified = true
        user.verificationToken = null
        user.verificationExpires = null
        await user.save()

        return res.redirect('http://localhost:3000/login?verify=success')
    } catch (err) {
        console.error('Email verification error:', err)
        return res.redirect('http://localhost:3000/login?verify=error')
    }
})

module.exports = router
