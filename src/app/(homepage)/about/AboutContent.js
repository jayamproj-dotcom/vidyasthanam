"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Banner from "@/components/Banner";
import api from "@/lib/api";

export default function AboutContent({ initialData }) {
  const [data, setData] = useState(
    initialData || {
      storySections: [],
      timeline: [],
      gallery: [],
      timelineBg: "",
    },
  );
  const [loading, setLoading] = useState(!initialData);

  const [lightbox, setLightbox] = useState({
    isOpen: false,
    currentImg: "",
    currentCaption: "",
    currentIndex: 0,
  });

  useEffect(() => {
    // Hide preloader when component mounts
    const loader = document.getElementById("loader");
    if (loader) {
      loader.classList.add("fade-out");
      setTimeout(() => {
        loader.style.display = "none";
      }, 500);
    }

    // If we have initialData, we don't need a client-side fetch on mount
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get("/about");
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch about data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialData]);

  const openLightbox = (index) => {
    const item = data.gallery[index];
    setLightbox({
      isOpen: true,
      currentImg: item.src,
      currentCaption: item.alt || item.category,
      currentIndex: index,
    });
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
    document.body.style.overflow = "auto";
  };

  const nextImg = (e) => {
    e.stopPropagation();
    const newIndex = (lightbox.currentIndex + 1) % data.gallery.length;
    const item = data.gallery[newIndex];
    setLightbox({
      ...lightbox,
      currentImg: item.src,
      currentCaption: item.alt || item.category,
      currentIndex: newIndex,
    });
  };

  const prevImg = (e) => {
    e.stopPropagation();
    const newIndex =
      (lightbox.currentIndex - 1 + data.gallery.length) % data.gallery.length;
    const item = data.gallery[newIndex];
    setLightbox({
      ...lightbox,
      currentImg: item.src,
      currentCaption: item.alt || item.category,
      currentIndex: newIndex,
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImg(e);
      if (e.key === "ArrowLeft") prevImg(e);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox.isOpen, lightbox.currentIndex, data.gallery]);

  return (
    <div className="inner-page">
      <Banner />

      {/* About Section */}
      <section className="about-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 className="section-title text-center mb-5">Our Story</h2>
            </div>
          </div>

          {data.storySections
            ?.filter((s) => s.isActive !== false)
            .map((section, idx) => (
              <div
                key={idx}
                className={`row align-items-center mb-5 ${idx % 2 !== 0 ? "flex-md-row-reverse" : ""}`}
              >
                <div className="col-md-6 mb-4 mb-md-0">
                  {section.images?.[0] && (
                    <Image
                      src={section.images[0]}
                      alt={section.title || "About Section Image"}
                      className="img-fluid rounded shadow"
                      width={630}
                      height={522}
                      sizes="(max-width: 768px) 100vw, 388px"
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  )}
                </div>
                <div className="col-md-6">
                  {section.title && (
                    <h3 className="mb-3 text-orange">{section.title}</h3>
                  )}
                  {(section.content || section.desc)
                    ?.split("\n\n")
                    .map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                </div>
              </div>
            ))}

          {(!data.storySections || data.storySections.length === 0) &&
            !loading && (
              <div className="text-center py-5">
                <p>No story content available yet.</p>
              </div>
            )}
        </div>
      </section>

      {/* History Section */}
      <section
        className="history-section py-5 bg-dark"
        style={{
          backgroundImage: data.timelineBg
            ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${(process.env.NEXT_PUBLIC_BASE_PATH || "") + data.timelineBg})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 className="section-title text-center text-white mb-5">
                Our Journey
              </h2>
            </div>
          </div>
          <div className="timeline">
            {data.timeline
              ?.filter((t) => t.isActive !== false)
              .map((item, idx) => (
                <div
                  key={idx}
                  className={`timeline-item ${idx % 2 === 0 ? "left" : "right"}`}
                >
                  <div className="timeline-content">
                    <h3 className="text-orange">{item.year}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section py-5" id="gallery">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 className="section-title text-center mb-5">Our Gallery</h2>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="gallery-grid">
                {data.gallery
                  ?.filter((g) => g.isActive !== false)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="gallery-item"
                      data-category={item.category}
                      onClick={() => openLightbox(index)}
                      style={{ cursor: "pointer" }}
                    >
                      <Image
                        src={item.src}
                        alt={item.alt || ""}
                        className="gallery-img"
                        width={400}
                        height={300}
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="gallery-overlay">
                        <div className="gallery-caption">
                          {item.alt || item.category}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox.isOpen && (
        <div className="lightbox open" onClick={closeLightbox}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="lightbox-close" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </span>
            <Image
              src={lightbox.currentImg}
              alt={lightbox.currentCaption}
              className="lightbox-img"
              width={1000}
              height={800}
              style={{ objectFit: "contain" }}
            />
            <div className="lightbox-caption">{lightbox.currentCaption}</div>
          </div>
          <span className="lightbox-control lightbox-prev" onClick={prevImg}>
            <i className="fas fa-chevron-left"></i>
          </span>
          <span className="lightbox-control lightbox-next" onClick={nextImg}>
            <i className="fas fa-chevron-right"></i>
          </span>
        </div>
      )}
    </div>
  );
}
