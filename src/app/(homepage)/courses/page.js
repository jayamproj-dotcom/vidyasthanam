import React from "react";
import api from "@/lib/api";
import CoursesContent from "./CoursesContent";
import { getCoursesData } from "@/lib/services/dataService";

/**
 * Server Component for the Courses Page
 * Handles high-performance data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getCoursesData();
    if (res.success && res.data) {
      const { metaTitle, metaDescription, metaKeywords } = res.data;
      return {
        title: metaTitle || "Our Courses | Vidyasthanam",
        description: metaDescription || "Explore our wide range of Indian music and cultural courses.",
        keywords: metaKeywords || "Music courses, Vocal training, Veena, Sanskrit, Tamil",
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          url: "/courses",
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
    console.error("Courses metadata generation error:", err);
  }
  return { title: "Our Courses | Vidyasthanam" };
}


export default async function CoursesPage() {
  let coursesData = {
    courses: []
  };

  try {
    const res = await getCoursesData();


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
