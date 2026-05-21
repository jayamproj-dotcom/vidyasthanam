export default function robots() {
  const baseUrl = process.env.DOMAIN_URL || "https://vidyasthanam.com";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}${basePath}/sitemap.xml`,
  };
}
