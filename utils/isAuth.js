const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const isEmailValidate = ({ key }) => {
    const isEmail =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(
        key
      );
    return isEmail;
  };


  const verifyUserDetails = async ({ email, username, password }) => {
    return new Promise((res, rej) => {
      if (!email || !username || !password) return rej(new Error("Please fill out all the fields"));
  
      if (typeof email !== "string") return rej(new Error("Email must be a string"));
      if (typeof password !== "string") return rej(new Error("Password must be a string"));
      if (typeof username !== "string") return rej(new Error("Username must be a string"));
  
      if (password.length < 3 || password.length > 50)
        return rej(new Error("Password must be between 3 and 50 characters"));
  
      if (!isEmailValidate({ key: email })) return rej(new Error("Not a valid email"));
  
      return res();
    });
  };
  
const genrateToken=(email)=>{

  const token = jwt.sign(email,process.env.SECRET_KEY);
  return token;
}
//sending verification mail to user 
const sendVerificationMail = async (email, token) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify/${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff;">
          <tr>
            <td align="center" bgcolor="#defcf9" style="padding: 40px 0;">
              <img src="https://www.jotform.com/blog/wp-content/uploads/2020/01/email-marketing-intro-02-700x544.png" alt="Logo" width="300" height="230" style="display: block;">
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; font-family: Arial, sans-serif; color: #333;">
              <h2 style="text-align: center; color: #00adb5;">Hey,</h2>
              <h3 style="text-align: center; color: #00adb5;">Activate your Email</h3>
              <p style="text-align: center; font-size: 16px;">Please click the button below to verify your email address.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="${verificationLink}" style="background-color: #ef7e5c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Activate Account</a>
              </div>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ef7e5c" style="padding: 20px; text-align: center; color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">
              &copy; 2025 Todo App | <a href="#" style="color: #ffffff;">Subscribe</a>
            </td>
          </tr>
        </table>
      </body>
      </html>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}: ${info.response}`);
    return { success: true, message: `Email sent to ${email}` };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Email failed to send.", error: error.message };
  }
};

module.exports = {verifyUserDetails,isEmailValidate,genrateToken,sendVerificationMail};