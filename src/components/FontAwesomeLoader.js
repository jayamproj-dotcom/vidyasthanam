"use client";

import { useEffect } from "react";

export default function FontAwesomeLoader() {
  useEffect(() => {
    const linkId = "font-awesome-cdn";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
      link.crossOrigin = "anonymous";
      link.referrerPolicy = "no-referrer";
      // Load asynchronously by starting with media="print"
      link.media = "print";
      link.onload = function () {
        this.media = "all";
      };
      document.head.appendChild(link);
    }
  }, []);

  return null;
}
