import React from "react";
import api from "@/lib/api";
import GalleryContent from "./GalleryContent";
import Banner from "@/components/Banner";

/**
 * Server Component for the Gallery Page
 * Handles data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await api.get("/gallery", {
      next: { 
        revalidate: parseInt(process.env.REVALIDATE) || 60, 
        tags: ["gallery-data"] 
      }
    });
    if (res.success && res.data) {
      return {
        title: res.data.metaTitle || "Photo Gallery | Vidyasthanam",
        description: res.data.metaDescription || "View photos from our recent performances and events.",
        keywords: res.data.metaKeywords || "Vidyasthanam gallery, music photos, recitals",
        openGraph: {
          title: res.data.metaTitle,
          description: res.data.metaDescription,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/gallery`,
        }
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
    const res = await api.get("/gallery", {
      next: { 
        revalidate: parseInt(process.env.REVALIDATE) || 60, 
        tags: ["gallery-data"] 
      }
    });

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
            <i className="fas fa-images fa-4x text-orange mb-4"></i>
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
