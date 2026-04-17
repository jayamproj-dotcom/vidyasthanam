import React from "react";
import api from "@/lib/api";
import CoursesContent from "./CoursesContent";

/**
 * Server Component for the Courses Page
 * Handles high-performance data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await api.get("/courses", {
      next: { 
        revalidate: parseInt(process.env.REVALIDATE) || 60, 
        tags: ["courses-data"] 
      }
    });
    if (res.success && res.data) {
      return {
        title: res.data.metaTitle,
        description: res.data.metaDescription,
        keywords: res.data.metaKeywords,
        openGraph: {
          title: res.data.metaTitle,
          description: res.data.metaDescription,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses`,
        }
      };
    }
  } catch (err) {
    console.error("Courses metadata generation error:", err);
  }
  return { title: "Our Courses | Vidyasthanam" };
}

export default async function CoursesPage() {
  let coursesData = {
    courses: []
  };

  try {
    const res = await api.get("/courses", {
      next: { 
        revalidate: parseInt(process.env.REVALIDATE) || 60, 
        tags: ["courses-data"] 
      }
    });

    if (res.success && res.data) {
      coursesData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch courses data on server:", err);
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
      <CoursesContent initialData={coursesData} />
    </>
  );
}
