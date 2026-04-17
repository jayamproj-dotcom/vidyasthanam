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
      return {
        title: res.data.title || "Vidyasthanam - School of Indian Music, Culture & Languages",
        description: res.data.description || "Learn Carnatic, Hindustani, Veena, Vocal, and Languages.",
        keywords: res.data.keywords || "Music, Veena, Sanskrit, Tamil, Hindi, French, Chennai",
        openGraph: {
          title: res.data.title,
          description: res.data.description,
          url: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/`,
        }
      };
    }
  } catch (err) {
    console.error("Home metadata generation error:", err);
  }
  return { title: "Vidyasthanam - School of Indian Music, Culture & Languages" };
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
