
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    const el=document.querySelector(id);
    if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

const captions=[
  "Aktifkan extension untuk mulai membaca data yang tampil.",
  "Panel info memperkaya kartu produk dengan skor, komisi, dan momentum.",
  "Buka dashboard untuk membandingkan produk dalam satu tempat.",
  "Gunakan filter harga, rating, umur produk, dan komisi.",
  "Bandingkan komisi dengan jumlah kreator untuk mencari ruang peluang.",
  "Ekspor hasil riset untuk spreadsheet atau workflow tim."
];
const durations=[3600,3900,3900,3900,3900,3900];
let currentStep=0,timer=null,playing=true;
const market=document.querySelector('[data-scene="market"]');
const dashboard=document.querySelector('[data-scene="dashboard"]');
const popup=document.getElementById('extensionPopup');
const cards=[...document.querySelectorAll('.product-card')];
const filter=document.getElementById('advancedFilter');
const rings=[...document.querySelectorAll('.focus-ring')];
const toast=document.getElementById('exportToast');
const steps=[...document.querySelectorAll('.step')];
const caption=document.getElementById('sceneCaption');
const cursor=document.getElementById('fakeCursor');
const address=document.getElementById('addressBar');
const playPause=document.getElementById('playPause');

function cursorTo(x,y,click=false){
  cursor.style.left=x+'%';cursor.style.top=y+'%';
  if(click){cursor.classList.add('click');setTimeout(()=>cursor.classList.remove('click'),180);}
}
function clearState(){
  market.classList.remove('active');dashboard.classList.remove('active');
  popup.style.opacity='1';popup.style.transform='none';
  cards.forEach(c=>c.classList.remove('show-peek'));
  filter.classList.remove('open');rings.forEach(r=>r.classList.remove('show'));toast.classList.remove('show');
}
function setStep(n,schedule=true){
  currentStep=((n%6)+6)%6;clearState();
  steps.forEach((s,i)=>s.classList.toggle('active',i===currentStep));
  caption.textContent=captions[currentStep];

  if(currentStep<=1){market.classList.add('active');address.textContent='marketplace.local/search?q=kaos-pria';}
  else{dashboard.classList.add('active');address.textContent='app.takeapeek.local/riset-produk';}

  if(currentStep===0){
    cursorTo(88,12);setTimeout(()=>cursorTo(86,27,true),700);
  }
  if(currentStep===1){
    popup.style.opacity='0';popup.style.transform='scale(.92) translateY(-8px)';
    cursorTo(78,52);cards.forEach((c,i)=>setTimeout(()=>c.classList.add('show-peek'),300+i*240));setTimeout(()=>cursorTo(48,65),1100);
  }
  if(currentStep===2){cursorTo(76,18);setTimeout(()=>cursorTo(60,55),800);}
  if(currentStep===3){cursorTo(61,25);setTimeout(()=>{cursorTo(60,33,true);filter.classList.add('open');},650);setTimeout(()=>cursorTo(70,51),1450);}
  if(currentStep===4){cursorTo(72,56);setTimeout(()=>{rings[0].classList.add('show');cursorTo(75,56);},650);setTimeout(()=>{rings[1].classList.add('show');cursorTo(82,56);},1650);}
  if(currentStep===5){cursorTo(90,32);setTimeout(()=>{cursorTo(91,32,true);toast.classList.add('show');},750);}

  if(schedule&&playing){clearTimeout(timer);timer=setTimeout(()=>setStep(currentStep+1,true),durations[currentStep]);}
}
steps.forEach((btn,i)=>btn.addEventListener('click',()=>{playing=false;playPause.textContent='▶';clearTimeout(timer);setStep(i,false);}));
document.getElementById('restartDemo').addEventListener('click',()=>{playing=true;playPause.textContent='Ⅱ';clearTimeout(timer);setStep(0,true);});
playPause.addEventListener('click',()=>{playing=!playing;playPause.textContent=playing?'Ⅱ':'▶';clearTimeout(timer);if(playing)setStep(currentStep,true);});
document.getElementById('filterBtn')?.addEventListener('click',()=>filter.classList.toggle('open'));
document.getElementById('exportBtn')?.addEventListener('click',()=>toast.classList.add('show'));
if(new URLSearchParams(location.search).get('demo')==='1')document.body.classList.add('demo-only');
setStep(0,true);
