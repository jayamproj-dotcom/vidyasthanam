"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import styles from "./home.module.css";

// Helper to get initials
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

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

// --- Dynamic Interactivity Sections ---

const TeachersSection = dynamic(
  () =>
    Promise.resolve(({ home }) => {
      const activeTeachers =
        home?.teacher?.teachers?.filter((t) => t.isActive !== false) || [];
      const isScrollable = activeTeachers.length > 3;
      const displayTeachers = isScrollable
        ? [...activeTeachers, ...activeTeachers]
        : activeTeachers;

      return (
        <section className="teachers-section py-5">
          <div className={styles.customContainer}>
            <div className="section-header text-center mb-5">
              <h2 className="mb-3 section-title">{home?.teacher?.title}</h2>
              <p className="lead">{home?.teacher?.desc}</p>
            </div>

            {isScrollable ? (
              <div className={styles.scrollWrapper}>
                <div className={styles.infiniteScroll}>
                  {displayTeachers.map((teacher, index) => (
                    <div key={index} className={styles.teacherCardWrapper}>
                      <div className="teacher-card text-center p-4 h-100 rounded">
                        <div className="teacher-img mb-4 rounded-circle overflow-hidden mx-auto">
                          <div className="staff-avatar">
                            {teacher.avatar &&
                            (teacher.avatar.startsWith("/") ||
                              teacher.avatar.startsWith("http") ||
                              teacher.avatar.startsWith("data:")) ? (
                              <LazyBannerImage
                                src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + teacher.avatar}
                                alt={teacher.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            ) : (
                              <div className="initials-circle">
                                {getInitials(teacher.name)}
                              </div>
                            )}
                          </div>
                        </div>
                        <h4 className="teacher-name">{teacher.name}</h4>
                        <p className="text-muted">{teacher.position}</p>
                        <p>{teacher.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="row">
                {activeTeachers.map((teacher, index) => (
                  <div key={index} className="col-lg-4 col-md-6 mb-4">
                    <div className="teacher-card text-center p-4 h-100 rounded">
                      <div className="teacher-img mb-4 rounded-circle overflow-hidden mx-auto">
                        <div className="staff-avatar">
                          {teacher.avatar &&
                          (teacher.avatar.startsWith("/") ||
                            teacher.avatar.startsWith("http") ||
                            teacher.avatar.startsWith("data:")) ? (
                            <LazyBannerImage
                              src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + teacher.avatar}
                              alt={teacher.name}
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ) : (
                            <div className="initials-circle">
                              {getInitials(teacher.name)}
                            </div>
                          )}
                        </div>
                      </div>
                      <h4 className="teacher-name">{teacher.name}</h4>
                      <p className="text-muted">{teacher.position}</p>
                      <p>{teacher.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }),
  { ssr: true },
);

const FoundationSection = ({ home }) => (
  <div className="vf-about-section">
    <div className="vf-content-wrapper">
      <h3 className="vf-section-heading">{home?.foundation?.title}</h3>
      <p className="vf-content-text">{home?.foundation?.desc}</p>
      <Link href="/vidyasthanam-foundation" className="vf-action-button">
        Know More
      </Link>
      <div className="vf-decoration-element"></div>
    </div>
    <div className="vf-image-container">
      {home?.foundation?.images?.[0] && (
        <Image
          src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + home.foundation.images[0]}
          alt={home.foundation.title}
          className="vf-featured-image vf-image"
          width={400}
          height={400}
          unoptimized
          style={{ objectFit: "contain" }}
        />
      )}
    </div>
  </div>
);

const CoursesSection = dynamic(
  () =>
    Promise.resolve(({ home }) => {
      const activeCourses =
        home?.course?.courses?.filter((c) => c.isActive !== false) || [];
      const isScrollable = activeCourses.length > 3;
      const displayCourses = isScrollable
        ? [...activeCourses, ...activeCourses]
        : activeCourses;

      return (
        <section
          id="courses"
          className="courses-section py-5"
          style={{
            backgroundImage: home?.course?.bgImage
              ? `url(${(process.env.NEXT_PUBLIC_BASE_PATH || "") + home.course.bgImage})`
              : "",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "cover",
          }}
        >
          <div className={styles.customContainer}>
            <div className="section-header text-center mb-5">
              <h2 className="mb-3 section-title">{home?.course?.title}</h2>
              <p className="lead">{home?.course?.desc}</p>
            </div>

            {isScrollable ? (
              <div className={styles.scrollWrapper}>
                <div className={styles.infiniteScroll}>
                  {displayCourses.map((course, index) => (
                    <div key={index} className={styles.courseCardWrapper}>
                      <div className="course-card-icon text-center p-5 h-100">
                        <div className="course-icon mb-4" style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}>
                          {course.bgImage ? (
                            <div style={{ width: "80px", height: "80px", overflow: "hidden", borderRadius: "15px" }}>
                              <LazyBannerImage
                                src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + course.bgImage}
                                alt={course.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </div>
                          ) : (
                            <i
                              className={`${course.icon || "fas fa-music"} fa-4x text-orange`}
                            ></i>
                          )}
                        </div>
                        <h3>{course.name}</h3>
                        <p>{course.desc}</p>
                        <div className="course-details mt-4">
                          <ul className="text-start">
                            {course.points?.map((point, i) => (
                              <li key={i}>
                                <i className="fas fa-check text-orange me-2"></i>{" "}
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="row">
                {activeCourses.map((course, index) => (
                  <div key={index} className="col-lg-4 col-md-6 mb-4">
                    <div className="course-card-icon text-center p-5 h-100">
                      <div className="course-icon mb-4" style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}>
                        {course.bgImage ? (
                          <div style={{ width: "80px", height: "80px", overflow: "hidden", borderRadius: "15px" }}>
                            <LazyBannerImage
                              src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + course.bgImage}
                              alt={course.name}
                              style={{
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </div>
                        ) : (
                          <i
                            className={`${course.icon || "fas fa-music"} fa-4x text-orange`}
                          ></i>
                        )}
                      </div>
                      <h3>{course.name}</h3>
                      <p>{course.desc}</p>
                      <div className="course-details mt-4">
                        <ul className="text-start">
                          {course.points?.map((point, i) => (
                            <li key={i}>
                              <i className="fas fa-check text-orange me-2"></i>{" "}
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center mt-5">
              <Link href="/courses" className="event-btn">
                View All Courses
              </Link>
            </div>
          </div>
        </section>
      );
    }),
  { ssr: true },
);

const EventsSection = dynamic(
  () =>
    Promise.resolve(({ home }) => {
      const activeVideos =
        home?.events?.videos?.filter((v) => v.isActive !== false) || [];
      const isScrollable = activeVideos.length > 3;
      const displayVideos = isScrollable
        ? [...activeVideos, ...activeVideos]
        : activeVideos;

      const [playingVideos, setPlayingVideos] = useState({});

      return (
        <section id="events" className="events-section py-5">
          <div className={styles.customContainer}>
            <div className="section-header text-center mb-5">
              <h2 className="mb-3 section-title">{home?.events?.title}</h2>
              <p className="lead">{home?.events?.desc}</p>
            </div>

            {isScrollable ? (
              <div className={styles.scrollWrapper}>
                <div className={styles.infiniteScroll}>
                  {displayVideos.map((video, index) => {
                    const videoKey = `scroll_${index}`;
                    const youtubeId = getYouTubeId(video.link);
                    const thumbnailUrl = youtubeId
                      ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                      : null;

                    return (
                      <div key={index} className={styles.eventCardWrapper}>
                        <div className="event-card h-100">
                          <div className="event-img">
                            <div className="ratio ratio-16x9" style={{ position: "relative", backgroundColor: "#000" }}>
                              {playingVideos[videoKey] ? (
                                <iframe
                                  width="560"
                                  height="315"
                                  src={video.link ? `${video.link}${video.link.includes('?') ? '&' : '?'}autoplay=1` : ""}
                                  title={video.desc}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                ></iframe>
                              ) : (
                                <div
                                  onClick={() => setPlayingVideos(prev => ({ ...prev, [videoKey]: true }))}
                                  style={{ position: "absolute", inset: 0, cursor: "pointer" }}
                                >
                                  <LazyBannerImage
                                    src={thumbnailUrl}
                                    alt={video.desc}
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
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(255, 90, 0, 0.9)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: "20px",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                                        transition: "transform 0.2s ease, background-color 0.2s ease",
                                      }}
                                      className="play-btn-hover-home"
                                    >
                                      <i className="fas fa-play" style={{ marginLeft: "3px" }}></i>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="event-date">
                              <span className="day">{video.date?.day}</span>
                              <span className="month">{video.date?.month}</span>
                            </div>
                          </div>
                          <div className="event-content p-4">
                            <p className="mb-3">{video.desc}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="row">
                {activeVideos.map((video, index) => {
                  const videoKey = `row_${index}`;
                  const youtubeId = getYouTubeId(video.link);
                  const thumbnailUrl = youtubeId
                    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                    : null;

                  return (
                    <div key={index} className="col-lg-4 col-md-6 mb-4">
                      <div className="event-card h-100">
                        <div className="event-img">
                          <div className="ratio ratio-16x9" style={{ position: "relative", backgroundColor: "#000" }}>
                            {playingVideos[videoKey] ? (
                              <iframe
                                width="560"
                                height="315"
                                src={video.link ? `${video.link}${video.link.includes('?') ? '&' : '?'}autoplay=1` : ""}
                                title={video.desc}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              ></iframe>
                            ) : (
                              <div
                                onClick={() => setPlayingVideos(prev => ({ ...prev, [videoKey]: true }))}
                                style={{ position: "absolute", inset: 0, cursor: "pointer" }}
                              >
                                <LazyBannerImage
                                  src={thumbnailUrl}
                                  alt={video.desc}
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
                                      width: "50px",
                                      height: "50px",
                                      borderRadius: "50%",
                                      backgroundColor: "rgba(255, 90, 0, 0.9)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#fff",
                                      fontSize: "20px",
                                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                                      transition: "transform 0.2s ease, background-color 0.2s ease",
                                    }}
                                    className="play-btn-hover-home"
                                  >
                                    <i className="fas fa-play" style={{ marginLeft: "3px" }}></i>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="event-date">
                            <span className="day">{video.date?.day}</span>
                            <span className="month">{video.date?.month}</span>
                          </div>
                        </div>
                        <div className="event-content p-4">
                          <p className="mb-3">{video.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="text-center mt-5">
              <Link href="/events" className="event-btn">
                View All Events
              </Link>
            </div>
          </div>
          <style>{`
            .play-btn-hover-home:hover {
              transform: scale(1.1);
              background-color: rgba(255, 69, 0, 1.0) !important;
            }
          `}</style>
        </section>
      );
    }),
  { ssr: true },
);

export default function HomeContent({ home }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlides =
    home?.slider?.slides?.filter((s) => s.isActive !== false) || [];

  useEffect(() => {
    // Hide preloader when component mounts
    const loader = document.getElementById("loader");
    if (loader) {
      loader.classList.add("fade-out");
      setTimeout(() => {
        loader.style.display = "none";
      }, 500); // Match transition duration in CSS
    }

    if (activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) =>
        prev === activeSlides.length - 1 ? 0 : prev + 1,
      );
    }, 4500);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  return (
    <>
      {home?.slider?.isActive !== false && (
        <header className="hero-section">
          <div className="heroSlider">
            {activeSlides.map((slide, index) => (
              <div
                key={index}
                className={`slide ${index === activeIndex ? "active" : ""}`}
              >
                {index === 0 ? (
                  <Image
                    src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + slide.image}
                    alt="Slide Image"
                    fill
                    className="slideImage"
                    unoptimized
                    priority
                    sizes="100vw"
                    quality={85}
                  />
                ) : (
                  <LazyBannerImage
                    src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + slide.image}
                    alt="Slide Image"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className={`${styles.customContainer} hero-content`}>
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="hero-text">
                  <h1>
                    {(home?.slider?.title).split("Indian Music")[0]}
                    <span style={{ color: "#FF7703" }}>
                      Indian Music
                      {(home?.slider?.title).split("Indian Music")[1]}
                    </span>
                  </h1>
                  <p>{home?.slider?.desc}</p>
                  <div className="d-flex flex-wrap align-items-center">
                    <Link href="/courses" className="btn-orange btn-hero btn">
                      Explore Courses
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* --- Sections Rendering --- */}

      <section id="about" className="about-section py-5">
        {home?.about?.isActive !== false && (
          <div className={styles.customContainer}>
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="about-img text-center">
                  {home?.about?.images?.[0] ? (
                    <div className="img-fluid rounded overflow-hidden mx-auto" style={{ width: "100%", maxWidth: "600px", height: "450px" }}>
                      <LazyBannerImage
                        src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + home.about.images[0]}
                        alt={home.about.title || "About"}
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="rounded bg-light d-flex align-items-center justify-content-center"
                      style={{ height: "400px" }}
                    >
                      <i className="fas fa-image fa-4x text-muted"></i>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="about-content">
                  <h2 className="mb-4 section-title1">{home?.about?.title}</h2>
                  {home?.about?.desc?.split("\n\n").map((para, i) => (
                    <p key={i}>{para.trim()}</p>
                  ))}
                  <Link href="/about" className="btn btn-orange mt-3">
                    Know more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {home?.teacher?.isActive !== false && <TeachersSection home={home} />}
      {home?.foundation?.isActive !== false && (
        <FoundationSection home={home} />
      )}
      {home?.course?.isActive !== false && <CoursesSection home={home} />}
      {home?.events?.isActive !== false && <EventsSection home={home} />}

      <section className="newsletter-overlap">
        {home?.journey?.isActive !== false && (
          <div className={styles.customContainer}>
            <div className="newsletter-box">
              <h2>{home?.journey?.title}</h2>
              <br />
              <p>{home?.journey?.desc}</p>
              <br />
              <div className="newsletter-form">
                <Link
                  href="/contact"
                  className="btn btn-dark"
                  style={{
                    alignSelf: "center",
                    backgroundColor: "#181D23",
                    color: "white",
                    padding: "15px 40px",
                  }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
