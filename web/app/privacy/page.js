export const metadata = {
  title: 'Політика конфіденційності',
  description: 'Політика конфіденційності NexoraAds — веб-студія.',
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <a href="/">← NexoraAds</a>
      <h1>Політика конфіденційності</h1>
      <p>
        NexoraAds обробляє дані з форм заявок і відгуків лише для відповіді на запит і покращення сервісу.
        Ми не продаємо персональні дані третім сторонам.
      </p>
      <h2>Які дані збираємо</h2>
      <ul>
        <li>Імʼя, контакт (email / Telegram / телефон), опис проєкту — якщо ви надсилаєте заявку.</li>
        <li>Текст відгуку та імʼя — якщо ви залишаєте відгук.</li>
      </ul>
      <h2>Контакти</h2>
      <p>
        Питання щодо даних: <a href="mailto:nexora.ads111@gmail.com">nexora.ads111@gmail.com</a>
      </p>
      <p>© {new Date().getFullYear()} NexoraAds</p>
    </main>
  );
}
