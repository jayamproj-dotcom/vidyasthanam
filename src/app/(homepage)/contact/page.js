import React from "react";
import api from "@/lib/api";
import ContactContent from "./ContactContent";
import { getContactData } from "@/lib/services/dataService";

/**
 * Server Component for the Contact Page
 * Handles data fetching with ISR and dynamic metadata.
 */

export async function generateMetadata() {
  try {
    const res = await getContactData();
    if (res.success && res.data) {
      const { metaTitle, metaDescription, metaKeywords } = res.data;
      return {
        title: metaTitle || "Contact Us | Vidyasthanam",
        description: metaDescription || "Get in touch with us.",
        keywords: metaKeywords || "Vidyasthanam contact, music school inquiry",
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          url: "/contact",
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
    console.error("Contact metadata generation error:", err);
  }
  return { title: "Contact Us | Vidyasthanam" };
}


export default async function ContactPage() {
  let contactData = null;

  try {
    const res = await getContactData();


    if (res.success && res.data) {
      contactData = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch contact data on server:", err);
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
      <ContactContent initialData={contactData} />
    </>
  );
}
