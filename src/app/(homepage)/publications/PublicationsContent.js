"use client";

import React, { useState, useEffect, useRef } from "react";
import Banner from "@/components/Banner";
import styles from "./publication.module.css";
import api from "@/lib/api";

export default function PublicationsContent({ initialData }) {
  const [activeCategory, setActiveCategory] = useState("publications");
  const [selectedPdf, setSelectedPdf] = useState("");
  const viewerRef = useRef(null);

  const [data, setData] = useState(() => {
    const raw = initialData || { publications: [], resources: [] };
    return {
      publications: (raw.publications || []).filter(item => item.isActive !== false),
      resources: (raw.resources || []).filter(item => item.isActive !== false)
    };
  });
  const [loading, setLoading] = useState(!initialData);

  const currentList = activeCategory === "publications" ? (data.publications || []) : (data.resources || []);

  useEffect(() => {
    // Hide preloader when component mounts
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }

    if (!initialData) {
      const fetchData = async () => {
        try {
          const res = await api.get("/publications");
          if (res.success && res.data) {
            setData({
              publications: (res.data.publications || []).filter(item => item.isActive !== false),
              resources: (res.data.resources || []).filter(item => item.isActive !== false)
            });
          }
        } catch (err) {
          console.error("Failed to fetch publications", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [initialData]);

  useEffect(() => {
    // Load first PDF as default when category changes
    if (currentList.length > 0) {
      setSelectedPdf(currentList[0].path);
    } else {
      setSelectedPdf("");
    }
  }, [activeCategory, currentList.length]);

  const handlePdfSelect = (path) => {
    setSelectedPdf(path);
    if (window.innerWidth <= 991 && viewerRef.current) {
      viewerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="inner-page">
      <Banner />

      <section className="publications-section py-5">
        <div className="container-fluid px-4 px-lg-5">
          <h2 className="section-title text-center mb-5">
            Publications & Resources
          </h2>

          {/* Toggle Buttons */}
          <div className="d-flex justify-content-center mb-5 flex-wrap gap-3">
            <button
              className={`${styles["category-btn"]} px-5 ${activeCategory === "publications" ? styles.active : ""}`}
              onClick={() => setActiveCategory("publications")}
            >
              Publications
            </button>
            <button
              className={`${styles["category-btn"]} px-5 ${activeCategory === "resources" ? styles.active : ""}`}
              onClick={() => setActiveCategory("resources")}
            >
              Resources
            </button>
          </div>

          <div className="row split-view-row">
            {/* Left Side: List (40%) */}
            <div className="col-lg-5 col-md-12 mb-4 mb-lg-0">
              <div className="publications-content-wrapper position-relative split-panel">
                <div className="course-category active">
                  <div className="card shadow-sm border-0 rounded-4 p-4 list-scroll bg-white">
                    <h4 className="mb-4 text-orange border-bottom pb-2">
                      <i
                        className={`fas ${activeCategory === "publications" ? "fa-book-open" : "fa-folder-open"} me-2`}
                      ></i>
                      {activeCategory === "publications"
                        ? "Publications"
                        : "Resources"}
                      <span className="badge bg-orange rounded-pill ms-2">
                        {currentList.length}
                      </span>
                    </h4>
                    <div className="d-flex flex-column gap-3">
                      {currentList.length === 0 && !loading && (
                        <p className="text-muted text-center py-4">No documents available in this category.</p>
                      )}
                      {currentList.map((doc, index) => (
                        <div
                          key={index}
                          className={`d-flex align-items-center p-3 rounded text-decoration-none shadow-sm pdf-link-item ${selectedPdf === doc.path ? "active-pdf" : "bg-light"}`}
                          onClick={() => handlePdfSelect(doc.path)}
                        >
                          <i className="fas fa-file-pdf fa-2x text-orange me-3"></i>
                          <span className="text-dark fw-medium lh-sm">
                            {doc.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Viewer (60%) */}
            <div className="col-lg-7 col-md-12" ref={viewerRef}>
              <div className="card shadow-sm border-0 rounded-4 p-2 position-relative bg-light split-panel">
                {!selectedPdf && (
                  <div
                    className="d-flex flex-column justify-content-center align-items-center h-100 w-100 position-absolute bg-white"
                    style={{ top: 0, left: 0, zIndex: 5, borderRadius: "1rem" }}
                  >
                    <i className="fas fa-file-pdf fa-4x text-muted mb-3 opacity-50"></i>
                    <h5 className="text-muted">
                      Select a document from the left to view it here
                    </h5>
                  </div>
                )}
                <iframe
                  src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + selectedPdf || "about:blank"}
                  className="w-100 border-0 rounded-3 h-100"
                  title="PDF Viewer"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
