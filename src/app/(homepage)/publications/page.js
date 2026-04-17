import React from "react";
import api from "@/lib/api";
import PublicationsContent from "./PublicationsContent";
import { getPublicationsData } from "@/lib/services/dataService";

/**
 * Server Component for the Publications Page
 * Handles high-performance data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getPublicationsData();
    if (res.success && res.data) {
      return {
        title: res.data.metaTitle || "Publications & Resources | Vidyasthanam",
        description: res.data.metaDescription || "Explore our collection of Indian music and cultural publications.",
        keywords: res.data.metaKeywords || "Vidyasthanam publications, music resources, PDFs",
        openGraph: {
          title: res.data.metaTitle,
          description: res.data.metaDescription,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/publications`,
        }
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
            <i className="fas fa-info-circle fa-4x text-orange mb-4"></i>
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
