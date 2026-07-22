export const metadata = {
  title: 'Nexora Studio — premium websites for business',
  description:
    'Nexora Studio: сучасні сайти під ключ. UA / SK / EN. Лендинги, бізнес-сайти, інтернет-магазини.',
  keywords:
    'створення сайтів, веброзробник, landing page, webstránky, website development, Nexora Studio',
  robots: 'index, follow',
  openGraph: {
    title: 'Nexora Studio — premium websites for business',
    description: 'Modern websites that help attract new clients. UA · SK · EN.',
    url: 'https://nexoraads.online/',
    type: 'website',
    images: ['https://i.imgur.com/AUiHBKF.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <head>
        <link href="/Public/Image/apple-touch-icon-57x57.png" rel="icon" type="image/png" />
        <link href="/Public/Image/apple-touch-icon-57x57.png" rel="apple-touch-icon" sizes="57x57" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link rel="dns-prefetch" href="https://script.google.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap"
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
      </head>
      <body className="nx-premium">{children}</body>
    </html>
  );
}
