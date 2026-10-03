import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import buyerRoutes from "./routes/buyers.js";
import emailRoutes from "./routes/email.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "BuyerLead API",
    providers: {
      businessDiscovery: true,
      hunter: Boolean(process.env.HUNTER_API_KEY),
      resend: Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
    }
  });
});

app.use("/api", buyerRoutes);
app.use("/api", emailRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`BuyerLead API running at http://localhost:${PORT}`);
});
