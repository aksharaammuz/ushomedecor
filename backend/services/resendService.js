const RESEND_URL = "https://api.resend.com/emails";

export async function sendEmail({ recipients, subject, message }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error(
      "RESEND_API_KEY or FROM_EMAIL is missing. Configure backend/.env first."
    );
  }

  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      text: message
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Resend API returned HTTP ${response.status}.`
    );
  }

  return {
    success: true,
    provider: "Resend API",
    messageId: data.id,
    recipientCount: recipients.length,
    message: `Email sent to ${recipients.length} selected buyer${recipients.length === 1 ? "" : "s"}.`
  };
}
