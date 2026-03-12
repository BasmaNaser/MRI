const nodemailer=require('nodemailer');
require('dotenv').config();
const transporter=nodemailer.createTransport(
    {
        host: "smtp.gmail.com",
            port: 587,
            secure: false, // TLS
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD,
            },
            tls: {
                rejectUnauthorized: false // حل مشكلة الشهادة
            }
    }
)
async function sendTestEmail(to,username,loginLink,subject)
{
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #1a73e8;">Welcome, ${username}!</h2>
        <p>Thank you for registering at <strong>MRI Brain Storm</strong>.</p>
        <p>Your account has been created successfully and you can login now.</p>
        <a href="${loginLink}" style="display:inline-block; padding: 10px 20px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Login Now
        </a>
    </div>
    `;
    return await transporter.sendMail(
        {
            to ,
            user:process.env.USER,
            subject,
            html:htmlMessage
        }
    )
}

async function sendEmailRestPassword(to,username,loginLink,subject)
{
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #1a73e8;">Welcome, ${username}!</h2>
        <p>Your forget your password to reset it click the button </p>
        <a href="${loginLink}" style="display:inline-block; padding: 10px 20px; background-color: #1a73e8; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Reset Password
        </a>
    </div>
    `;
    return await transporter.sendMail(
        {
            to ,
            user:process.env.USER,
            subject,
            html:htmlMessage
        }
    )
}

module.exports={sendTestEmail,sendEmailRestPassword};