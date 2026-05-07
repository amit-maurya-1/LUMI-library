pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/* ══════════════════════════════
   STARFIELD
══════════════════════════════ */
(function() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars=[], W, H, shooters=[];
  function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  function mkStars(){
    stars=[];
    for(let i=0;i<200;i++){
      const op=Math.random()*.8+.1;
      stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+.2,op,base:op,spd:Math.random()*.018+.004,dir:Math.random()>.5?1:-1});
    }
  }
  function shoot(){ shooters.push({x:Math.random()*W,y:0,vx:3+Math.random()*4,vy:2+Math.random()*2,len:70+Math.random()*60,life:1}); }
  function draw(){
    ctx.clearRect(0,0,W,H);
    stars.forEach(s=>{
      s.op+=s.spd*s.dir;
      if(s.op>1){s.op=1;s.dir=-1;} if(s.op<.04){s.op=.04;s.dir=1;}
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.op})`;ctx.fill();
    });
    if(Math.random()<.003) shoot();
    shooters=shooters.filter(s=>s.life>0);
    shooters.forEach(s=>{
      const g=ctx.createLinearGradient(s.x,s.y,s.x-s.vx*s.len/5,s.y-s.vy*s.len/5);
      g.addColorStop(0,`rgba(240,200,100,${s.life})`);g.addColorStop(1,'rgba(240,200,100,0)');
      ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.vx*s.len/5,s.y-s.vy*s.len/5);
      ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.stroke();
      s.x+=s.vx;s.y+=s.vy;s.life-=.028;
    });
    requestAnimationFrame(draw);
  }
  resize();mkStars();window.addEventListener('resize',()=>{resize();mkStars();});draw();
})();


function apply3DTilt(card){
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(600px) rotateY(${x*16}deg) rotateX(${-y*16}deg) translateZ(6px)`;
    card.style.transition='transform .05s';
  });
  card.addEventListener('mouseleave',()=>{
    card.style.transform='perspective(600px) rotateY(0) rotateX(0) translateZ(0)';
    card.style.transition='transform .5s ease';
  });
}


const SK='lumi_lib_v2';
const getStore=()=>{try{return JSON.parse(localStorage.getItem(SK))||{};}catch{return{};}};
const setStore=s=>localStorage.setItem(SK,JSON.stringify(s));
const getBooks=()=>getStore().books||[];
const setBooks=b=>{const s=getStore();s.books=b;setStore(s);};
const getBookmarks=()=>getStore().bookmarks||[];
const setBookmarks=b=>{const s=getStore();s.bookmarks=b;setStore(s);};
const getNotes=()=>getStore().notes||[];
const setNotes=n=>{const s=getStore();s.notes=n;setStore(s);};


const $=id=>document.getElementById(id);
const homeScreen=$('homeScreen'),loadingScreen=$('loadingScreen'),readerScreen=$('readerScreen'),profileScreen=$('profileScreen');
const bookmarksScreen=$('bookmarksScreen'),notesScreen=$('notesScreen');
const bookGrid=$('bookGrid'),uploadCard=$('uploadCard'),fileInput=$('fileInput');
const clearHistBtn=$('clearHistBtn'),navHome=$('navHome'),navProfile=$('navProfile');
const navBookmarks=$('navBookmarks'),navNotes=$('navNotes');
const profileNavBtn=$('profileNavBtn'),bottomNav=$('bottomNav');
const readerBackBtn=$('readerBackBtn'),readerBookName=$('readerBookName');
const playBtn=$('playBtn'),rewindBtn=$('rewindBtn'),forwardBtn=$('forwardBtn');
const speedBtn=$('speedBtn'),voiceBtn=$('voiceBtn');
const prevPageBtn=$('prevPageBtn'),nextPageBtn=$('nextPageBtn');
const prevPage2Btn=$('prevPage2Btn'),nextPage2Btn=$('nextPage2Btn'),pageBtn=$('pageBtn');
const textPanel=$('textPanel'),pdfCanvas=$('pdfCanvas'),progressFill=$('progressFill');
const voiceOverlay=$('voiceOverlay'),voiceListEl=$('voiceListEl');
const jumpOverlay=$('jumpOverlay'),jumpInput=$('jumpInput'),jumpCancel=$('jumpCancel'),jumpGo=$('jumpGo');
const resumeOverlay=$('resumeOverlay'),resumeText=$('resumeText'),resumeYes=$('resumeYes'),resumeNo=$('resumeNo');
const fontSlider=$('fontSlider'),fontSizeLabel=$('fontSizeLabel');
const autoCT=$('autoContinueToggle'),rememberPT=$('rememberPosToggle'),defSpdVal=$('defaultSpeedVal');
const historyList=$('historyList'),toast=$('toast'),searchInput=$('searchInput');
const bookDetailOverlay=$('bookDetailOverlay'),bookDetailContent=$('bookDetailContent');
const bmList=$('bmList'),bmCount=$('bmCount'),notesList=$('notesList'),notesCount=$('notesCount');
const addBmBtn=$('addBmBtn'),addNoteBtn=$('addNoteBtn');
const bmSaveOverlay=$('bmSaveOverlay'),bmLabelInput=$('bmLabelInput');
const bmSaveCancel=$('bmSaveCancel'),bmSaveGo=$('bmSaveGo');
const noteSaveOverlay=$('noteSaveOverlay'),noteInputArea=$('noteInputArea');
const noteSaveCancel=$('noteSaveCancel'),noteSaveGo=$('noteSaveGo');

   
let pdfDoc=null,totalPages=0,currentPage=1;
let allWords=[],currentWordIdx=0;
let isPlaying=false,isPaused=false;
let speechSpeed=1.0,currentVoice='';
let fontSize=19,autoContinue=true,rememberPos=true;
let listenSeconds=0,listenTimer=null,shouldStop=false;
let currentFileObj=null,currentFilter='all',currentScreen='home';

const SPEEDS=[.5,.75,1,1.25,1.5,1.75,2,2.5,3];
const EMOJIS=['📚','📖','📕','📗','📘','📙','📜','🗒️','📓','🔖'];
const COVS=['linear-gradient(135deg,#7c3aed,#3b82f6)','linear-gradient(135deg,#f0a020,#e05a10)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f43f5e,#7c3aed)','linear-gradient(135deg,#f0a020,#7c3aed)','linear-gradient(135deg,#3b82f6,#10b981)','linear-gradient(135deg,#f43f5e,#f0a020)','linear-gradient(135deg,#7c3aed,#10b981)'];
function fmtSpd(s){return s.toFixed(s%1===0?1:1)+'×';}
function hashN(n){let h=0;for(let c of n)h=(h*31+c.charCodeAt(0))%1000;return h;}
function getEmoji(n){return EMOJIS[hashN(n)%EMOJIS.length];}
function getCov(n){return COVS[hashN(n)%COVS.length];}
function timeAgo(ts){
  const d=Date.now()-ts,m=Math.floor(d/60000);
  if(m<1)return'Just now';if(m<60)return m+'m ago';
  const h=Math.floor(m/60);if(h<24)return h+'h ago';
  return Math.floor(h/24)+'d ago';
}

const allScreens=[homeScreen,loadingScreen,readerScreen,profileScreen,bookmarksScreen,notesScreen];
function showScreen(name){
  allScreens.forEach(s=>s.classList.add('hidden'));
  const map={home:homeScreen,loading:loadingScreen,reader:readerScreen,profile:profileScreen,bookmarks:bookmarksScreen,notes:notesScreen};
  if(map[name])map[name].classList.remove('hidden');
  currentScreen=name;
  bottomNav.style.display=name==='reader'?'none':'flex';
  navHome.classList.toggle('active',name==='home');
  navBookmarks.classList.toggle('active',name==='bookmarks');
  navNotes.classList.toggle('active',name==='notes');
  navProfile.classList.toggle('active',name==='profile');
}


let tTimer;
function showToast(msg){
  toast.textContent=msg;toast.classList.add('show');
  clearTimeout(tTimer);tTimer=setTimeout(()=>toast.classList.remove('show'),2600);
}


function portalOpen(x,y,cb){
  const r=$('portalRipple');
  const sz=Math.max(window.innerWidth,window.innerHeight)*2.6;
  r.style.cssText=`left:${x}px;top:${y}px;width:0;height:0;opacity:1`;
  requestAnimationFrame(()=>{
    r.style.width=sz+'px';r.style.height=sz+'px';r.style.opacity='0';
    setTimeout(()=>{r.style.width='0';r.style.height='0';},700);
    setTimeout(cb,320);
  });
}


function renderBooks(filter='all',query=''){
  currentFilter=filter;
  let books=getBooks();
  if(filter!=='all') books=books.filter(b=>{
    if(filter==='reading')return b.progress>0&&b.progress<100;
    if(filter==='toread')return!b.progress||b.progress===0;
    if(filter==='finished')return b.progress>=100;
    if(filter==='fav')return b.favourite;
    return true;
  });
  if(query.trim())books=books.filter(b=>b.name.toLowerCase().includes(query.toLowerCase()));
  if(!books.length){
    const allB=getBooks();
    bookGrid.innerHTML=`<div class="empty-lib"><span class="empty-lib-icon">${allB.length?'🔍':'🌌'}</span>${allB.length?'No books match your search.':'Your library is empty.<br>Upload a PDF to begin<br>your cosmic journey.'}</div>`;
    return;
  }
  bookGrid.innerHTML='';
  books.forEach(book=>{
    const card=document.createElement('div');
    card.className='book-card';
    const pct=book.progress||0;
    card.innerHTML=`${book.favourite?'<div class="fav-tag">♡</div>':''}<div class="book-cover" style="background:${getCov(book.name)}">${getEmoji(book.name)}</div><div class="book-card-title">${book.name.replace(/\.pdf$/i,'')}</div><div class="book-card-pages">📄 ${book.totalPages||'?'} pages</div><div class="bpbar"><div class="bpfill" style="width:${pct}%"></div></div><div class="bppct">${pct}% complete</div>`;
    card.addEventListener('click',e=>{const rc=card.getBoundingClientRect();showBookDetail(book,rc.left+rc.width/2,rc.top+rc.height/2);});
    apply3DTilt(card);
    bookGrid.appendChild(card);
  });
}


function showBookDetail(book,cx,cy){
  const pct=book.progress||0;const r=50,circ=2*Math.PI*r;const dash=circ*pct/100;
  bookDetailContent.innerHTML=`<div class="detail-cover" style="background:${getCov(book.name)}">${getEmoji(book.name)}</div><div class="detail-title">${book.name.replace(/\.pdf$/i,'')}</div><div class="detail-sub">📄 ${book.totalPages||'?'} pages · Last read ${book.lastRead?timeAgo(book.lastRead):'Never'}</div><div class="detail-progress-ring"><div class="progress-circle"><svg width="110" height="110"><circle cx="55" cy="55" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/><circle cx="55" cy="55" r="${r}" fill="none" stroke="url(#pg)" stroke-width="8" stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ*.25}" stroke-linecap="round"/><defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f0a020"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient></defs></svg><div class="pct-text">${pct}%</div></div></div><div class="detail-actions"><button class="detail-btn detail-btn-primary" id="detailOpenBtn">✦ Open in Reader</button><button class="detail-btn detail-btn-secondary" id="detailFavBtn">${book.favourite?'♡ Remove Favourite':'♡ Add to Favourites'}</button><button class="detail-btn detail-btn-secondary" id="detailDeleteBtn">🗑 Delete Book</button></div>`;
  bookDetailOverlay.classList.add('show');
  $('detailOpenBtn').onclick=()=>{bookDetailOverlay.classList.remove('show');portalOpen(cx,cy,()=>{showToast('Re-upload this PDF to open ✦');uploadCard.click();});};
  $('detailFavBtn').onclick=()=>{const books=getBooks();const idx=books.findIndex(b=>b.name===book.name);if(idx>=0){books[idx].favourite=!books[idx].favourite;setBooks(books);}bookDetailOverlay.classList.remove('show');renderBooks(currentFilter,searchInput.value);showToast(books[idx]?.favourite?'Added to favourites ♡':'Removed from favourites');};
  $('detailDeleteBtn').onclick=()=>{const books=getBooks().filter(b=>b.name!==book.name);setBooks(books);bookDetailOverlay.classList.remove('show');renderBooks(currentFilter,searchInput.value);updateStats();showToast('Book removed ✦');};
}
bookDetailOverlay.addEventListener('click',e=>{if(e.target===bookDetailOverlay)bookDetailOverlay.classList.remove('show');});


function updateStats(){
  const books=getBooks();const s=getStore();
  const tBooks=books.length,tPages=books.reduce((a,b)=>a+(b.pagesRead||0),0);
  const tSec=s.listenSeconds||0;const timeStr=tSec>=3600?Math.floor(tSec/3600)+'h':Math.floor(tSec/60)+'m';
  const streak=s.streak||0;
  $('statBooks').textContent=tBooks;$('statPages').textContent=tPages;$('statHours').textContent=timeStr;$('statStreak').textContent=streak;
  $('pStatBooks').textContent=tBooks;$('pStatPages').textContent=tPages;$('pStatHours').textContent=timeStr;$('pStatStreak').textContent=streak;
}


function renderHistory(){
  const books=getBooks().filter(b=>b.lastRead).sort((a,b)=>(b.lastRead||0)-(a.lastRead||0));
  if(!books.length){historyList.innerHTML='<div style="color:var(--text3);font-size:13px;text-align:center;padding:24px">No history yet ✦</div>';return;}
  historyList.innerHTML='';
  books.slice(0,12).forEach(book=>{
    const item=document.createElement('div');item.className='history-item';
    item.innerHTML=`<div class="hist-emoji">${getEmoji(book.name)}</div><div class="hist-info"><div class="hist-title">${book.name.replace(/\.pdf$/i,'')}</div><div class="hist-meta">Page ${book.currentPage||1} of ${book.totalPages||'?'} · ${timeAgo(book.lastRead)}</div></div><div style="font-size:12px;color:var(--gold)">${book.progress||0}%</div>`;
    historyList.appendChild(item);
  });
}



function renderBookmarks(){
  const bms=getBookmarks().sort((a,b)=>b.ts-a.ts);
  bmCount.textContent=bms.length+' saved';
  if(!bms.length){bmList.innerHTML='<div class="bm-empty"><span class="bm-empty-icon">🔖</span>No bookmarks yet.<br>Tap 🔖 while reading to save a spot.</div>';return;}
  bmList.innerHTML='';
  bms.forEach((bm,i)=>{
    const item=document.createElement('div');item.className='bm-item';
    item.innerHTML=`<div class="bm-emoji">🔖</div><div class="bm-body"><div class="bm-book">${bm.bookName.replace(/\.pdf$/i,'')}</div><div class="bm-label">${bm.label||'Untitled bookmark'}</div><div class="bm-meta">Page ${bm.page} · Word ${bm.wordIdx||0} · ${timeAgo(bm.ts)}</div></div><button class="bm-del" data-i="${i}">✕</button>`;
    item.querySelector('.bm-del').addEventListener('click',e=>{e.stopPropagation();const all=getBookmarks();all.splice(i,1);setBookmarks(all);renderBookmarks();showToast('Bookmark removed');});
    bmList.appendChild(item);
  });
}

function saveBookmark(label){
  if(!currentFileObj)return;
  const bm={bookName:currentFileObj.name,page:currentPage,wordIdx:currentWordIdx,label:label||'Page '+currentPage,ts:Date.now()};
  const bms=getBookmarks();bms.unshift(bm);setBookmarks(bms);
  showToast('Bookmark saved 🔖');
}


function renderNotes(){
  const ns=getNotes().sort((a,b)=>b.ts-a.ts);
  notesCount.textContent=ns.length+' notes';
  if(!ns.length){notesList.innerHTML='<div class="bm-empty"><span class="bm-empty-icon">📝</span>No notes yet.<br>Tap ✏️ while reading to capture a thought.</div>';return;}
  notesList.innerHTML='';
  ns.forEach((n,i)=>{
    const item=document.createElement('div');item.className='note-item';
    item.innerHTML=`<div class="note-header"><div class="note-book">${n.bookName.replace(/\.pdf$/i,'')}</div><button class="note-del" data-i="${i}">✕</button></div><div class="note-text">"${n.text}"</div><div class="note-meta">Page ${n.page} · ${timeAgo(n.ts)}</div>`;
    item.querySelector('.note-del').addEventListener('click',e=>{e.stopPropagation();const all=getNotes();all.splice(i,1);setNotes(all);renderNotes();showToast('Note removed');});
    notesList.appendChild(item);
  });
}

function saveNote(text){
  if(!currentFileObj||!text.trim())return;
  const n={bookName:currentFileObj.name,page:currentPage,wordIdx:currentWordIdx,text:text.trim(),ts:Date.now()};
  const ns=getNotes();ns.unshift(n);setNotes(ns);
  showToast('Note saved ✏️');
}


function saveProgress(){
  if(!currentFileObj)return;
  const books=getBooks();const idx=books.findIndex(b=>b.name===currentFileObj.name);
  const pct=totalPages>0?Math.round((currentPage/totalPages)*100):0;
  const bd={name:currentFileObj.name,totalPages,currentPage,progress:pct,pagesRead:currentPage,lastRead:Date.now(),favourite:books[idx]?.favourite||false};
  if(idx>=0)books[idx]={...books[idx],...bd};else books.unshift(bd);
  setBooks(books);
  const s=getStore();s.listenSeconds=(s.listenSeconds||0)+listenSeconds;listenSeconds=0;setStore(s);
  const today=new Date().toDateString();
  if(s.lastReadDay!==today){const s2=getStore();s2.lastReadDay=today;s2.streak=(s.streak||0)+1;setStore(s2);}
}


function loadPrefs(){
  const s=getStore();
  if(s.fontSize){fontSize=s.fontSize;fontSlider.value=fontSize;fontSizeLabel.textContent=fontSize+'px';}
  if(s.speed){speechSpeed=s.speed;speedBtn.textContent=fmtSpd(speechSpeed);defSpdVal.textContent=fmtSpd(speechSpeed);}
  if(s.autoContinue!==undefined){autoContinue=s.autoContinue;autoCT.classList.toggle('on',autoContinue);}
  if(s.rememberPos!==undefined){rememberPos=s.rememberPos;rememberPT.classList.toggle('on',rememberPos);}
  if(s.voice)currentVoice=s.voice;
  applyFontSize();
}


async function loadPage(pageNum,keepPlaying=false){
  if(!pdfDoc||pageNum<1||pageNum>totalPages)return;
  if(keepPlaying)stopSpeech();
  currentPage=pageNum;
  const page=await pdfDoc.getPage(pageNum);
  const vp=page.getViewport({scale:1.5});
  const ctx=pdfCanvas.getContext('2d');
  pdfCanvas.width=vp.width;pdfCanvas.height=vp.height;
  await page.render({canvasContext:ctx,viewport:vp}).promise;
  $('pdfBadge').textContent=`Page ${pageNum} of ${totalPages}`;
  const content=await page.getTextContent();
  const raw=content.items.map(i=>i.str).join(' ');
  textPanel.innerHTML='';
  allWords=raw.trim().split(/\s+/).filter(w=>w.length>0);
  currentWordIdx=0;
  allWords.forEach((w,i)=>{
    const span=document.createElement('span');
    span.className='word';span.textContent=w+' ';span.dataset.idx=i;
    span.addEventListener('click',()=>{stopSpeech();beginSpeech(i);});
    textPanel.appendChild(span);
  });
  if(!allWords.length)textPanel.innerHTML='<div class="no-text">✦ No extractable text on this page</div>';
  pageBtn.textContent=`Page ${currentPage} / ${totalPages}`;
  [prevPageBtn,prevPage2Btn].forEach(b=>b.disabled=currentPage<=1);
  [nextPageBtn,nextPage2Btn].forEach(b=>b.disabled=currentPage>=totalPages);
  progressFill.style.width=(currentPage/totalPages*100)+'%';
  applyFontSize();
  if(keepPlaying&&allWords.length)beginSpeech(0);
}

function highlightWord(idx){
  document.querySelectorAll('.word.highlight').forEach(e=>e.classList.remove('highlight'));
  const ws=textPanel.querySelectorAll('.word');
  if(ws[idx]){ws[idx].classList.add('highlight');ws[idx].scrollIntoView({behavior:'smooth',block:'center'});}
}


async function getVoices(){return new Promise(res=>{const v=window.speechSynthesis.getVoices();if(v.length){res(v);return;}window.speechSynthesis.onvoiceschanged=()=>res(window.speechSynthesis.getVoices());});}
async function initVoice(){const v=await getVoices();if(!currentVoice&&v.length){const en=v.find(x=>x.lang.startsWith('en'));currentVoice=en?en.name:v[0].name;}}


function stopSpeech(){
  shouldStop=true;isPlaying=false;isPaused=false;
  window.speechSynthesis.cancel();playBtn.textContent='▶';stopListenTimer();
  setTimeout(()=>{shouldStop=false;},60);
}
function beginSpeech(startIdx){
  shouldStop=false;isPlaying=true;isPaused=false;playBtn.textContent='⏸';startListenTimer();
  const CHUNK=150;const chunks=[];
  for(let i=0;i<allWords.length;i+=CHUNK)chunks.push({text:allWords.slice(i,i+CHUNK).join(' '),wo:i});
  let sc=chunks.findIndex(c=>c.wo+CHUNK>startIdx);if(sc<0)sc=0;let ci=sc;
  function next(){
    if(shouldStop||!isPlaying)return;
    if(ci>=chunks.length){isPlaying=false;playBtn.textContent='▶';stopListenTimer();if(autoContinue&&currentPage<totalPages){saveProgress();loadPage(currentPage+1,true);}return;}
    const chunk=chunks[ci];
    const utter=new SpeechSynthesisUtterance(ci===sc?allWords.slice(startIdx,chunk.wo+CHUNK).join(' '):chunk.text);
    utter.rate=speechSpeed;
    const wOff=ci===sc?startIdx:chunk.wo;
    const voices=window.speechSynthesis.getVoices();const v=voices.find(x=>x.name===currentVoice);if(v)utter.voice=v;
    utter.onboundary=e=>{
      if(e.name!=='word')return;
      const before=utter.text.substring(0,e.charIndex);
      const wc=before.split(/\s+/).filter(w=>w.length).length;
      currentWordIdx=wOff+wc;highlightWord(currentWordIdx);
    };
    utter.onend=()=>{if(!shouldStop){ci++;setTimeout(next,30);}};
    utter.onerror=()=>{if(!shouldStop){ci++;setTimeout(next,50);}};
    window.speechSynthesis.cancel();window.speechSynthesis.speak(utter);
    const ka=setInterval(()=>{if(shouldStop||!isPlaying){clearInterval(ka);return;}if(window.speechSynthesis.speaking&&!window.speechSynthesis.paused){window.speechSynthesis.pause();window.speechSynthesis.resume();}else{clearInterval(ka);}},10000);
  }
  next();
}
function pauseSpeech(){if(!isPlaying)return;isPlaying=false;isPaused=true;window.speechSynthesis.pause();playBtn.textContent='▶';stopListenTimer();}
function resumeSpeech(){if(!isPaused)return;isPlaying=true;isPaused=false;window.speechSynthesis.resume();playBtn.textContent='⏸';startListenTimer();}
function wordsFor10s(){return Math.round(2.5*speechSpeed*10);}
function startListenTimer(){stopListenTimer();listenTimer=setInterval(()=>{listenSeconds++;},1000);}
function stopListenTimer(){clearInterval(listenTimer);listenTimer=null;}
function applyFontSize(){textPanel.style.fontSize=fontSize+'px';}



async function handleFile(file){
  if(!file||file.type!=='application/pdf'){showToast('Please upload a PDF file ✦');return;}
  showScreen('loading');
  try{
    const buf=await file.arrayBuffer();
    pdfDoc=await pdfjsLib.getDocument({data:buf}).promise;
    totalPages=pdfDoc.numPages;currentFileObj=file;
    readerBookName.textContent=file.name.replace(/\.pdf$/i,'');
    await initVoice();loadPrefs();showScreen('reader');
    const books=getBooks();const existing=books.find(b=>b.name===file.name);
    if(rememberPos&&existing&&existing.currentPage>1){
      resumeText.textContent=`Continue from page ${existing.currentPage}?`;
      resumeOverlay.classList.add('show');
      resumeYes.onclick=()=>{resumeOverlay.classList.remove('show');loadPage(existing.currentPage);};
      resumeNo.onclick=()=>{resumeOverlay.classList.remove('show');loadPage(1);};
    }else loadPage(1);
  }catch(err){console.error(err);showScreen('home');showToast('Could not open this PDF ✦');}
}



function setupDragDrop(){
  const zone=uploadCard;
  ['dragenter','dragover'].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.add('drag-over');}));
  ['dragleave','drop'].forEach(ev=>zone.addEventListener(ev,e=>{e.preventDefault();zone.classList.remove('drag-over');}));
  zone.addEventListener('drop',e=>{
    const file=e.dataTransfer.files[0];
    if(file)handleFile(file);
  });
  // Also allow dropping anywhere on body
  document.body.addEventListener('dragover',e=>e.preventDefault());
  document.body.addEventListener('drop',e=>{
    e.preventDefault();
    const file=e.dataTransfer.files[0];
    if(file&&file.type==='application/pdf'&&currentScreen==='home')handleFile(file);
  });
}


const THEMES={
  cosmic:{'--gold':'#f0a020','--gold2':'#fbbf24','--violet':'#7c3aed','--blue':'#3b82f6','--bg':'#050308'},
  gold:  {'--gold':'#fbbf24','--gold2':'#f59e0b','--violet':'#ea580c','--blue':'#f0a020','--bg':'#0a0600'},
  ocean: {'--gold':'#3b82f6','--gold2':'#06b6d4','--violet':'#0ea5e9','--blue':'#22d3ee','--bg':'#00080f'},
  forest:{'--gold':'#10b981','--gold2':'#34d399','--violet':'#059669','--blue':'#3b82f6','--bg':'#010c05'},
  rose:  {'--gold':'#f43f5e','--gold2':'#fb7185','--violet':'#e11d48','--blue':'#7c3aed','--bg':'#0a0006'},
};
function applyTheme(name){
  const t=THEMES[name];if(!t)return;
  Object.entries(t).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
  const s=getStore();s.theme=name;setStore(s);
}


navHome.addEventListener('click',()=>{saveProgress();showScreen('home');renderBooks(currentFilter,searchInput.value);updateStats();});
navBookmarks.addEventListener('click',()=>{showScreen('bookmarks');renderBookmarks();});
navNotes.addEventListener('click',()=>{showScreen('notes');renderNotes();});
navProfile.addEventListener('click',()=>{saveProgress();showScreen('profile');renderHistory();updateStats();});
profileNavBtn.addEventListener('click',()=>{saveProgress();showScreen('profile');renderHistory();updateStats();});


uploadCard.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>{handleFile(e.target.files[0]);fileInput.value='';});



clearHistBtn.addEventListener('click',()=>{setBooks([]);renderBooks();updateStats();showToast('Library cleared ✦');});
readerBackBtn.addEventListener('click',()=>{stopSpeech();saveProgress();showScreen('home');renderBooks(currentFilter,searchInput.value);updateStats();});
searchInput.addEventListener('input',()=>renderBooks(currentFilter,searchInput.value));
document.querySelectorAll('.filter-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.filter-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');renderBooks(tab.dataset.filter,searchInput.value);
  });
});



playBtn.addEventListener('click',()=>{if(isPaused)resumeSpeech();else if(isPlaying)pauseSpeech();else beginSpeech(currentWordIdx);});
rewindBtn.addEventListener('click',()=>{const i=Math.max(0,currentWordIdx-wordsFor10s());stopSpeech();beginSpeech(i);});
forwardBtn.addEventListener('click',()=>{const i=Math.min(allWords.length-1,currentWordIdx+wordsFor10s());stopSpeech();beginSpeech(i);});
speedBtn.addEventListener('click',()=>{
  const i=SPEEDS.indexOf(speechSpeed);speechSpeed=SPEEDS[(i+1)%SPEEDS.length];
  speedBtn.textContent=fmtSpd(speechSpeed);defSpdVal.textContent=fmtSpd(speechSpeed);
  showToast('Speed: '+fmtSpd(speechSpeed));
  const s=getStore();s.speed=speechSpeed;setStore(s);
  if(isPlaying||isPaused){const idx=currentWordIdx;stopSpeech();beginSpeech(idx);}
});
voiceBtn.addEventListener('click',async()=>{
  voiceListEl.innerHTML='';
  const voices=await getVoices();
  voices.forEach(v=>{
    const item=document.createElement('div');
    item.className='voice-item'+(v.name===currentVoice?' selected':'');
    item.innerHTML=`<span class="voice-check">✦</span><span class="voice-name">${v.name}</span><span class="voice-lang">${v.lang}</span>`;
    item.addEventListener('click',()=>{currentVoice=v.name;const s=getStore();s.voice=currentVoice;setStore(s);voiceOverlay.classList.remove('show');showToast('Voice: '+v.name.split(' ')[0]);if(isPlaying||isPaused){const idx=currentWordIdx;stopSpeech();beginSpeech(idx);}});
    voiceListEl.appendChild(item);
  });
  voiceOverlay.classList.add('show');
});
voiceOverlay.addEventListener('click',e=>{if(e.target===voiceOverlay)voiceOverlay.classList.remove('show');});
[prevPageBtn,prevPage2Btn].forEach(b=>b.addEventListener('click',()=>{if(currentPage>1){saveProgress();loadPage(currentPage-1,isPlaying||isPaused);}}));
[nextPageBtn,nextPage2Btn].forEach(b=>b.addEventListener('click',()=>{if(currentPage<totalPages){saveProgress();loadPage(currentPage+1,isPlaying||isPaused);}}));
pageBtn.addEventListener('click',()=>{jumpInput.value=currentPage;jumpInput.max=totalPages;jumpOverlay.classList.add('show');setTimeout(()=>jumpInput.focus(),350);});
jumpCancel.addEventListener('click',()=>jumpOverlay.classList.remove('show'));
jumpGo.addEventListener('click',()=>{const p=parseInt(jumpInput.value);if(p>=1&&p<=totalPages){jumpOverlay.classList.remove('show');loadPage(p,isPlaying||isPaused);}else showToast(`Page must be 1–${totalPages}`);});
jumpOverlay.addEventListener('click',e=>{if(e.target===jumpOverlay)jumpOverlay.classList.remove('show');});

/* Bookmark save */
addBmBtn.addEventListener('click',()=>{bmLabelInput.value='';bmSaveOverlay.classList.add('show');setTimeout(()=>bmLabelInput.focus(),350);});
bmSaveCancel.addEventListener('click',()=>bmSaveOverlay.classList.remove('show'));
bmSaveGo.addEventListener('click',()=>{saveBookmark(bmLabelInput.value);bmSaveOverlay.classList.remove('show');});
bmSaveOverlay.addEventListener('click',e=>{if(e.target===bmSaveOverlay)bmSaveOverlay.classList.remove('show');});

/* Note save */
addNoteBtn.addEventListener('click',()=>{noteInputArea.value='';noteSaveOverlay.classList.add('show');setTimeout(()=>noteInputArea.focus(),350);});
noteSaveCancel.addEventListener('click',()=>noteSaveOverlay.classList.remove('show'));
noteSaveGo.addEventListener('click',()=>{if(!noteInputArea.value.trim()){showToast('Write something first ✦');return;}saveNote(noteInputArea.value);noteSaveOverlay.classList.remove('show');});
noteSaveOverlay.addEventListener('click',e=>{if(e.target===noteSaveOverlay)noteSaveOverlay.classList.remove('show');});


document.querySelectorAll('.theme-dot').forEach(dot=>{
  dot.addEventListener('click',()=>{
    document.querySelectorAll('.theme-dot').forEach(d=>d.classList.remove('active'));
    dot.classList.add('active');applyTheme(dot.dataset.theme);showToast('Theme changed ✦');
  });
});
fontSlider.addEventListener('input',()=>{fontSize=parseInt(fontSlider.value);fontSizeLabel.textContent=fontSize+'px';applyFontSize();const s=getStore();s.fontSize=fontSize;setStore(s);});
autoCT.addEventListener('click',()=>{autoContinue=!autoContinue;autoCT.classList.toggle('on',autoContinue);showToast('Auto continue '+(autoContinue?'on ✦':'off'));const s=getStore();s.autoContinue=autoContinue;setStore(s);});
rememberPT.addEventListener('click',()=>{rememberPos=!rememberPos;rememberPT.classList.toggle('on',rememberPos);showToast('Remember position '+(rememberPos?'on ✦':'off'));const s=getStore();s.rememberPos=rememberPos;setStore(s);});
$('defaultSpeedRow').addEventListener('click',()=>showToast('Change speed in the Reader ⚡'));



(function init(){
  loadPrefs();setupDragDrop();
  const s=getStore();
  if(s.theme)applyTheme(s.theme);
  const td=document.querySelector(`.theme-dot[data-theme="${s.theme||'cosmic'}"]`);
  if(td){document.querySelectorAll('.theme-dot').forEach(d=>d.classList.remove('active'));td.classList.add('active');}
  renderBooks();renderHistory();updateStats();showScreen('home');
})();

