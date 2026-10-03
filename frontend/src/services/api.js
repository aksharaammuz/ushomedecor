async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "API request failed.");
  }

  return data;
}

export function getHealth() {
  return request("/api/health");
}

export function findBuyers(payload) {
  return request("/api/find-buyers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function sendEmail(payload) {
  return request("/api/send-email", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
