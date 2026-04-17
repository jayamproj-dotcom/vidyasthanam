"use client";

import React, { useState, useEffect, useRef } from "react";
import Banner from "@/components/Banner";
import api from "@/lib/api";

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
                      {currentEvent.videos?.map((video, idx) => (
                        <div key={idx} className="vs-video-card">
                          <div className="vs-video-wrapper">
                            <iframe
                              src={video.url}
                              title={video.title}
                              allowFullScreen
                              loading="lazy"
                            ></iframe>
                          </div>
                          <div className="vs-video-details">
                            <h5 className="vs-video-heading">{video.title}</h5>
                          </div>
                        </div>
                      ))}
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
    </div>
  );
}
