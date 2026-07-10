'use client';

import Script from 'next/script';

export default function HomeClient({ html }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/js/nexora-config.js?v=29" strategy="beforeInteractive" />
      <Script src="/js/portal-auth.js?v=29" strategy="afterInteractive" />
      <Script src="/js/nexora-boot.js?v=29" strategy="afterInteractive" />
    </>
  );
}
