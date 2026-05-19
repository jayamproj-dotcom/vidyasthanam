"use client";

import React, { useState, useEffect, useCallback } from "react";
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
            ...style,
          }}
        />
      ) : !src ? (
        <i className="fas fa-image" style={{ color: "#ccc", fontSize: "40px" }} />
      ) : null}
    </div>
  );
});
LazyBannerImage.displayName = "LazyBannerImage";

export default function GalleryContent({ initialData }) {
  const [data, setData] = useState(initialData || { images: [] });
  const [loading, setLoading] = useState(!initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = (data.images || []).filter((img) => img.isActive !== false);

  useEffect(() => {
    // Hide preloader when component mounts
    const loader = document.getElementById("loader");
    if (loader) {
      loader.classList.add("fade-out");
      setTimeout(() => {
        loader.style.display = "none";
      }, 500);
    }

    if (!initialData) {
      const fetchGallery = async () => {
        try {
          const res = await api.get("/gallery");
          if (res.success && res.data) {
            setData(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch gallery", err);
        } finally {
          setLoading(false);
        }
      };
      fetchGallery();
    }
  }, [initialData]);

  const openSlider = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeSlider = () => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeSlider();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextImage, prevImage]);

  return (
    <div className="inner-page">
      <Banner />

      {/* Gallery Section */}
      <div className="gallery-wrapper">
        <div className="container">
          <h2 className="gallery-heading">Our Gallery</h2>

          {loading && images.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-3x text-orange"></i>
            </div>
          ) : images.length > 0 ? (
            <div className="masonry-grid">
              {images.map((img, idx) => (
                <div
                  key={img.src + idx}
                  className="grid-item"
                  onClick={() => openSlider(idx)}
                >
                  <LazyBannerImage
                    src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + img.src}
                    alt={img.alt || "Gallery Image"}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">
                No images available in the gallery yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slider Overlay (Lightbox) */}
      {isOpen && images.length > 0 && (
        <div
          className="slider-overlay active"
          id="sliderOverlay"
          onClick={(e) => e.target.id === "sliderOverlay" && closeSlider()}
        >
          <div className="slider-container">
            <button className="slider-btn prev-btn" onClick={prevImage}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <div className="slider-frame">
              <LazyBannerImage
                key={(process.env.NEXT_PUBLIC_BASE_PATH || "") + images[currentIndex].src}
                className="slider-main-img"
                src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + images[currentIndex].src}
                alt="zoom"
                style={{ objectFit: "contain" }}
              />
            </div>
            <button className="slider-btn next-btn" onClick={nextImage}>
              <i className="fas fa-chevron-right"></i>
            </button>
            <button
              className="close-btn"
              id="closeSliderBtn"
              onClick={closeSlider}
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="counter-indicator" id="imageCounter">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
