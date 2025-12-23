import nodemailer from "nodemailer"

// Configure this with your email provider details
const transporter = nodemailer.createTransport({
  service: "gmail", 
  // If using something else like SendGrid, comment out 'service' and use host/port:
  // host: "smtp.example.com",
  // port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`

  await transporter.sendMail({
    from: '"AfyaDiet Security" <no-reply@afyadietsolutions.co.ke>',
    to: email,
    subject: "Verify your AfyaDiet Account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #16a34a;">Welcome to AfyaDiet!</h2>
        <p>Please confirm your email address to activate your account.</p>
        <br/>
        <a href="${confirmLink}" style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        <br/><br/>
        <p style="font-size: 12px; color: #666;">Or copy this link: ${confirmLink}</p>
      </div>
    `,
  })
}
