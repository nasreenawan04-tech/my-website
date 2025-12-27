import { tools } from "../client/src/data/tools";
import { blogPosts } from "../client/src/data/blogData";

/**
 * Dynamically generates a sitemap.xml for the DapsiWow application.
 * Pulls tool slugs from tool configuration and blog posts from blog data.
 */
export function generateSitemap(domain: string): string {
  const baseUrl = `https://${domain}`;
  const now = new Date().toISOString();

  // Define static pages
  const staticPages = [
    { url: "", priority: "1.0", changefreq: "daily" },
    { url: "/tools", priority: "0.9", changefreq: "daily" },
    { url: "/blog", priority: "0.8", changefreq: "weekly" },
    { url: "/finance-tools", priority: "0.8", changefreq: "weekly" },
    { url: "/text-tools", priority: "0.8", changefreq: "weekly" },
    { url: "/health-tools", priority: "0.8", changefreq: "weekly" },
  ];

  const xmlEntries: string[] = [];

  // Add static pages
  staticPages.forEach((page) => {
    xmlEntries.push(`
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  });

  // Add tools
  tools.forEach((tool) => {
    // Determine lastmod - use current time for now, or could be linked to a static update cycle
    // XML Extensions: Add image support if the tool has an icon/image
    const imageXml = tool.icon.startsWith("http") || tool.icon.startsWith("/") 
      ? `\n    <image:image>\n      <image:loc>${tool.icon.startsWith("/") ? baseUrl + tool.icon : tool.icon}</image:loc>\n      <image:title>${tool.name}</image:title>\n    </image:image>`
      : "";

    xmlEntries.push(`
  <url>
    <loc>${baseUrl}${tool.href}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`);
  });

  // Add blog posts
  blogPosts.forEach((post) => {
    xmlEntries.push(`
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.dateISO || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${baseUrl}${post.image}</image:loc>
      <image:title>${post.title}</image:title>
    </image:image>
  </url>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${xmlEntries.join("")}
</urlset>`;
}
