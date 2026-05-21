import React from "react";
import api from "@/lib/api";
import PublicationsContent from "./PublicationsContent";
import Banner from "@/components/Banner";
import { getPublicationsData } from "@/lib/services/dataService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

/**
 * Server Component for the Publications Page
 * Handles high-performance data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getPublicationsData();
    if (res.success && res.data) {
      const { metaTitle, metaDescription, metaKeywords } = res.data;
      return {
        title: metaTitle || "Publications & Resources | Vidyasthanam",
        description: metaDescription || "Explore our collection of Indian music and cultural publications.",
        keywords: metaKeywords || "Vidyasthanam publications, music resources, PDFs",
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          url: "/publications",
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
    console.error("Publications metadata generation error:", err);
  }
  return { title: "Publications & Resources | Vidyasthanam" };
}


export default async function PublicationsPage() {
  let publicationsData = {
    publications: [],
    resources: []
  };

  try {
    const res = await getPublicationsData();


    if (res.success && res.data) {
      publicationsData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch publications data on server:", err);
  }

  if (publicationsData.isActive === false) {
    return (
      <div className="inner-page">
        <Banner />
        <div className="container py-5 text-center">
          <div className="py-5">
            <FontAwesomeIcon icon={faInfoCircle} size="4x" className="text-orange mb-4" />
            <h3>Publications & Resources Temporarily Unavailable</h3>
            <p className="text-muted">Please check back later as we update our collection.</p>
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
      <PublicationsContent initialData={publicationsData} />
    </>
  );
}
