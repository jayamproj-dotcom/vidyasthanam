"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Banner from "@/components/Banner";
import api from "@/lib/api";

// ─────────────────────────────────────────────
// Custom Hook: Intersection Observer
// ─────────────────────────────────────────────
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

// ─────────────────────────────────────────────
// Lazy Image Component
// ─────────────────────────────────────────────
const LazyBannerImage = React.memo(({ src, alt, className, style, onClick }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f0f0f0",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <style>{`
        @keyframes lazyShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Shimmer */}
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "lazyShimmer 1.2s infinite",
            zIndex: 1
          }}
        />
      )}

      {/* Render <img> only when scrolled into view */}
      {isVisible && src ? (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.6s ease-in-out",
            display: "block",
          }}
        />
      ) : !src ? (
        <i className="fas fa-image" style={{ color: "#ccc", fontSize: "40px" }} />
      ) : null}
    </div>
  );
});
LazyBannerImage.displayName = "LazyBannerImage";

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

  console.log(data);
  

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
  }, []);

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
                    <div className="img-fluid rounded shadow overflow-hidden mx-auto" style={{ width: "100%", aspectRatio: "1.2" }}>
                      <LazyBannerImage
                        src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + section.images[0]}
                        alt={section.title || "About Section Image"}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
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
                      <LazyBannerImage
                        src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + item.src}
                        alt={item.alt || ""}
                        className="gallery-img"
                        style={{ objectFit: "cover", width: "100%", height: "300px" }}
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
            <div style={{ width: "100%", height: "80vh", maxHeight: "800px" }}>
              <LazyBannerImage
                key={(process.env.NEXT_PUBLIC_BASE_PATH || "") + lightbox.currentImg}
                src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + lightbox.currentImg}
                alt={lightbox.currentCaption}
                className="lightbox-img"
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </div>
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
