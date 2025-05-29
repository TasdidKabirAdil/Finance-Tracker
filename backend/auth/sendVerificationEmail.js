const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

dotenv.config()

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:4000/verify-email?token=${token}`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your Finance Tracker account',
    html: `
      <h2>Welcome to Finance Tracker 🎉</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${verificationLink}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
      ">Verify Email</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 1 hour.</p>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Verification email sent to ${email}`)
  } catch (error) {
    console.error('❌ Failed to send verification email:', error)
    throw new Error('Could not send verification email')
  }
}

module.exports = sendVerificationEmail
