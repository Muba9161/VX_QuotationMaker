require("dotenv").config({ path: ".env.local" });
const nodemailer = require("nodemailer");

async function main() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        requireTLS: Number(process.env.SMTP_PORT) === 587,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 15000,
    });

    const info = await transporter.sendMail({
        from: {
            name: "VorldX",
            address: process.env.SMTP_FROM,
        },
        to: process.env.SMTP_USER,
        subject: "VorldX SMTP Test",
        text: "Congratulations! Your VorldX application can send emails through Gmail SMTP.",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2 style="color: #2563eb;">VorldX SMTP Test</h2>
        <p>Congratulations!</p>
        <p>Your VorldX application successfully sent this test email through Gmail SMTP.</p>
        <p>You can now integrate email delivery into account verification and password recovery.</p>
      </div>
    `,
    });

    console.log("Email accepted by SMTP server.");
    console.log("Message ID:", info.messageId);
    console.log("Recipient:", process.env.SMTP_USER);
}

main().catch((error) => {
    console.error("Email delivery test failed:", error.message);
    process.exitCode = 1;
});

