const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
        "https://porto-dot-omit-hasan.vercel.app", 
        "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.post('/api/message', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Please fill all fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // আপনার জিমেইল
        pass: process.env.EMAIL_PASS  // জিমেইলের App Password
      }
    });

    // 📩 ১. এই মেইলটি আসবে আপনার নিজের জিমেইলে (Notification)
    const mailOptionsToMe = {
      from: process.env.EMAIL_USER, // আপনার নিজের মেইল থেকেই সার্ভার পাঠাবে
      to: process.env.EMAIL_USER,   // আপনার ইনবক্সে আসবে
      subject: `💼 New Portfolio Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #eee; rounded: 8px;">
          <h2 style="color: #00bcd4; border-bottom: 2px solid #00bcd4; padding-bottom: 10px;">New Portfolio Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #00bcd4; font-style: italic;">"${message}"</p>
        </div>
      `
    };

    // ✉️ ২. এই মেইলটি অটোমেটিক চলে যাবে ইউজারের জিমেইলে (Auto-Reply)
    const mailOptionsToUser = {
      from: process.env.EMAIL_USER, 
      to: email, // ইউজার ফর্মে যে ইমেইল দিয়েছে
      subject: `Thank you for contacting me!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #00bcd4;">Hi ${name},</h2>
          <p>Thanks for reaching out through my portfolio website! I have successfully received your message.</p>
          <p>This is an automated confirmation to let you know that <strong>I will review your message and get back to you within 24 hours</strong>.</p>
          <p>In the meantime, feel free to check out my GitHub or LinkedIn if you haven't already.</p>
          <br>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 0.9em; color: #777;">
            Best regards,<br>
            <strong>Ibne Shams</strong><br>
            Web Developer
          </p>
        </div>
      `
    };

    // দুটি মেইলই একসাথে পাঠানো হচ্ছে
    await transporter.sendMail(mailOptionsToMe);
    await transporter.sendMail(mailOptionsToUser);

    res.status(200).json({ success: true, message: "Message sent and confirmation email delivered!" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ success: false, error: "Failed to send email process." });
  }
});
app.get('/', (req, res) => {
  res.send('Portfolio Server is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});