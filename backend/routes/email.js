import express from "express";
import { sendEmail } from "../services/resendService.js";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: "Select at least one buyer with an email address."
      });
    }

    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        error: "Subject and message are required."
      });
    }

    const result = await sendEmail({
      recipients,
      subject: subject.trim(),
      message: message.trim()
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(502).json({
      error: error.message || "Email API request failed."
    });
  }
});

export default router;
