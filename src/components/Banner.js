"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

// ─────────────────────────────────────────────
// 1. Custom Hook: Intersection Observer (from Admin)
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
// 2. Adapted Lazy Image for Banner
// ─────────────────────────────────────────────
const LazyBannerImage = React.memo(({ src, alt }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f0f0f0",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1
      }}
    >
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
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#eee"
          }}
        >
          <i className="fas fa-image" style={{ color: "#ccc", fontSize: "40px" }} />
        </div>
      ) : null}
    </div>
  );
});
LazyBannerImage.displayName = "LazyBannerImage";

const Banner = () => {
  const pathname = usePathname();
  const [navData, setNavData] = useState({
    name: "",
    bannerImage: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const res = await api.get("/navbar");
        if (res.success) {
          const currentItem = res.data.find(item => item.path === pathname);
          if (currentItem) {
            setNavData({
              name: currentItem.name,
              bannerImage: currentItem.bannerImage
            });
          } else {
            // Contextual fallbacks
            if (pathname.includes("student-registration")) {
              setNavData({ name: "Student Registration", bannerImage: "" });
            } else if (pathname.includes("vidyasthanam-foundation")) {
              setNavData({ name: "Vidyasthanam Foundation", bannerImage: "" });
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch banner data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerData();
  }, [pathname]);

  // Hide banner on homepage as it usually has a slider
  if (pathname === "/" || pathname === "/home") return null;

  const displayImage = navData.bannerImage || "/vidyasthanam/img/default-banner.jpg";

  return (
    <section className="banner position-relative overflow-hidden">
      
      {/* Shimmer animation keyframe */}
      <style>{`
        @keyframes lazyShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Use the Lazy Image Component ── */}
      <LazyBannerImage src={displayImage} alt={navData.name} />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-lg-10 banner-content mt-5">
            <h1 className="text-white fade-in" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
              {navData.name}
            </h1>
            <div className="breadcrumb-container">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link href="/home" className="text-decoration-none text-white opacity-75">
                      <i className="fas fa-home me-1"></i> Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item active text-white" aria-current="page">
                    {navData.name}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
