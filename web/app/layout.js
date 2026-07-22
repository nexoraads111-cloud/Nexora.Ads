export const metadata = {
  metadataBase: new URL('https://nexoraads.online'),
  title: {
    default: 'Nexora Studio — створення сайтів для бізнесу | UA SK EN',
    template: '%s | Nexora Studio',
  },
  description:
    'Nexora Studio: сучасні сайти під ключ — лендинги, бізнес-сайти, інтернет-магазини. Швидко, адаптивно, з SEO. Працюємо UA / SK / EN. Bratislava & online.',
  keywords: [
    'створення сайтів',
    'веброзробник',
    'landing page',
    'сайт для бізнесу',
    'інтернет-магазин',
    'webstránky na kľúč',
    'tvorba webov',
    'website development',
    'Nexora Studio',
    'Bratislava',
    'SEO',
    'Next.js',
  ],
  authors: [{ name: 'Nexora Studio', url: 'https://nexoraads.online' }],
  creator: 'Nexora Studio',
  publisher: 'Nexora Studio',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://nexoraads.online/',
    languages: {
      uk: 'https://nexoraads.online/',
      sk: 'https://nexoraads.online/',
      en: 'https://nexoraads.online/',
      'x-default': 'https://nexoraads.online/',
    },
  },
  openGraph: {
    title: 'Nexora Studio — сучасні сайти для бізнесу',
    description: 'Лендинги, бізнес-сайти та магазини під ключ. UA · SK · EN.',
    url: 'https://nexoraads.online/',
    siteName: 'Nexora Studio',
    locale: 'uk_UA',
    alternateLocale: ['sk_SK', 'en_US'],
    type: 'website',
    images: [
      {
        url: 'https://i.imgur.com/AUiHBKF.png',
        width: 1200,
        height: 630,
        alt: 'Nexora Studio — premium websites',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexora Studio — сучасні сайти для бізнесу',
    description: 'Лендинги, бізнес-сайти та магазини під ключ. UA · SK · EN.',
    images: ['https://i.imgur.com/AUiHBKF.png'],
  },
  verification: {
    other: {
      'google-site-verification': 'google56c6b547d4fd3ea7',
    },
  },
  category: 'technology',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://nexoraads.online/#organization',
      name: 'Nexora Studio',
      url: 'https://nexoraads.online/',
      logo: 'https://nexoraads.online/Public/Image/apple-touch-icon-57x57.png',
      email: 'nexora.ads111@gmail.com',
      telephone: ['+380995228560', '+380950761194'],
      sameAs: [],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bratislava',
        addressCountry: 'SK',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://nexoraads.online/#website',
      url: 'https://nexoraads.online/',
      name: 'Nexora Studio',
      publisher: { '@id': 'https://nexoraads.online/#organization' },
      inLanguage: ['uk', 'sk', 'en'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://nexoraads.online/#contact',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'ProfessionalService',
      '@id': 'https://nexoraads.online/#service',
      name: 'Nexora Studio Web Development',
      image: 'https://i.imgur.com/AUiHBKF.png',
      url: 'https://nexoraads.online/',
      telephone: '+380995228560',
      priceRange: '€€',
      areaServed: ['UA', 'SK', 'EU'],
      serviceType: ['Landing Page', 'Business Website', 'E-commerce', 'Website Redesign', 'SEO'],
      provider: { '@id': 'https://nexoraads.online/#organization' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <head>
        <link href="/Public/Image/apple-touch-icon-57x57.png" rel="icon" type="image/png" />
        <link href="/Public/Image/apple-touch-icon-57x57.png" rel="apple-touch-icon" sizes="57x57" />
        <link rel="canonical" href="https://nexoraads.online/" />
        <link rel="alternate" hrefLang="uk" href="https://nexoraads.online/" />
        <link rel="alternate" hrefLang="sk" href="https://nexoraads.online/" />
        <link rel="alternate" hrefLang="en" href="https://nexoraads.online/" />
        <link rel="alternate" hrefLang="x-default" href="https://nexoraads.online/" />
        <meta name="google-site-verification" content="google56c6b547d4fd3ea7" />
        <meta name="theme-color" content="#05060a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f5f7fb" media="(prefers-color-scheme: light)" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="geo.region" content="SK" />
        <meta name="geo.placename" content="Bratislava" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link rel="dns-prefetch" href="https://script.google.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Outfit:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
          media="print"
          id="nx-fa-css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "document.getElementById('nx-fa-css').media='all';",
          }}
        />
        <link href="/css/premium.css" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="nx-premium">{children}</body>
    </html>
  );
}
