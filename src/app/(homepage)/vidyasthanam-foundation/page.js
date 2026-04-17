import React from "react";
import api from "@/lib/api";
import FoundationContent from "./FoundationContent";
import Banner from "@/components/Banner";
import { getFoundationData } from "@/lib/services/dataService";

/**
 * Server Component for the Vidyasthanam Foundation Page
 * Handles data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getFoundationData();
    if (res.success && res.data) {
      const { metaTitle, metaDescription, metaKeywords } = res.data;
      return {
        title: metaTitle || "Vidyasthanam Foundation | Promoting Hindu Heritage",
        description: metaDescription || "Promoting and propagating Hindu rituals and cultural heritage.",
        keywords: metaKeywords || "hindu rituals, vedic traditions, foundation",
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          url: "/vidyasthanam-foundation",
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
    console.error("Foundation metadata generation error:", err);
  }
  return { title: "Vidyasthanam Foundation | Promoting Hindu Heritage" };
}


export default async function VidyasthanamFoundationPage() {
  let foundationData = {
    isActive: true
  };

  try {
    const res = await getFoundationData();


    if (res.success && res.data) {
      foundationData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch foundation data on server:", err);
  }

  // Page visibility check
  if (foundationData.isActive === false) {
    return (
      <div className="inner-page">
        <Banner />
        <div className="container py-5 text-center">
          <div className="py-5">
            <i className="fas fa-hand-holding-heart fa-4x text-orange mb-4"></i>
            <h3>Foundation Information Temporarily Unavailable</h3>
            <p className="text-muted">We are currently updating our foundation details. Please check back later!</p>
          </div>
        </div>
      </div>
    );
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
      <FoundationContent initialData={foundationData} />
    </>
  );
}
