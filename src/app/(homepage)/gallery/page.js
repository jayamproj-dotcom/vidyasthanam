import React from "react";
import api from "@/lib/api";
import GalleryContent from "./GalleryContent";
import Banner from "@/components/Banner";
import { getGalleryData } from "@/lib/services/dataService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";

/**
 * Server Component for the Gallery Page
 * Handles data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getGalleryData();
    if (res.success && res.data) {
      const { metaTitle, metaDescription, metaKeywords } = res.data;
      return {
        title: metaTitle || "Photo Gallery | Vidyasthanam",
        description: metaDescription || "View photos from our recent performances and events.",
        keywords: metaKeywords || "Vidyasthanam gallery, music photos, recitals",
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          url: "/gallery",
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
    console.error("Gallery metadata generation error:", err);
  }
  return { title: "Photo Gallery | Vidyasthanam" };
}


export default async function GalleryPage() {
  let galleryData = {
    images: [],
    isActive: true
  };

  try {
    const res = await getGalleryData();


    if (res.success && res.data) {
      galleryData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch gallery data on server:", err);
  }

  // Page visibility check
  if (galleryData.isActive === false) {
    return (
      <div className="inner-page">
        <Banner />
        <div className="container py-5 text-center">
          <div className="py-5">
            <FontAwesomeIcon icon={faImages} size="4x" className="text-orange mb-4" />
            <h3>Gallery Temporarily Unavailable</h3>
            <p className="text-muted">We are currently updating our photo collection. Please check back soon!</p>
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
      <GalleryContent initialData={galleryData} />
    </>
  );
}
