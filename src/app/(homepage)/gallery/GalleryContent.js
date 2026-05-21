"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Banner from "@/components/Banner";
import api from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faChevronLeft, faChevronRight, faTimes } from "@fortawesome/free-solid-svg-icons";

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
              <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-orange" />
            </div>
          ) : images.length > 0 ? (
            <div className="masonry-grid">
              {images.map((img, idx) => (
                <div
                  key={img.src + idx}
                  className="grid-item"
                  onClick={() => openSlider(idx)}
                >
                  <Image
                    src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + img.src}
                    alt={img.alt || "Gallery Image"}
                    width={400}
                    height={300}
                    unoptimized
                    priority={idx < 4}
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
            <button className="slider-btn prev-btn" onClick={prevImage} aria-label="Previous image">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="slider-frame">
              <Image
                key={(process.env.NEXT_PUBLIC_BASE_PATH || "") + images[currentIndex].src}
                className="slider-main-img"
                src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + images[currentIndex].src}
                alt="zoom"
                width={1200}
                height={800}
                unoptimized
                style={{ objectFit: "contain" }}
              />
            </div>
            <button className="slider-btn next-btn" onClick={nextImage} aria-label="Next image">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button
              className="close-btn"
              id="closeSliderBtn"
              onClick={closeSlider}
              aria-label="Close slider"
            >
              <FontAwesomeIcon icon={faTimes} />
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
