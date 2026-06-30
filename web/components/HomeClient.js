'use client';

import Script from 'next/script';

export default function HomeClient({ html }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/js/nexora-config.js?v=12" strategy="afterInteractive" />
      <Script src="/js/script-01.js?v=12" type="module" strategy="afterInteractive" />
      <Script src="/js/main.js?v=12" strategy="afterInteractive" />
      <Script src="/js/module-03.js?v=10" strategy="afterInteractive" />
      <Script src="/js/module-04.js?v=10" strategy="afterInteractive" />
      <Script src="/js/module-05.js?v=10" strategy="afterInteractive" />
      <Script src="/js/module-06.js?v=10" strategy="afterInteractive" />
    </>
  );
}
