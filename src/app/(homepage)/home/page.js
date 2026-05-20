import React from "react";
import api from "@/lib/api";
import HomeContent from "./HomeContent";
import { getHomeData } from "@/lib/services/dataService";

/**
 * Server Component for the Homepage
 * This handles high-performance data fetching with ISR support.
 */

export async function generateMetadata() {
  try {
    const res = await getHomeData();

    if (res.success && res.data) {
      const { title, description, keywords } = res.data;
      return {
        title: title || "Vidyasthanam - School of Indian Music, Culture & Languages",
        description: description || "Learn Carnatic, Hindustani, Veena, Vocal, and Languages.",
        keywords: keywords || "Music, Veena, Sanskrit, Tamil, Hindi, French, Chennai",
        robots: {
          index: false,
          follow: false,
        },
        openGraph: {
          title: title,
          description: description,
          url: "/",
          siteName: "Vidyasthanam",
          images: [
            {
              url: "/logocanva1.png",
              width: 1200,
              height: 630,
              alt: "Vidyasthanam Music Academy",
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: title,
          description: description,
          images: ["/logocanva1.png"],
        },
      };
    }
  } catch (err) {
    console.error("Home metadata generation error:", err);
  }
  return {
    title: "Vidyasthanam - School of Indian Music, Culture & Languages",
    robots: {
      index: false,
      follow: false,
    },
  };
}


export default async function HomePage() {
  let homeData = {
    slider: { title: "", desc: "", slides: [] },
    about: { title: "", desc: "", images: [] },
    teacher: { title: "", desc: "", teachers: [] },
    foundation: { title: "", desc: "", images: [] },
    course: { title: "", desc: "", courses: [] },
    events: { title: "", desc: "", videos: [] },
    journey: { title: "", desc: "" },
  };

  try {
    // ✅ Server-side data fetching directly from DB during build
    const res = await getHomeData();

    if (res.success && res.data) {
      homeData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch home data on server:", err);
    // Fallback to empty state or potentially a static JSON if needed
  }

  // Pass cached server data to the interactive Client Component
  return (
    <>
      <div id="loader">
        <div className="three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
      <HomeContent home={homeData} />
    </>
  );
}
