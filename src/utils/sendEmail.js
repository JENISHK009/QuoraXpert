import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, emailBody) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORDS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
