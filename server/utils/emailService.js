import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendManagerQueryEmail = async (employeeEmail, managerName, date, type, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employeeEmail,
      subject: `Query regarding your ${type} on ${date}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Manager Query</h2>
          <p>Hello,</p>
          <p>Your manager <strong>${managerName}</strong> has a query regarding your <strong>${type}</strong> on <strong>${date}</strong>:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 0;">${message}</p>
          </div>
          <p>Please respond to this query at your earliest convenience.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated message from the Allowance Management System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};