import Script from 'next/script';

export const metadata = {
  title: 'NexoraWeb — сайты для бизнеса под ключ',
  description:
    'NexoraWeb — современные сайты для бизнеса: landing page, бизнес-сайты и интернет-магазины. Быстро, адаптивно, заявки на почту и поддержка менеджера.',
  keywords:
    'создание сайтов, сайт под ключ, landing page, сайт для бизнеса, интернет магазин, NexoraWeb, веб студия',
  robots: 'index, follow',
  themeColor: '#070b14',
  openGraph: {
    title: 'NexoraWeb — сайты для бизнеса под ключ',
    description: 'Создаём современные сайты для бизнеса: красиво, быстро, адаптивно и с заявками.',
    url: 'https://nexoraads.online/',
    type: 'website',
    images: ['https://i.imgur.com/AUiHBKF.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link href="/Public/Image/apple-touch-icon-57x57.png" rel="icon" type="image/png" />
        <link href="/Public/Image/apple-touch-icon-57x57.png" rel="apple-touch-icon" sizes="57x57" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link href="/css/style.css" rel="stylesheet" />
        <link href="/css/mobile.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          type="module"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
