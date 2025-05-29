const nodemailer = require('nodemailer')

module.exports = async function sendResetEmail(email, token) {
  const link = `http://localhost:3000/reset-password?token=${token}`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  await transporter.sendMail({
    from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your Finance Tracker password',
    text: `Reset here: ${link}`,
    html: `
      <p>You requested a password reset.</p>
      <a href="${link}" style="…button styles…">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `
  })
}
