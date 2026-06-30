'use client';

import Script from 'next/script';

export default function HomeClient({ html }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/js/nexora-config.js?v=16" strategy="afterInteractive" />
      <Script src="/js/gas-api.js?v=16" strategy="afterInteractive" />
      <Script src="/js/script-01.js?v=16" type="module" strategy="afterInteractive" />
      <Script src="/js/main.js?v=16" strategy="afterInteractive" />
      <Script src="/js/module-03.js?v=16" strategy="afterInteractive" />
      <Script src="/js/module-04.js?v=16" strategy="afterInteractive" />
      <Script src="/js/module-05.js?v=16" strategy="afterInteractive" />
      <Script src="/js/module-06.js?v=16" strategy="afterInteractive" />
      <Script src="/js/module-i18n.js?v=16" strategy="afterInteractive" />
      <Script src="/js/site-data.js?v=16" strategy="afterInteractive" />
      <Script src="/js/module-admin-nav.js?v=16" strategy="afterInteractive" />
    </>
  );
}
