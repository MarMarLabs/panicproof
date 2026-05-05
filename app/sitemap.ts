import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://panicproof.demo/",
      lastModified: new Date(),
    },
    {
      url: "https://panicproof.demo/samples",
      lastModified: new Date(),
    },
  ];
}
