// NexoraWeb script extracted from index.html

const GITHUB_REPO = 'nexoraads111-cloud/Nexora.Ads';
const GITHUB_LABEL = 'approved';
const GITHUB_ISSUES_URL = `https://api.github.com/repos/${GITHUB_REPO}/issues?state=open&labels=${encodeURIComponent(GITHUB_LABEL)}&per_page=100`;

function parseReviewFromIssue(issue){
  const review = {
    id: issue.id,
    title: issue.title || 'Отзыв',
    name: issue.user?.login || 'Клиент',
    type: 'Создание сайта',
    rating: 5,
    text: '',
    createdAt: new Date(issue.created_at).getTime()
  };

  const lines = (issue.body || '').split(/\r?\n/);
  let mode = null;
  const textLines = [];

  for(const raw of lines){
    const line = raw.trim();
    if(!line) {
      if(mode === 'text') textLines.push('');
      continue;
    }
    if(/^Name:/i.test(line)){ review.name = line.replace(/^Name:\s*/i,'').trim(); mode = null; continue; }
    if(/^Type:/i.test(line)){ review.type = line.replace(/^Type:\s*/i,'').trim(); mode = null; continue; }
    if(/^Rating:/i.test(line)){ const val = parseInt(line.replace(/^Rating:\s*/i,'').trim(),10); if(!Number.isNaN(val)) review.rating = Math.max(1,Math.min(5,val)); mode = null; continue; }
    if(/^Text:/i.test(line)){ mode = 'text'; continue; }
    if(mode === 'text'){ textLines.push(raw); }
  }

  review.text = textLines.join('\n').trim() || issue.body?.trim() || review.title;
  return review;
}

async function loadReviewsFromGitHub(){
  try{
    const response = await fetch(GITHUB_ISSUES_URL, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if(!response.ok) throw new Error(`GitHub API ${response.status} ${response.statusText}`);
    const issues = await response.json();
    const reviews = issues.map(parseReviewFromIssue);
    reviews.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    window.renderReviews(reviews);
  }catch(err){
    console.error('Reviews load error', err);
    document.getElementById('reviews-container').innerHTML='<div class="empty">Отзывы временно не загрузились. Проверь соединение.</div>';
  }
}

loadReviewsFromGitHub();

