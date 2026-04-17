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
      return {
        title: res.data.metaTitle || "Contact Us | Vidyasthanam",
        description: res.data.metaDescription || "Get in touch with us.",
        keywords: res.data.metaKeywords || "Vidyasthanam contact, music school inquiry",
        openGraph: {
            title: res.data.metaTitle,
            description: res.data.metaDescription,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/contact`,
        }
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
