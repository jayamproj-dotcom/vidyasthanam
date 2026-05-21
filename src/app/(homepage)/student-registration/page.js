import React from "react";
import api from "@/lib/api";
import RegistrationContent from "./RegistrationContent";
import Banner from "@/components/Banner";
import { getRegistrationData } from "@/lib/services/dataService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserClock } from "@fortawesome/free-solid-svg-icons";

/**
 * Server Component for the Student Registration Page
 * Handles data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getRegistrationData();
    if (res.success && res.data) {
      const { metaTitle, metaDescription, metaKeywords } = res.data;
      return {
        title: metaTitle || "Student Registration | Vidyasthanam",
        description: metaDescription || "Register for classes at Vidyasthanam.",
        keywords: metaKeywords || "Vidyasthanam registration, music school enrollment",
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          url: "/student-registration",
          images: ["/logocanva1.png"],
        },
        twitter: {
          card: "summary_large_image",
          title: metaTitle,
          description: metaDescription,
          images: ["/logocanva1.png"],
        },
      };
    }
  } catch (err) {
    console.error("Registration metadata generation error:", err);
  }
  return { title: "Student Registration | Vidyasthanam" };
}


export default async function StudentRegistrationPage() {
  let registrationData = {
    isActive: true
  };

  try {
    const res = await getRegistrationData();


    if (res.success && res.data) {
      registrationData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch registration data on server:", err);
  }

  // Page visibility check
  if (registrationData.isActive === false) {
    return (
      <div className="inner-page">
        <Banner />
        <div className="container py-5 text-center">
          <div className="py-5">
            <FontAwesomeIcon icon={faUserClock} size="4x" className="text-orange mb-4" />
            <h3>Registration Temporarily Closed</h3>
            <p className="text-muted">We are not accepting new registrations at this time. Please check back later!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="loader">
        <div className="three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
      <RegistrationContent initialData={registrationData} />
    </>
  );
}
