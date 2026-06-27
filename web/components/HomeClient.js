'use client';

import Script from 'next/script';

export default function HomeClient({ html }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/js/nexora-config.js" strategy="afterInteractive" />
      <Script src="/js/script-01.js" type="module" strategy="afterInteractive" />
      <Script src="/js/main.js" strategy="afterInteractive" />
      <Script src="/js/module-03.js" strategy="afterInteractive" />
      <Script src="/js/module-04.js" strategy="afterInteractive" />
      <Script src="/js/module-05.js" strategy="afterInteractive" />
      <Script src="/js/module-06.js" strategy="afterInteractive" />
    </>
  );
}
