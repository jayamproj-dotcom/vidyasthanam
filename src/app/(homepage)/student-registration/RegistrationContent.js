"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/Banner";

export default function RegistrationContent({ initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
    message: "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration Data:", formData);
    
    if (window.Swal) {
      window.Swal.fire({
        icon: "success",
        title: "Registration submitted successfully!",
        text: "We will contact you shortly.",
        confirmButtonColor: "#67080E"
      });
    } else {
      alert("Registration submitted successfully! We will contact you shortly.");
    }
  };

  return (
    <div className="inner-page">
      <Banner />

      <section className="registration-container">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="registration-card">
                <div className="form-icon">
                  <i className="fas fa-user-graduate"></i>
                  <span className="form-title">Registration Form</span>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label fw-600">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dob" className="form-label fw-600">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        suppressHydrationWarning
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-600">Gender *</label>
                    <div className="d-flex gap-4">
                      {["Male", "Female", "Other"].map((option) => (
                        <div key={option} className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="gender"
                            id={option.toLowerCase()}
                            value={option}
                            checked={formData.gender === option}
                            onChange={handleChange}
                            required
                            suppressHydrationWarning
                          />
                          <label
                            className="form-check-label"
                            htmlFor={option.toLowerCase()}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="address" className="form-label fw-600">
                      Address *
                    </label>
                    <textarea
                      className="form-control"
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your complete address"
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label fw-600">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your 10-digit phone number"
                        suppressHydrationWarning
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label fw-600">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                        suppressHydrationWarning
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="form-label fw-600">
                      Additional Information
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="3"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Any additional information or questions"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    {/* ReCAPTCHA placeholder */}
                    <div className="p-3 bg-light border border-dashed text-center text-muted rounded">
                      ReCAPTCHA Verification
                    </div>
                  </div>

                  <button type="submit" className="btn btn-register" suppressHydrationWarning>
                    Submit Registration
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
