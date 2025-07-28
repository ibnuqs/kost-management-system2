// src/pages/Landing/utils/seo.ts

export const generatePageTitle = (section?: string): string => {
  const baseTitle = "Potuna Kos - Hunian Nyaman di Jagakarsa";
  return section ? `${section} | ${baseTitle}` : baseTitle;
};

export const generateMetaDescription = (section?: string): string => {
  const descriptions = {
    hero: "Kos nyaman dengan fasilitas lengkap di Jagakarsa. Lokasi strategis dekat UI, stasiun, dan pusat kota. Kamar AC, WiFi cepat, aman 24 jam.",
    rooms: "Pilihan kamar kos nyaman dari Standard hingga VIP. Fasilitas lengkap, harga terjangkau, lokasi strategis di Jagakarsa.",
    facilities: "Fasilitas lengkap Potuna Kos: AC, WiFi 100Mbps, dapur bersama, laundry, parkir gratis, keamanan 24 jam. Lingkungan aman dan nyaman.",
    location: "Lokasi strategis di Jagakarsa, Jakarta Selatan. Dekat UI, stasiun kereta, dan akses mudah ke pusat kota.",
    contact: "Hubungi Potuna Kos untuk informasi dan booking kamar. WhatsApp, telepon, atau kunjungi langsung lokasi kami."
  };
  
  return descriptions[section as keyof typeof descriptions] || descriptions.hero;
};

export const generateKeywords = (): string[] => {
  return [
    "kos jagakarsa",
    "kos jakarta selatan",
    "potuna kos",
    "kos dekat UI",
    "kos dekat kampus",
    "kos aman",
    "kos nyaman",
    "kos fasilitas lengkap",
    "kos AC wifi",
    "kos murah jakarta",
    "hunian mahasiswa",
    "boarding house",
    "kos eksklusif",
    "kos premium"
  ];
};

export const generateStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": "Potuna Kos",
    "description": "Kos nyaman untuk mahasiswa dengan fasilitas lengkap di Jagakarsa",
    "url": window.location.origin,
    "telephone": "+62-21-12345678",
    "email": "info@potunakos.com",
    "address": {
      "@type": "PostalAddress", 
      "streetAddress": "Jl. Raya Jagakarsa No. 123",
      "addressLocality": "Jagakarsa, Jakarta Selatan",
      "addressRegion": "DKI Jakarta",
      "postalCode": "12620",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-6.2297",
      "longitude": "106.7920"
    },
    "priceRange": "Rp 1.000.000 - Rp 1.500.000",
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.8",
      "bestRating": "5"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Air Conditioning",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Private Bathroom",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Security",
        "value": true
      }
    ],
    "openingHours": [
      "Mo-Fr 08:00-20:00",
      "Sa-Su 09:00-17:00"
    ]
  };
};

export const generateBreadcrumbData = (currentPage: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": currentPage,
        "item": window.location.href
      }
    ]
  };
};

export const generateFAQData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Berapa harga sewa kamar per bulan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Harga sewa mulai dari Rp 1.000.000 untuk kamar Standard dan Rp 1.500.000 untuk kamar Premium per bulan."
        }
      },
      {
        "@type": "Question",
        "name": "Apakah ada deposit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ya, deposit sama dengan 1 bulan sewa. Rp 1.000.000 untuk Standard dan Rp 1.500.000 untuk Premium."
        }
      },
      {
        "@type": "Question",
        "name": "Fasilitas apa saja yang tersedia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Setiap kamar dilengkapi AC, WiFi unlimited, kamar mandi dalam, kasur, lemari, dan meja belajar. Fasilitas bersama meliputi dapur, ruang santai, laundry, dan keamanan 24 jam."
        }
      },
      {
        "@type": "Question",
        "name": "Apakah aman untuk putri?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ya, kos ini khusus untuk putri dengan sistem keamanan 24 jam, CCTV, dan akses card. Lingkungan sangat aman dan nyaman."
        }
      }
    ]
  };
};

export const injectStructuredData = (data: object) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
  
  return () => {
    document.head.removeChild(script);
  };
};

export const updateMetaTags = (title: string, description: string, keywords?: string[]) => {
  // Update title
  document.title = title;
  
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);
  
  // Update meta keywords
  if (keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords.join(', '));
  }
  
  // Update Open Graph tags
  updateOpenGraphTags(title, description);
};

export const updateOpenGraphTags = (title: string, description: string, image?: string) => {
  const ogTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: window.location.href },
    { property: 'og:site_name', content: 'Potuna Kos' }
  ];
  
  if (image) {
    ogTags.push({ property: 'og:image', content: image });
  }
  
  ogTags.forEach(tag => {
    let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', tag.property);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', tag.content);
  });
};