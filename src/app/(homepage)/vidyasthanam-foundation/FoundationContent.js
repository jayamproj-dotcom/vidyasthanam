"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Banner from "@/components/Banner";

export default function FoundationContent({ initialData: data }) {
  useEffect(() => {
    // Hide preloader when component mounts
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }, []);

  if (!data) return null;

  return (
    <div className="inner-page">
      <Banner />

      {/* Mission Section */}
      <section className="mission-section foundation-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-center">
              <div className="foundation-logo-container">
                {data.logo && (
                  <Image
                    src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + data.logo}
                    alt="Foundation Logo"
                    className="img-fluid rounded foundation-logo"
                    width={300}
                    height={300}
                    priority
                  />
                )}
              </div>
              <h4 className="mt-4">{data.tamilTitle}</h4>
              <h4>{data.englishTitle}</h4>
            </div>

            <div className="col-lg-6">
              <h2 className="section-title1">Our Mission</h2>
              <div className="mission-content pt-3">
                {data.missionDescription?.split('\n\n').map((para, i) => (
                   <p key={i}>{para}</p>
                ))}
                
                {data.foundationEmail && (
                  <p className="mt-4">
                    Please send us an email to{" "}
                    <a href={`mailto:${data.foundationEmail}`} target="_blank" className="text-orange fw-bold">
                      {data.foundationEmail}
                    </a>{" "}
                    if you need assistance regarding performance of Hindu rituals.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Section */}
      <section className="foundation-section">
        <div className="container">
          <h2 className="section-title text-center">Our Initiatives</h2>
          <div className="row">
            {data.initiatives?.filter(i => i.isActive !== false).map((initiative, idx) => (
              <div key={idx} className="col-md-6 col-lg-4 mb-4">
                <div className="initiative-card">
                  <div className="initiative-img-container">
                    <Image
                      src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + (initiative.image || "/img/default-banner.jpg")}
                      className="initiative-img card-img-top"
                      alt={initiative.title}
                      width={400}
                      height={250}
                      unoptimized
                      style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                    />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{initiative.title}</h3>
                    <p className="card-text">{initiative.description}</p>
                    <Link href="/contact" className="btn btn-donate">
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="support-section foundation-section">
        <div className="container">
          <h2 className="section-title text-center">Support Our Mission</h2>
          <div className="row mt-5">
            {data.supportOptions?.filter(o => o.isActive !== false).map((option, idx) => (
              <div key={idx} className="col-md-4 mb-4">
                <div className="support-option">
                  <div className="support-icon">
                    <i className={option.icon}></i>
                  </div>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                  <Link href="/contact" className="btn-support">
                    {option.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .w-fit { width: fit-content; }
        .hover-shadow:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transform: translateY(-5px);
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .btn-outline-orange {
          border: 2px solid #ff7703;
          color: #ff7703;
          font-weight: bold;
          border-radius: 30px;
          padding: 8px 25px;
        }
        .btn-outline-orange:hover {
          background: #ff7703;
          color: white;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
