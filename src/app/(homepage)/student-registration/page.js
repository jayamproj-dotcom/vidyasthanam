import React from "react";
import api from "@/lib/api";
import RegistrationContent from "./RegistrationContent";
import Banner from "@/components/Banner";
import { getRegistrationData } from "@/lib/services/dataService";

/**
 * Server Component for the Student Registration Page
 * Handles data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getRegistrationData();
    if (res.success && res.data) {
      return {
        title: res.data.metaTitle || "Student Registration | Vidyasthanam",
        description: res.data.metaDescription || "Register for classes at Vidyasthanam.",
        keywords: res.data.metaKeywords || "Vidyasthanam registration, music school enrollment",
        openGraph: {
          title: res.data.metaTitle,
          description: res.data.metaDescription,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/student-registration`,
        }
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
            <i className="fas fa-user-clock fa-4x text-orange mb-4"></i>
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
