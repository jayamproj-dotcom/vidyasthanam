"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/Banner";

export default function ContactContent({ initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    email_id: "",
    phone_no: "",
    subject: "",
    message: "",
  });

  const [contactInfo, setContactInfo] = useState(initialData || {
    title: "Contact Information",
    description: "Fill up the form and our team will get back to you within 24 hours.",
    phone1: "+91 90142 57637",
    phone1Note: "(Customer Service in Tamil or English only from 9 AM-8 PM IST)",
    phone2: "+91 99621 94779",
    phone2Note: "(WhatsApp only)",
    email: "info@vidyasthanam.com"
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // Modal or Alert could be added here
    alert("Thank you for your message! We will get back to you soon.");
  };

  return (
    <div className="inner-page">
      <Banner />

      <section className="contact-section">
        <div className="container">
          <div>
            <h1 className="section-title text-center">Get In Touch</h1>
          </div>

          <div className="row g-4">
            <div className="col-lg-5">
              <div>
                <h3 className="contact-title">{contactInfo.title}</h3>
                <p className="text-muted mb-4">{contactInfo.description}</p>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Phone</h5>
                    <div className="mb-0 text-muted">
                      <a href={`tel:${contactInfo.phone1?.replace(/\s/g, '')}`} className="d-block mb-2 text-decoration-none text-reset">
                        <span className="fw-bold fs-5 d-block">{contactInfo.phone1}</span>
                        <span className="small d-block">{contactInfo.phone1Note}</span>
                      </a>
                      <a href={`https://wa.me/${contactInfo.phone2?.replace(/[^0-9]/g, '')}`} target="_blank" className="d-block text-decoration-none text-reset">
                        <span className="fw-bold fs-5 d-block">{contactInfo.phone2}</span>
                        <span className="small d-block">{contactInfo.phone2Note}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h5 className="mb-1">Email</h5>
                    <p className="text-muted mb-0">{contactInfo.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="contact-card">
                <h3 className="contact-title mb-4">Send us a Message</h3>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">First Name</label>
                      <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required suppressHydrationWarning />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-control" name="email_id" value={formData.email_id} onChange={handleChange} required suppressHydrationWarning />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-control" name="phone_no" value={formData.phone_no} onChange={handleChange} suppressHydrationWarning />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Subject</label>
                      <input type="text" className="form-control" name="subject" value={formData.subject} onChange={handleChange} required suppressHydrationWarning />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Message</label>
                      <textarea className="form-control" name="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
                    </div>
                    <div className="col-12">
                      <div className="g-recaptcha-placeholder bg-light p-3 text-muted text-center border rounded">ReCAPTCHA Verification</div>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary btn-lg" suppressHydrationWarning>
                        <i className="fas fa-paper-plane me-2"></i>Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="map-section py-0">
        <div className="ratio ratio-21x9" style={{ minHeight: "450px" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497511.23106585274!2d79.8789962410795!3d13.047985943115949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x6e61a70b6863d433!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1756980625038!5m2!1sen!2sin"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
