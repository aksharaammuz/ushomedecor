const HUNTER_URL = "https://api.hunter.io/v2/domain-search";

function extractDomain(website) {
  if (!website) return "";

  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export async function searchCompanyEmails({ company, website }) {
  const apiKey = process.env.HUNTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "HUNTER_API_KEY is missing. Add your Hunter API key to backend/.env."
    );
  }

  const domain = extractDomain(website);

  const url = new URL(HUNTER_URL);

  if (domain) {
    url.searchParams.set("domain", domain);
  } else if (company) {
    // Hunter supports company name when a domain is not known.
    url.searchParams.set("company", company);
  } else {
    throw new Error("A company name or domain is required.");
  }

  url.searchParams.set("limit", "3");
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.errors?.[0]?.details ||
      data?.message ||
      `Hunter API returned HTTP ${response.status}.`
    );
  }

  return {
    organization: data.data?.organization || company || "",
    domain: data.data?.domain || domain || "",
    emails: data.data?.emails || [],
    contactSource: "Hunter API"
  };
}
