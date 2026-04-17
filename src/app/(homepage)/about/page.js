import React from "react";
import api from "@/lib/api";
import AboutContent from "./AboutContent";
import { getAboutData } from "@/lib/services/dataService";

/**
 * Server Component for the About Page
 * Handles high-performance data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getAboutData();

    if (res.success && res.data) {
      return {
        title: res.data.metaTitle || "About Us | Vidyasthanam",
        description: res.data.metaDescription || "School of Indian Music, Culture and Languages",
        keywords: res.data.metaKeywords || "Vidyasthanam, Music School",
        openGraph: {
          title: res.data.metaTitle,
          description: res.data.metaDescription,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/about`,
        }
      };
    }
  } catch (err) {
    console.error("Metadata generation error:", err);
  }
  return { title: "About Us | Vidyasthanam" };
}

export default async function AboutPage() {
  let aboutData = {
    storySections: [],
    timeline: [],
    gallery: [],
    timelineBg: ""
  };

  try {
    const res = await getAboutData();


    if (res.success && res.data) {
      aboutData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch about data on server:", err);
  }

  return (
    <>
      <div id="loader">
        <div className="three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
      <AboutContent initialData={aboutData} />
    </>
  );
}
