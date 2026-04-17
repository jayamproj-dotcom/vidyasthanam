"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Banner from "@/components/Banner";
import api from "@/lib/api";

export default function DynamicPage() {
  const params = useParams();
  const slug = params?.slug;
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageSettings = async () => {
      try {
        const res = await api.get("/navbar");
        if (res.success) {
          // Match by path equal to /slug
          const match = res.data.find(item => item.path === `/${slug}` && item.isActive);
          if (match) {
            setPageData(match);
          }
        }
      } catch (err) {
        console.error("Failed to load page settings", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPageSettings();
  }, [slug]);

  if (loading) return <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fas fa-spinner fa-spin fa-2x"></i></div>;
  
  if (!pageData) return notFound();

  return (
    <div className="inner-page">
      <Banner 
        title={pageData.name} 
        bgImage={pageData.bannerImage ? (pageData.bannerImage.startsWith("http") ? pageData.bannerImage : (process.env.NEXT_PUBLIC_BASE_PATH || "") + (pageData.bannerImage.startsWith("/") ? "" : "/") + pageData.bannerImage) : (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/img/canva1.jpg"} 
        activePage={pageData.name}
      />

      <section className="py-5">
        <div className="container text-center py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="mb-4">{pageData.name}</h2>
              <p className="lead text-muted">
                Content for the {pageData.name} page is currently being curated. 
                Please check back soon for updates on our {pageData.name.toLowerCase()} programs and initiatives.
              </p>
              <div className="mt-5">
                <img src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + "/img/logocanva1.png"} alt="Logo" width={80} style={{ opacity: 0.2 }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
