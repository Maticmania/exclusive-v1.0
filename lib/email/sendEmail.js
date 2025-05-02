// lib/email/sendEmail.js

import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your SMTP provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure handlebars
const handlebarOptions = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: path.resolve("./lib/email/templates"),  // Ensure this points to the correct directory
    defaultLayout: false,
  },
  viewPath: path.resolve("./lib/email/templates"), // This points to the template directory
  extName: ".hbs",
};

transporter.use("compile", hbs(handlebarOptions));

// Main sendEmail function
export async function sendEmail({ to, subject, template, context }) {
  const mailOptions = {
    from: `"Exclusive Store" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    template, // the filename of the template (without extension)
    context, // variables for handlebars
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}
