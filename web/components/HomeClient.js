'use client';

import Script from 'next/script';
import PremiumSite from '@/components/PremiumSite';

export default function HomeClient() {
  return (
    <>
      <PremiumSite />
      <Script src="/js/nexora-config.js?v=42" strategy="beforeInteractive" />
      <Script src="/js/portal-auth.js?v=42" strategy="afterInteractive" />
      <Script src="/js/nexora-boot.js?v=42" strategy="afterInteractive" />
    </>
  );
}
