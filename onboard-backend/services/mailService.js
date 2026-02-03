const nodemailer = require("nodemailer");
const path = require("path");

// Gmail Configuration for YOUR mail ID
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "murugankathirvel2005@gmail.com",
    pass: "lcom dpsu nczy gyra"
  }
});

module.exports = async (toEmail, employeeName, pdfPath) => {

  console.log("========== MAIL SERVICE ==========");
  console.log("Sending to:", toEmail);
  console.log("Attachment:", pdfPath);

  try {

    await transporter.sendMail({
      from: "Infinite Hunters HR <murugankathirvel2005@gmail.com>",
      to: toEmail,
      subject: "Your Offer Letter – Infinite Hunters",
      text: `Hello ${employeeName},

We are pleased to inform you that your offer letter from Infinite Hunters Multi Service Pvt. Ltd. has been generated and attached with this email.

Please review the attached offer letter.

Regards,
HR Team
Infinite Hunters`,

      attachments: [
        {
          filename: path.basename(pdfPath),
          path: pdfPath
        }
      ]
    });

    console.log("Email sent successfully to:", toEmail);

  } catch (error) {
    console.log("EMAIL SENDING FAILED");
    console.error(error);
    throw error;
  }
};
