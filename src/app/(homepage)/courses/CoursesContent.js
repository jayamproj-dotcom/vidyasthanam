"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Banner from "@/components/Banner";
import api from "@/lib/api";

export default function CoursesContent({ initialData }) {
  const [courses, setCourses] = useState(() => {
    if (initialData?.courses) {
      return initialData.courses
        .filter(c => c.isActive !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return [];
  });
  
  const [activeCategory, setActiveCategory] = useState(() => {
    if (courses.length > 0) {
      return courses[0]._id || courses[0].name;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    // Fallback if no initialData
    if (!initialData) {
      const fetchCourses = async () => {
        try {
          const res = await api.get("/courses");
          if (res.success && res.data?.courses) {
            const active = res.data.courses
              .filter(c => c.isActive !== false)
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setCourses(active);
            if (active.length > 0) {
              setActiveCategory(active[0]._id || active[0].name);
            }
          }
        } catch (err) {
          console.error("Failed to fetch courses", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
    
    // Hide preloader when component mounts
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }, [initialData, courses.length]);

  const currentCourse = courses.find(c => (c._id === activeCategory || c.name === activeCategory));

  return (
    <div className="inner-page">
      <Banner />

      <section className="courses-section">
        <div className="container">
          <h2 className="section-title text-center">
            All Courses & Tutoring Assistance
          </h2>

          {!loading && courses.length > 0 ? (
            <div className="courses-wrapper">
              {/* Sidebar */}
              <div className="sidebar">
                <div className="category-sidebar">
                  {courses.map((cat) => (
                    <button
                      key={cat._id || cat.name}
                      className={`category-btn ${activeCategory === (cat._id || cat.name) ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat._id || cat.name)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="course-content flex-grow-1">
                {currentCourse && (
                  <div className="course-category active">
                    <div className="accordion">
                    <div className="accordion-item border-0 outline-none">
                      <h2 className="accordion-header">
                        <button className="accordion-button shadow-none d-block w-100 text-start">
                          {currentCourse.name}
                        </button>
                      </h2>
                      <div className="accordion-collapse collapse show">
                        <div className="accordion-body bg-white border">
                          <p className="card-text">
                            <strong>Course Number:</strong> {currentCourse.number}
                          </p>
                          <p className="card-text">
                            <strong>Fees:</strong> {currentCourse.fees}
                          </p>
                          
                          {currentCourse.desc && (
                            <div className="mb-4">
                              <p className="text-muted">{currentCourse.desc}</p>
                            </div>
                          )}

                          <ul className="course-features list-unstyled">
                            {currentCourse.points?.map((feature, idx) => (
                              <li key={idx} className="mb-2 d-flex">
                                <i className="fas fa-check-circle text-orange mt-1 me-2"></i>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          {currentCourse.paymentInfo?.length > 0 && (
                            <div className="payment-info mt-4">
                              {currentCourse.paymentInfo.map((info, idx) => (
                                <p
                                  key={idx}
                                  className="card-text mb-3"
                                  style={{
                                    wordBreak: "break-word",
                                    whiteSpace: "pre-line",
                                  }}
                                >
                                  {info}
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="mt-4">
                            <Link
                              href="/student-registration"
                              className="btn-register"
                            >
                              Register & Pay
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>
          ) : !loading && (
            <div className="text-center py-5">
               <p>No courses currently scheduled. Please check back later!</p>
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
