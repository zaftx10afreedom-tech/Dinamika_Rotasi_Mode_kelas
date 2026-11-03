"use strict";
const slides = [{"title":"Dinamika Rotasi dan Kesetimbangan Benda Tegar","section":"Pembuka"},{"title":"Gerak Rotasi","section":"Gerak Rotasi"},{"title":"Persamaan Gerak Translasi dan Rotasi","section":"Kinematika"},{"title":"Hubungan Roda-Roda pada Gerak Melingkar","section":"Sistem Roda"},{"title":"Rotasi Benda Pejal","section":"Dinamika"},{"title":"Momen Inersia dan Energi Kinetik Rotasi","section":"Energi"},{"title":"Momen Inersia Berbagai Benda","section":"Momen Inersia"},{"title":"Hukum Newton pada Gerak Rotasi","section":"Torsi"},{"title":"Hukum Kekekalan Momentum pada Gerak Rotasi","section":"Momentum Sudut"},{"title":"Kesetimbangan Benda Tegar dan Pusat Massa","section":"Kesetimbangan"},{"title":"Terima Kasih","section":"Penutup"}];
const $ = id => document.getElementById(id);
const total = slides.length;
const pad = n => String(n).padStart(2,'0');
const storeKey = 'studio-fisika-rotasi-pid-presentasi-sederhana-v1';
const readState = (()=>{try{return JSON.parse(localStorage.getItem(storeKey)||'{}')||{}}catch{return {}}})();
const state={index:Math.max(1,Math.min(total,Number(readState.index)||1)),tool:'none',zoom:1,panX:0,panY:0,inks:readState.inks||{},pointerMap:new Map(),gesture:null,blockedSwipe:false,activeStroke:null,modal:null,toolsTimer:null,toastTimer:null};
function save(){try{localStorage.setItem(storeKey,JSON.stringify({index:state.index,inks:state.inks}))}catch{}}
function msg(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2200)}
function imageURL(i){return (window.PID_IMAGES && window.PID_IMAGES[i])||`slides/slide-${pad(i)}.webp`}
function fit(){const stage=$('slideStage');const f=$('slideFrame');const w=Math.max(120,Math.min(stage.clientWidth-8,(stage.clientHeight-8)*16/9));f.style.width=w+'px';f.style.height=w*9/16+'px';clampPan();applyZoom()}
function clampPan(){const fw=$('slideFrame').offsetWidth,fh=$('slideFrame').offsetHeight;const maxX=Math.max(0,(fw*state.zoom-$('slideStage').clientWidth)/2+12),maxY=Math.max(0,(fh*state.zoom-$('slideStage').clientHeight)/2+12);state.panX=Math.max(-maxX,Math.min(maxX,state.panX));state.panY=Math.max(-maxY,Math.min(maxY,state.panY));if(state.zoom<=1){state.panX=0;state.panY=0}}
function applyZoom(){clampPan();$('slideFrame').style.transform=`translate(${state.panX}px,${state.panY}px) scale(${state.zoom})`}
function zoomTo(z){state.zoom=Math.max(1,Math.min(3,Number(z)||1));if(state.zoom===1){state.panX=0;state.panY=0}applyZoom()}
function resetZoom(){zoomTo(1)}
function renderInk(){const c=$('inkCanvas');if(c.width!==1920||c.height!==1080){c.width=1920;c.height=1080}const ctx=c.getContext('2d');ctx.clearRect(0,0,1920,1080);ctx.strokeStyle='#ee355a';ctx.lineWidth=7;ctx.lineJoin='round';ctx.lineCap='round';for(const pts of state.inks[state.index]||[]){if(!pts.length)continue;ctx.beginPath();for(let i=0;i<pts.length;i++){let [x,y]=pts[i];if(i===0)ctx.moveTo(x*1920,y*1080);else ctx.lineTo(x*1920,y*1080)}if(pts.length===1)ctx.lineTo(pts[0][0]*1920+.1,pts[0][1]*1080+.1);ctx.stroke()}}
function addPoint(e){const r=$('slideFrame').getBoundingClientRect();return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))]}
function onFrame(e){const r=$('slideFrame').getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}
function undo(){const x=state.inks[state.index];if(x&&x.length){x.pop();renderInk();save()}showTools()}
function clearInk(){state.inks[state.index]=[];renderInk();save();showTools()}
function updateTools(){for(const [id,t] of [['penBtn','pen'],['laserBtn','laser']]){$(id).classList.toggle('active',state.tool===t);$(id).setAttribute('aria-pressed',String(state.tool===t))}if(state.tool!=='laser')$('laserDot').hidden=true}
function toggleTool(t){state.tool=state.tool===t?'none':t;updateTools();showTools();msg(state.tool==='pen'?'Pena aktif: tulis pada slide':state.tool==='laser'?'Laser aktif: arahkan jari atau penunjuk':'Mode navigasi aktif')}
function goto(n){if(!Number.isFinite(Number(n)))return;state.index=Math.max(1,Math.min(total,Math.round(Number(n))));$('slideImage').src=imageURL(state.index);$('slideImage').alt=`Slide ${state.index}: ${slides[state.index-1].title}`;$('slideTopic').textContent=slides[state.index-1].title;for(const id of ['slideBadge','headerCounter','dockCount'])$(id).textContent=`${pad(state.index)} / ${pad(total)}`;for(const id of ['prevBtn','edgePrev'])$(id).disabled=state.index===1;for(const id of ['nextBtn','edgeNext'])$(id).disabled=state.index===total;resetZoom();renderInk();save();const h=`slide=${state.index}`;if(location.hash.substring(1)!==h)history.replaceState(null,'','#'+h);}
function next(){goto(state.index+1)}function prev(){goto(state.index-1)}
function showTools(){if(state.modal)return;document.body.classList.remove('tools-hidden');$('revealBtn').hidden=true;clearTimeout(state.toolsTimer);if(state.tool==='pen')return;state.toolsTimer=setTimeout(()=>hideTools(),8500);requestAnimationFrame(fit)}
function hideTools(){if(state.modal)return;document.body.classList.add('tools-hidden');$('revealBtn').hidden=false;requestAnimationFrame(fit)}
function reveal(){showTools();requestAnimationFrame(fit)}
function setModal(id){state.modal=id;$(id).hidden=false;clearTimeout(state.toolsTimer);$('revealBtn').hidden=true;if(id==='slidesModal')renderThumbs()}
function closeModal(id){$(id).hidden=true;if(state.modal===id)state.modal=null;showTools()}
function renderThumbs(){const grid=$('thumbGrid');grid.replaceChildren();for(let i=1;i<=total;i++){const el=document.createElement('button');el.type='button';el.className='thumb'+(i===state.index?' selected':'');el.innerHTML=`<img loading="lazy" src="${imageURL(i)}" alt=""><strong>${pad(i)} · ${slides[i-1].title}</strong><small>${slides[i-1].section}</small>`;el.addEventListener('click',()=>{goto(i);closeModal('slidesModal')});grid.appendChild(el)}}
async function toggleFullscreen(){if(document.fullscreenElement){try{await document.exitFullscreen()}catch(e){msg('Tidak dapat keluar dari layar penuh')}}else{try{await document.documentElement.requestFullscreen()}catch(e){msg('Gunakan menu layar penuh di browser PID')}}setTimeout(fit,120)}
function gestures(){const stage=$('slideStage');const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);const center=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('button')||state.modal||(e.pointerType==='mouse'&&e.button!==0))return;try{stage.setPointerCapture(e.pointerId)}catch{};const p={startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,t:performance.now()};state.pointerMap.set(e.pointerId,p);
 if(state.pointerMap.size===2){state.blockedSwipe=true;state.activeStroke=null;const [a,b]=[...state.pointerMap.values()];state.gesture={distance:dist(a,b),zoom:state.zoom,panX:state.panX,panY:state.panY,center:center(a,b)};return}
 if(state.pointerMap.size!==1)return;state.blockedSwipe=false;state.gesture=null;if(state.tool==='pen'&&onFrame(e)){state.inks[state.index]||=[];state.activeStroke=[addPoint(e)];state.inks[state.index].push(state.activeStroke);renderInk()}
 });
 stage.addEventListener('pointermove',e=>{if(state.tool==='laser'&&!state.modal){$('laserDot').hidden=false;$('laserDot').style.left=e.clientX+'px';$('laserDot').style.top=e.clientY+'px'}if(!state.pointerMap.has(e.pointerId))return;const p=state.pointerMap.get(e.pointerId);const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
 if(state.pointerMap.size===2&&state.gesture){const[a,b]=[...state.pointerMap.values()];const mid=center(a,b);state.zoom=Math.max(1,Math.min(3,state.gesture.zoom*dist(a,b)/Math.max(1,state.gesture.distance)));state.panX=state.gesture.panX+mid.x-state.gesture.center.x;state.panY=state.gesture.panY+mid.y-state.gesture.center.y;applyZoom();return}
 if(state.tool==='pen'&&state.activeStroke){state.activeStroke.push(addPoint(e));renderInk();return}
 if(state.zoom>1&&state.tool!=='pen'){state.panX+=dx;state.panY+=dy;applyZoom()}
 });
 function finish(e,cancelled=false){if(!state.pointerMap.has(e.pointerId))return;const p=state.pointerMap.get(e.pointerId);state.pointerMap.delete(e.pointerId);if(state.activeStroke){state.activeStroke=null;save()}
 if(state.pointerMap.size===0){if(!cancelled&&!state.blockedSwipe&&state.tool==='none'&&state.zoom===1){const dx=e.clientX-p.startX,dy=e.clientY-p.startY,dt=performance.now()-p.t;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.3&&dt<1500){dx<0?next():prev()}}state.gesture=null;state.blockedSwipe=false}else if(state.pointerMap.size===1){state.gesture=null;state.blockedSwipe=true}}
 stage.addEventListener('pointerup',e=>finish(e,false));stage.addEventListener('pointercancel',e=>finish(e,true));stage.addEventListener('pointerleave',e=>{if(state.tool==='laser')$('laserDot').hidden=true});
 }
function init(){const hash=/#slide=(\d+)/.exec(location.hash);if(hash)state.index=Math.max(1,Math.min(total,Number(hash[1])));fit();goto(state.index);gestures();const on=(id,fn)=>$(id).addEventListener('click',fn);
 for(const id of ['prevBtn','edgePrev'])on(id,prev);for(const id of ['nextBtn','edgeNext'])on(id,next);
 on('listBtn',()=>setModal('slidesModal'));on('helpBtn',()=>setModal('helpModal'));on('penBtn',()=>toggleTool('pen'));on('laserBtn',()=>toggleTool('laser'));on('undoBtn',undo);on('clearBtn',clearInk);on('zoomInBtn',()=>zoomTo(state.zoom+.25));on('zoomOutBtn',()=>zoomTo(state.zoom-.25));on('zoomFitBtn',resetZoom);on('fullBtn',toggleFullscreen);on('hideBtn',hideTools);on('revealBtn',reveal);
 document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
 for(const id of ['slidesModal','helpModal'])on(id,e=>{if(e.target===$(id))closeModal(id)});
 window.addEventListener('resize',fit);document.addEventListener('fullscreenchange',()=>setTimeout(fit,80));window.addEventListener('hashchange',()=>{const m=/#slide=(\d+)/.exec(location.hash);if(m)goto(+m[1])});
 document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(state.modal){if(e.key==='Escape')closeModal(state.modal);return}const k=e.key.toLowerCase();if(['arrowright','pagedown',' '].includes(k)){e.preventDefault();next()}else if(['arrowleft','pageup'].includes(k)){e.preventDefault();prev()}else if(k==='home'){e.preventDefault();goto(1)}else if(k==='end'){e.preventDefault();goto(total)}else if(k==='f')toggleFullscreen();else if(k==='b')setModal('slidesModal');else if(k==='p')toggleTool('pen');else if(k==='l')toggleTool('laser');else if(k==='t')showTools()});
 $('slideImage').addEventListener('error',()=>msg('Gambar slide gagal dimuat. Pastikan folder slides tersedia.'));document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!state.modal)showTools()});
 requestAnimationFrame(fit);showTools();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
