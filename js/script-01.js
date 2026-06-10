// NexoraWeb script extracted from index.html

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
  import { getFirestore, collection, query, where, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
  const firebaseConfig = { apiKey:"AIzaSyBWRUz2j9D7acq0BVW90JUArBksqDifS8I", authDomain:"nexorawebkook.firebaseapp.com", projectId:"nexorawebkook", storageBucket:"nexorawebkook.firebasestorage.app", messagingSenderId:"676424007745", appId:"1:676424007745:web:81cb88572abfc3604186c0", measurementId:"G-1EVBR5W1NC" };
  const app = initializeApp(firebaseConfig); const db = getFirestore(app);
  
  // Firebase: отправка отзыва
  window.addReviewToFirebase = async (data) => {
    try {
      const ref = await addDoc(collection(db, "reviews"), { ...data, createdAt: new Date().getTime() });
      console.log('Review added:', ref.id);
      return ref.id;
    } catch (e) {
      console.error('Error adding review:', e);
      throw e;
    }
  };
  
  // Firebase: загрузка одобренных отзывов
  const q = query(collection(db,"reviews"), where("approved", "==", true));
  onSnapshot(q, snap=>{ 
    const reviews=[]; 
    console.log('Reviews snapshot size', snap.size); 
    snap.forEach(d=>{ 
      const data = d.data(); 
      reviews.push({...data, id:d.id}); 
    }); 
    reviews.sort((a,b)=>(b.timestamp?.seconds||b.createdAt||0)-(a.timestamp?.seconds||a.createdAt||0)); 
    window.renderReviews(reviews); 
  }, err=>{ 
    console.error('Reviews load error', err); 
    document.getElementById('reviews-container').innerHTML='<div class="empty">Отзывы временно не загрузились. Проверь Firebase rules.</div>'; 
  });

