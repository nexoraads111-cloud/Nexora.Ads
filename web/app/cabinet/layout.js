export default function CabinetLayout({ children }) {
  return (
    <>
      <link href="/css/cabinet.css?v=8" rel="stylesheet" />
      {children}
      <script src="/js/nexora-config.js?v=8" defer suppressHydrationWarning />
      <script src="/js/cabinet.js?v=8" defer suppressHydrationWarning />
    </>
  );
}
