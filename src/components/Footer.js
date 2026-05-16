import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = ({ navData = [], coursesData = [], settingsData = null, contactData = null }) => {
  // Filter active navigation links for the "Quick Links" column
  // Explicitly hide Foundation and Registration pages as requested
  const activeLinks = navData.filter(item => 
    item.isActive !== false && 
    item.path !== "/" &&
    item.path !== "/home" &&
    item.path !== "/student-registration" &&
    item.path !== "/vidyasthanam-foundation"
  );
  
  // Filter and sort active courses for the "Our Courses" column
  const activeCourses = coursesData
    .filter(course => course.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 5); // Display top 5 courses

  const socialList = settingsData?.socialMedia || [];
  const whatsappObj = socialList.find(s => s.platform.toLowerCase() === "whatsapp");
  const whatsappLink = (whatsappObj?.isActive !== false && whatsappObj?.link?.trim()) 
    ? whatsappObj.link.trim() 
    : "https://wa.me/919962194779";

  const officialEmail = contactData?.email || "vidyasthanamindiacanada@yahoo.com";
  const activeSocialNetworks = socialList.filter(s => 
    s.isActive !== false && 
    s.link?.trim() && 
    s.platform.toLowerCase() !== "whatsapp"
  );

  const getPlatformIcon = (platform) => {
    const p = platform.toLowerCase();
    if (p.includes("facebook")) return "fab fa-facebook-f";
    if (p.includes("youtube")) return "fab fa-youtube";
    if (p.includes("whatsapp")) return "fab fa-whatsapp";
    if (p.includes("instagram")) return "fab fa-instagram";
    if (p.includes("twitter")) return "fab fa-twitter";
    if (p.includes("linkedin")) return "fab fa-linkedin-in";
    return "fas fa-link";
  };

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
                <>
                  <li><Link href="/home">Home</Link></li>
                  {activeLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link href={link.path}>{link.name}</Link>
                    </li>
                  ))}
                </>
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
              {(activeCourses.length > 0) && (
                activeCourses.map((course, idx) => (
                  <li key={idx}>
                    <Link href="/courses">{course.name}</Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Column 4: Connect With Us */}
          <div className="col-lg-3 col-md-6 col-sm-12 footer-col">
            <h3 className="footer-title">Connect With Us</h3>

            <div className="contact-info">
              {whatsappObj?.isActive !== false && (
                <p>
                  <i className="fab fa-whatsapp me-2"></i>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reach Us on WhatsApp
                  </a>
                </p>
              )}

              <p>
                <i className="fas fa-envelope me-2"></i>
                <a
                  href={`mailto:${officialEmail}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Reach Us by Email
                </a>
              </p>
            </div>

            <div className="social-links mt-3">
              {activeSocialNetworks.map((net) => (
                <a key={net.platform} href={net.link} target="_blank" rel="noopener noreferrer" title={net.platform}>
                  <i className={getPlatformIcon(net.platform)}></i>
                </a>
              ))}
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
      {whatsappObj?.isActive !== false && (
        <a
          href={whatsappLink}
          className="whatsapp-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fab fa-whatsapp"></i>
        </a>
      )}
    </footer>
  );
};

export default Footer;
