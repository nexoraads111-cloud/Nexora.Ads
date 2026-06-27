// NexoraWeb script extracted from index.html

const REVIEW_LIST_URL = 'reviews.json';

async function loadReviews(){
  try{
    const response = await fetch(REVIEW_LIST_URL, { cache: 'no-cache' });
    if(!response.ok) throw new Error(`Reviews ${response.status} ${response.statusText}`);
    const reviews = await response.json();
    reviews.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    window.renderReviews(reviews);
  }catch(err){
    console.error('Reviews load error', err);
    document.getElementById('reviews-container').innerHTML='<div class="empty">Отзывы временно не загрузились. Проверь соединение.</div>';
  }
}

loadReviews();

