import express from "express";
import { searchBusinesses } from "../services/osmService.js";
import { searchCompanyEmails } from "../services/hunterService.js";

const router = express.Router();

router.post("/find-buyers", async (req, res) => {
  try {
    const { product, buyerType, location } = req.body;

    if (!product?.trim() || !buyerType?.trim() || !location?.trim()) {
      return res.status(400).json({
        error: "Product, buyer type and US location are required."
      });
    }

    const businesses = await searchBusinesses({
      product: product.trim(),
      buyerType: buyerType.trim(),
      location: location.trim()
    });

    // Enrich the businesses with professional emails.
    // We intentionally keep the number small for an internship MVP
    // so a single search does not burn a large number of API credits.
    const hunterLimit = Number(process.env.HUNTER_LIMIT || 3);
    const enriched = [];

    for (const business of businesses) {
      let emailData = {
        emails: [],
        contactSource: "Not searched"
      };

      if (enriched.length < hunterLimit) {
        try {
          emailData = await searchCompanyEmails({
            company: business.name,
            website: business.website
          });
        } catch (error) {
          console.warn(`Hunter enrichment skipped for ${business.name}: ${error.message}`);
          emailData = {
            emails: [],
            contactSource: "Hunter error"
          };
        }
      }

      const firstEmail = emailData.emails?.[0];

      enriched.push({
        ...business,
        email: firstEmail?.value || "",
        emailConfidence: firstEmail?.confidence ?? null,
        emailType: firstEmail?.type || "",
        emailSource: emailData.contactSource
      });
    }

    res.json({
      count: enriched.length,
      search: { product, buyerType, location },
      leads: enriched
    });
  } catch (error) {
    console.error(error);
    res.status(502).json({
      error: error.message || "Unable to find buyers."
    });
  }
});

router.post("/find-email", async (req, res) => {
  try {
    const { company, website } = req.body;

    if (!company?.trim() && !website?.trim()) {
      return res.status(400).json({
        error: "Company name or website is required."
      });
    }

    const data = await searchCompanyEmails({
      company: company?.trim(),
      website: website?.trim()
    });

    res.json(data);
  } catch (error) {
    res.status(502).json({
      error: error.message || "Unable to find business email."
    });
  }
});

export default router;
