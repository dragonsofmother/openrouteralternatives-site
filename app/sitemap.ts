import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";
import { DATASET_DATE } from "@/data/gateways";

const lastModified = new Date(`${DATASET_DATE}T00:00:00Z`);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", SITE.url).toString(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/why", SITE.url).toString(),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
