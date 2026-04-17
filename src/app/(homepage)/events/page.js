import React from "react";
import api from "@/lib/api";
import EventsContent from "./EventsContent";

/**
 * Server Component for the Events Page
 * Handles high-performance data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await api.get("/events", {
      next: { 
        revalidate: parseInt(process.env.REVALIDATE) || 60, 
        tags: ["events-data"] 
      }
    });
    if (res.success && res.data) {
      // Logic for metadata if available in res.data, otherwise defaults
      return {
        title: res.data.metaTitle || "Events & Performances | Vidyasthanam",
        description: res.data.metaDescription || "View latest performances and school events.",
        keywords: res.data.metaKeywords || "Vidyasthanam, Events, Carnatic Music",
        openGraph: {
            title: res.data.metaTitle,
            description: res.data.metaDescription,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/events`,
        }
      };
    }
  } catch (err) {
    console.error("Events metadata generation error:", err);
  }
  return { title: "Events & Performances | Vidyasthanam" };
}

export default async function EventsPage() {
  let eventsData = {
    events: []
  };

  try {
    const res = await api.get("/events", {
      next: { 
        revalidate: parseInt(process.env.REVALIDATE) || 60, 
        tags: ["events-data"] 
      }
    });

    if (res.success && res.data) {
      eventsData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch events data on server:", err);
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
      <EventsContent initialData={eventsData} />
    </>
  );
}
