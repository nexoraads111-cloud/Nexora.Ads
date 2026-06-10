require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const simpleGit = require('simple-git');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const REVIEWS_FILE = path.join(__dirname, '..', 'reviews.json');
const PENDING_FILE = path.join(__dirname, 'pending.json');

function loadPending(){try{return JSON.parse(fs.readFileSync(PENDING_FILE));}catch(e){return []}}
function savePending(data){fs.writeFileSync(PENDING_FILE, JSON.stringify(data,null,2))}
function loadReviews(){try{return JSON.parse(fs.readFileSync(REVIEWS_FILE));}catch(e){return []}}
function saveReviews(data){fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data,null,2))}

const BOT_TOKEN = process.env.BOT_TOKEN; // required
if(!BOT_TOKEN){console.warn('BOT_TOKEN not set in .env — bot will not start polling')}

let bot;
if(BOT_TOKEN){
  bot = new TelegramBot(BOT_TOKEN, {polling: true});
  bot.on('message', msg =>{
    const raw = (msg.text||'').trim();
    let text = raw;
    const pending = loadPending();
    const fromName = `${msg.from.first_name||''} ${msg.from.last_name||''}`.trim();
    // support deep link: /start <payload>
    if(raw.startsWith('/start')){
      const payload = raw.slice(6).trim();
      try{
        const decoded = decodeURIComponent(payload);
        const obj = JSON.parse(decoded);
        text = obj.text || obj.message || '';
      }catch(e){
        // fallback to raw
      }
    }
    const entry = {
      id: Date.now(),
      fromId: msg.from.id,
      name: fromName || msg.from.username || 'Клиент',
      username: msg.from.username||'',
      text,
      createdAt: Date.now()
    };
    pending.unshift(entry);
    savePending(pending);
    bot.sendMessage(msg.chat.id, 'Спасибо! Ваш отзыв отправлен менеджеру и ожидает проверки.');
    console.log('New pending review saved', entry.id);
  });
}

app.get('/api/pending', (req,res)=>{res.json(loadPending())});

app.post('/api/approve', async (req,res)=>{
  try{
    const {id, title, rating, type} = req.body;
    let pending = loadPending();
    const idx = pending.findIndex(p=>p.id==id);
    if(idx===-1) return res.status(404).json({error:'not found'});
    const item = pending[idx];
    // create review
    const reviews = loadReviews();
    const newId = (reviews.reduce((a,b)=>Math.max(a,b.id||0),0)||0)+1;
    const review = {
      id: newId,
      name: item.name||'Клиент',
      title: title||'Отзыв',
      type: type||'Создание сайта',
      rating: Number(rating)||5,
      text: item.text||'',
      createdAt: Date.now()
    };
    reviews.push(review);
    saveReviews(reviews);
    // remove pending
    pending.splice(idx,1);
    savePending(pending);
    // git add/commit/push
    const git = simpleGit(path.join(__dirname,'..'));
    await git.add('reviews.json');
    await git.commit(`Add approved review ${review.id} from Telegram`);
    try{await git.push();}catch(e){console.warn('git push failed',e.message)}
    // notify user if possible
    if(bot && item.fromId){
      bot.sendMessage(item.fromId, 'Ваш отзыв опубликован. Спасибо!');
    }
    res.json({ok:true,review});
  }catch(e){console.error(e);res.status(500).json({error:e.message})}
});

app.post('/api/reject',(req,res)=>{
  try{
    const {id, reason} = req.body;
    let pending = loadPending();
    const idx = pending.findIndex(p=>p.id==id);
    if(idx===-1) return res.status(404).json({error:'not found'});
    const item = pending[idx];
    pending.splice(idx,1);
    savePending(pending);
    if(bot && item.fromId){
      const msg = reason?`Ваш отзыв отклонён: ${reason}`:'Ваш отзыв отклонён менеджером.';
      bot.sendMessage(item.fromId, msg);
    }
    res.json({ok:true});
  }catch(e){console.error(e);res.status(500).json({error:e.message})}
});

const PORT = process.env.PORT||3000;
app.listen(PORT,()=>console.log(`Telegram admin running on http://localhost:${PORT}`));
