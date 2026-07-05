const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://ass10-medicare-client-side.vercel.app", 
    ],
    credentials: true,
  })
);

app.use(express.json()); // JSON ডাটা পার্স করার জন্য আবশ্যক

// ইমেইল পাঠানোর API রাউট
app.post('/api/message', async (req, res) => {
  const { name, email, message } = req.body;

  // বেসিক ভ্যালিডেশন
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Please fill all fields." });
  }

  try {
    // Nodemailer ট্রান্সপোর্টার সেটআপ (Gmail ব্যবহার করে)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // আপনার জিমেইল এড্রেস (.env ফাইল থেকে আসবে)
        pass: process.env.EMAIL_PASS  // জিমেইলের App Password (.env ফাইল থেকে আসবে)
      }
    });

    // মেইলের কন্টেন্ট এবং অপশনস
    const mailOptions = {
      from: email, 
      to: process.env.EMAIL_USER, // আপনার নিজের যে মেইলে ইনবক্স হবে
      subject: `💼 New Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #00bcd4;">New Portfolio Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 15px; border-left: 4px solid #00bcd4;">${message}</p>
        </div>
      `
    };

    // মেইল পাঠানো হচ্ছে
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    res.status(500).json({ success: false, error: "Internal server error. Failed to send email." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});