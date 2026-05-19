"use client";

import React, { useState, useEffect, useRef } from "react";
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

// Helper to extract YouTube video ID from URL
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function EventsContent({ initialData }) {
  const [events, setEvents] = useState(() => {
    if (initialData?.events) {
      return initialData.events
        .filter(e => e.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return [];
  });
  
  const [activeEventId, setActiveEventId] = useState(() => {
    if (events.length > 0) {
      return events[0]._id;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(!initialData);
  const [playingVideos, setPlayingVideos] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
     // Fallback if no initialData
     if (!initialData) {
        const fetchEvents = async () => {
          try {
            const res = await api.get("/events");
            if (res.success && res.data?.events) {
              const active = res.data.events
                .filter(e => e.isActive !== false)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              setEvents(active);
              if (active.length > 0) {
                setActiveEventId(active[0]._id);
              }
            }
          } catch (err) {
            console.error("Failed to fetch events", err);
          } finally {
            setLoading(false);
          }
        };
        fetchEvents();
     }

    // Hide preloader when component mounts
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }, [initialData, events.length]);

  const handleCategoryChange = (id) => {
    setActiveEventId(id);
    setPlayingVideos({}); // Reset playing videos state when category changes
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentEvent = events.find(e => e._id === activeEventId);

  return (
    <div className="inner-page">
      <Banner />

      <section className="vs-events-section">
        <div className="container">
          <h2 className="vs-section-title text-center">
            Student Performances & Recordings
          </h2>

          {!loading && events.length > 0 ? (
            <div className="vs-events-wrapper">
              {/* Sidebar */}
              <div className="vs-sidebar">
                <div className="vs-category-sidebar">
                  {events.map((e) => (
                    <button
                      key={e._id}
                      className={`vs-category-btn vs-event-btn ${activeEventId === e._id ? "active" : ""}`}
                      onClick={() => handleCategoryChange(e._id)}
                    >
                      <i className="fas fa-calendar-alt me-2 text-orange"></i>
                      {e.dateLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="vs-video-content" ref={contentRef}>
                {currentEvent && (
                  <div className="vs-event-container active">
                    <h3 className="vs-event-title">{currentEvent.dateLabel}</h3>
                    <div className="vs-video-grid">
                      {currentEvent.videos?.map((video, idx) => {
                        const videoKey = `${currentEvent._id}_${idx}`;
                        const youtubeId = getYouTubeId(video.url);
                        const thumbnailUrl = youtubeId
                          ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                          : null;

                        return (
                          <div key={idx} className="vs-video-card">
                            <div className="vs-video-wrapper" style={{ position: "relative" }}>
                              {playingVideos[videoKey] ? (
                                <iframe
                                  src={video.url ? `${video.url}${video.url.includes('?') ? '&' : '?'}autoplay=1` : ""}
                                  title={video.title}
                                  allowFullScreen
                                  allow="autoplay; encrypted-media"
                                  loading="lazy"
                                ></iframe>
                              ) : (
                                <div
                                  className="vs-video-placeholder"
                                  onClick={() => setPlayingVideos(prev => ({ ...prev, [videoKey]: true }))}
                                  style={{ position: "absolute", inset: 0, cursor: "pointer" }}
                                >
                                  <LazyBannerImage
                                    src={thumbnailUrl}
                                    alt={video.title}
                                    style={{ width: "100%", height: "100%" }}
                                  />
                                  {/* Play Button Overlay */}
                                  <div
                                    style={{
                                      position: "absolute",
                                      inset: 0,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "rgba(0, 0, 0, 0.15)",
                                      zIndex: 2,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(255, 90, 0, 0.9)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: "24px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                                        transition: "transform 0.2s ease, background-color 0.2s ease",
                                      }}
                                      className="play-btn-hover"
                                    >
                                      <i className="fas fa-play" style={{ marginLeft: "4px" }}></i>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="vs-video-details">
                              <h5 className="vs-video-heading">{video.title}</h5>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : !loading && (
             <div className="text-center py-5">
                <p>No events recorded yet. Check back soon for new performances!</p>
             </div>
          )}

          {loading && (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin fa-3x text-orange"></i>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .vs-video-placeholder:hover .play-btn-hover {
          transform: scale(1.1);
          background-color: rgba(255, 69, 0, 1.0) !important;
        }
      `}</style>
    </div>
  );
}
