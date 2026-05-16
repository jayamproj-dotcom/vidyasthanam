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
      const { metaTitle, metaDescription, metaKeywords } = res.data;
      return {
        title: metaTitle || "About Us | Vidyasthanam",
        description: metaDescription || "School of Indian Music, Culture and Languages",
        keywords: metaKeywords || "Vidyasthanam, Music School",
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          url: "/about",
          images: ["/logocanva1.png"],
        },
        twitter: {
          card: "summary_large_image",
          title: metaTitle,
          description: metaDescription,
          images: ["/logocanva1.png"],
        },
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

    console.log(res, "res");


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
