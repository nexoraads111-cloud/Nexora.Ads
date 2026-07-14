export const metadata = {
  title: 'WebMaster — создание сайтов для бизнеса',
  description:
    'WebMaster: современные, быстрые и адаптивные сайты для бизнеса. Лендинги, корпоративные сайты и интернет-магазины под ключ.',
  keywords:
    'создание сайтов, веб-разработчик, landing page, сайт для бизнеса, интернет магазин, WebMaster',
  robots: 'index, follow',
  themeColor: '#000000',
  openGraph: {
    title: 'WebMaster — создание сайтов для бизнеса',
    description: 'Создаю современные сайты, которые привлекают клиентов и помогают бизнесу расти.',
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
        <link rel="dns-prefetch" href="https://script.google.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
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
        <link href="/css/nexora-v15.css" rel="stylesheet" />
      </head>
      <body className="nx-v15">
        {children}
      </body>
    </html>
  );
}
