import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = ({ navData = [], coursesData = [] }) => {
  // Filter active navigation links for the "Quick Links" column
  // Explicitly hide Foundation and Registration pages as requested
  const activeLinks = navData.filter(item => 
    item.isActive !== false && 
    item.name !== "Vidyasthanam Foundation" && 
    item.name !== "Student's Registration" &&
    item.name !== "Student Registration"
  );
  
  // Filter and sort active courses for the "Our Courses" column
  const activeCourses = coursesData
    .filter(course => course.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 5); // Display top 5 courses

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          {/* Column 1: Logo and About */}
          <div className="col-lg-4 col-md-6 col-sm-12 footer-col">
            <Link
              href="/home"
              className="footer-logo d-flex align-items-center text-decoration-none"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logocanva1.png`}
                alt="Vidyasthanam Logo"
                id="logo"
                className="me-2"
                style={{ maxHeight: "100px" }}
                width={100}
                height={100}
              />
              <span className="navbar-brand2 mb-0">Vidyasthanam</span>
            </Link>

            <div className="footer-about">
              <p>
                School of Indian Music, Culture and Languages Promoting
                Traditional Knowledge.
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links (Dynamic) */}
          <div className="col-lg-2 col-md-4 col-sm-12 footer-col">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              {activeLinks.length > 0 ? (
                activeLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.path}>{link.name}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/home">Home</Link></li>
                  <li><Link href="/about">About us</Link></li>
                  <li><Link href="/courses">Courses</Link></li>
                  <li><Link href="/contact">Contact us</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 3: Our Courses (Dynamic) */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-col">
            <h3 className="footer-title">Our Courses</h3>
            <ul className="footer-links">
              {activeCourses.length > 0 ? (
                activeCourses.map((course, idx) => (
                  <li key={idx}>
                    <Link href="/courses">{course.name}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/courses">Carnatic Music Theory</Link></li>
                  <li><Link href="/courses">Conversational French</Link></li>
                  <li><Link href="/courses">Sanskrit</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Connect With Us */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-col">
            <h3 className="footer-title">Connect With Us</h3>

            <div className="contact-info">
              <p>
                <i className="fab fa-whatsapp me-2"></i>
                <a
                  href="https://wa.me/919962194779"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reach Us on WhatsApp
                </a>
              </p>

              <p>
                <i className="fas fa-envelope me-2"></i>
                <a
                  href="mailto:vidyasthanamindiacanada@yahoo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reach Us by Email
                </a>
              </p>
            </div>

            <div className="social-links mt-3">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>

              <a href="#" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Vidyasthanam. All rights reserved.
          </p>
          <p>
            <a
              href="https://jayamwebsolutions.com/contact.php"
              className="text-white text-decoration-none"
              target="_blank"
              rel="noopener noreferrer"
            >
              Developed by Jayam Web Solutions
            </a>
          </p>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/919962194779"
        className="whatsapp-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </footer>
  );
};

export default Footer;
