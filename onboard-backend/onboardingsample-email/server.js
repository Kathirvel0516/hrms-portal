const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// API to send offer letter
app.post('/send-offer-letter', async (req, res) => {
    const { employeeName, employeeEmail } = req.body;

    const pdfPath = path.join(__dirname, 'IHMS5676-SANTHOSH.pdf');

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'msnilaani18@gmail.com',
                pass: 'hubh owzk viht vyzp'
            }
        });

        await transporter.sendMail({
            from: '"Infinite Hunters HR" <YOUR_COMPANY_EMAIL@gmail.com>',
            to: employeeEmail,
            subject: 'Offer Letter – Infinite Hunters',
            text: `Hello ${employeeName},

We are pleased to inform you that your offer letter from Infinite Hunters Multi Service Pvt. Ltd. has been sent to your registered email ID.

Please check your inbox and review the offer letter.
For any clarification, feel free to reach out to us.

We look forward to having you onboard.

– HR Team,
Infinite Hunters`,
            attachments: [
                {
                    filename: `Offer_Letter_${employeeName}.pdf`,
                    path: pdfPath
                }
            ]
        });

        res.status(200).json({ message: 'Email sent successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Email failed' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});