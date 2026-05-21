"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/Banner";
import styles from "./publication.module.css";
import api from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faFolderOpen, faFilePdf, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

export default function PublicationsContent({ initialData }) {
  const [activeCategory, setActiveCategory] = useState("publications");

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

          <div className="row">
            {/* Full Width List Panel */}
            <div className="col-12">
              <div className="publications-content-wrapper position-relative">
                <div className="course-category active">
                  <div className="card shadow-sm border rounded-4 p-4 list-scroll bg-white">
                    <h4 className="mb-4 text-orange border-bottom pb-2">
                      <FontAwesomeIcon
                        icon={activeCategory === "publications" ? faBookOpen : faFolderOpen}
                        className="me-2"
                      />
                      {activeCategory === "publications"
                        ? "Publications"
                        : "Resources"}
                      <span className="badge bg-orange rounded-pill ms-2">
                        {currentList.length}
                      </span>
                    </h4>
                    <div 
                      className="list-scroll"
                      style={{ maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}
                    >
                      <div className="row g-3">
                        {currentList.length === 0 && !loading && (
                          <div className="col-12">
                            <p className="text-muted text-center py-4">No documents available in this category.</p>
                          </div>
                        )}
                        {currentList.map((doc, index) => (
                          <div key={index} className="col-lg-4 col-md-6 col-12">
                            <a
                              href={(process.env.NEXT_PUBLIC_BASE_PATH || "") + doc.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="d-flex align-items-center p-3 rounded text-decoration-none shadow-sm pdf-link-item bg-light h-100"
                            >
                              <FontAwesomeIcon icon={faFilePdf} size="2x" className="text-orange me-3" />
                              <span className="text-dark fw-medium lh-sm">
                                {doc.name}
                              </span>
                              <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-auto text-muted small" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
