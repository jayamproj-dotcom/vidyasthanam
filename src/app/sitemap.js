export default async function sitemap() {
  const baseUrl = process.env.DOMAIN_URL || "https://vidyasthanam.com";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const rootUrl = `${baseUrl}${basePath}`;

  // 1. Define the static routes of the application
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/courses",
    "/events",
    "/gallery",
    "/publications",
    "/student-registration",
    "/vidyasthanam-foundation",
  ].map((route) => ({
    url: `${rootUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Fetch active dynamic routes from the navbar API
  let dynamicRoutes = [];
  try {
    const res = await fetch(`${rootUrl}/api/navbar`, { next: { revalidate: 60 } });
    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        dynamicRoutes = result.data
          .filter((item) => item.isActive && item.path && item.path.startsWith("/"))
          .map((item) => ({
            url: `${rootUrl}${item.path}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
          }));
      }
    }
  } catch (err) {
    console.error("Failed to fetch dynamic sitemap paths:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
