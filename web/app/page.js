import fs from 'fs';
import path from 'path';
import HomeClient from '@/components/HomeClient';

export default function HomePage() {
  const html = fs.readFileSync(path.join(process.cwd(), 'content/home-body.html'), 'utf8');
  return <HomeClient html={html} />;
}
