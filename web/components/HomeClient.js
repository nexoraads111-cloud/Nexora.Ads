'use client';

import Script from 'next/script';
import PremiumSite from '@/components/PremiumSite';

export default function HomeClient() {
  return (
    <>
      <PremiumSite />
      <Script src="/js/nexora-config.js?v=40" strategy="beforeInteractive" />
      <Script src="/js/portal-auth.js?v=40" strategy="afterInteractive" />
      <Script src="/js/nexora-boot.js?v=40" strategy="afterInteractive" />
    </>
  );
}
