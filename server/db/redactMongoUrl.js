export function redactMongoUrl(mongoUrl) {
  try {
    const parsed = new URL(mongoUrl);
    const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
    return `${parsed.protocol}//${parsed.host}${path}`;
  } catch (error) {
    return "[invalid MongoDB URL]";
  }
}
