const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buyerFilters(buyerType, product) {
  const type = buyerType.toLowerCase();
  const text = `${type} ${product}`.toLowerCase();
  const filters = new Set();

  if (type.includes("interior") || type.includes("architect")) {
    filters.add('["office"="architect"]');
    filters.add('["shop"="interior_decoration"]');
    filters.add('["shop"="furniture"]');
  }
  if (type.includes("furniture")) filters.add('["shop"="furniture"]');
  if (type.includes("gift")) filters.add('["shop"="gift"]');
  if (type.includes("boutique")) filters.add('["shop"="boutique"]');
  if (type.includes("decor") || type.includes("home")) {
    filters.add('["shop"="furniture"]');
    filters.add('["shop"="interior_decoration"]');
    filters.add('["shop"="gift"]');
    filters.add('["shop"="art"]');
  }
  if (text.includes("art")) filters.add('["shop"="art"]');

  if (!filters.size) {
    filters.add('["shop"="furniture"]');
    filters.add('["shop"="gift"]');
    filters.add('["shop"="boutique"]');
    filters.add('["shop"="art"]');
  }

  return [...filters];
}

async function geocode(location) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", location);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "us");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "BuyerLead-internship-demo/1.0"
    }
  });
  const data = await response.json();

  if (!response.ok || !data[0]) {
    throw new Error(`Could not find a US location for "${location}".`);
  }

  return { lat: Number(data[0].lat), lon: Number(data[0].lon), displayName: data[0].display_name };
}

function buildQuery(lat, lon, radius, filters) {
  const parts = [];
  for (const filter of filters) {
    parts.push(`nwr[${filter.slice(1, -1)}](around:${radius},${lat},${lon});`);
  }
  return `[out:json][timeout:25];(${parts.join("\n")});out center tags;`;
}

function tagsToBusiness(element) {
  const tags = element.tags || {};
  const center = element.center || element;
  const lat = element.lat ?? center.lat;
  const lon = element.lon ?? center.lon;
  const name = tags.name || tags["name:en"];
  if (!name) return null;

  const addressParts = [
    ["addr:housenumber", "addr:street"].map((key) => tags[key]).filter(Boolean).join(" "),
    tags["addr:city"], tags["addr:state"], tags["addr:postcode"]
  ].filter(Boolean);

  const category = tags.shop || tags.office || tags.amenity || "Business";
  const website = tags.website || tags["contact:website"] || "";
  const phone = tags.phone || tags["contact:phone"] || "";
  const id = `${element.type}-${element.id}`;

  return {
    id,
    name,
    category: String(category).replaceAll("_", " "),
    address: addressParts.join(", "),
    location: [tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(", "),
    phone,
    website,
    osmUrl: lat && lon ? `https://www.openstreetmap.org/${element.type}/${element.id}` : "",
    rating: null,
    reviewCount: 0,
    image: "",
    coordinates: lat && lon ? { latitude: Number(lat), longitude: Number(lon) } : null,
    source: "OpenStreetMap + Overpass API"
  };
}

export async function searchBusinesses({ product, buyerType, location }) {
  const limit = Math.min(Number(process.env.OSM_LIMIT || 12), 40);
  const radius = Math.min(Number(process.env.OSM_RADIUS_METERS || 15000), 30000);
  const point = await geocode(location);
  const filters = buyerFilters(buyerType, product);
  const query = buildQuery(point.lat, point.lon, radius, filters);

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "BuyerLead-internship-demo/1.0"
    },
    body: new URLSearchParams({ data: query })
  });

  if (!response.ok) {
    throw new Error(`Overpass API returned HTTP ${response.status}. Try again in a moment.`);
  }

  const data = await response.json();
  const unique = new Map();

  for (const element of data.elements || []) {
    const business = tagsToBusiness(element);
    if (business && !unique.has(business.name.toLowerCase())) unique.set(business.name.toLowerCase(), business);
  }

  return [...unique.values()].slice(0, limit);
}
