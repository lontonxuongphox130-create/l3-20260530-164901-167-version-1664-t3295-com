
(function(){
  const slides=[...document.querySelectorAll('.hero-slide')];
  const dots=[...document.querySelectorAll('.hero-dot')];
  if(slides.length){
    let idx=0;
    function show(n){idx=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===idx));dots.forEach((d,i)=>d.classList.toggle('active',i===idx));}
    document.querySelectorAll('[data-hero-next]').forEach(b=>b.addEventListener('click',()=>show(idx+1)));
    document.querySelectorAll('[data-hero-prev]').forEach(b=>b.addEventListener('click',()=>show(idx-1)));
    dots.forEach((d,i)=>d.addEventListener('click',()=>show(i)));
    setInterval(()=>show(idx+1),5000);
  }
})();
function initPlayer(button){
  const box=button.closest('.player-box');
  const video=box.querySelector('video');
  const error=box.querySelector('.player-error');
  const src=video.dataset.src;
  button.style.display='none';
  function fail(msg){error.textContent=msg;error.style.display='block';button.style.display='flex';}
  if(!src){fail('播放地址缺失');return;}
  try{
    if(window.Hls && Hls.isSupported()){
      const hls=new Hls({enableWorker:true,lowLatencyMode:true});
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function(){video.play().catch(()=>{});});
      hls.on(Hls.Events.ERROR,function(evt,data){if(data && data.fatal){fail('视频加载失败，请刷新页面或稍后再试');try{hls.destroy()}catch(e){}}});
    }else if(video.canPlayType('application/vnd.apple.mpegurl')){
      video.src=src;
      video.addEventListener('loadedmetadata',function(){video.play().catch(()=>{});},{once:true});
    }else{
      fail('当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或 Firefox 最新版。');
    }
  }catch(e){fail('播放器初始化失败：'+e.message);}
}
function runSearch(){
  const q=(document.getElementById('q')?.value||'').trim().toLowerCase();
  const cat=(document.getElementById('cat')?.value||'');
  const year=(document.getElementById('year')?.value||'');
  const out=document.getElementById('searchResults');
  if(!out || !window.MOVIE_INDEX)return;
  let list=window.MOVIE_INDEX.filter(m=>(!q || (m.title+m.tags+m.region+m.type).toLowerCase().includes(q)) && (!cat || m.category===cat) && (!year || String(m.year).startsWith(year)) ).slice(0,120);
  out.innerHTML=list.map(m=>`<article class="movie-card"><a class="poster" href="${m.url}"><img src="${m.cover}" alt="${m.title}封面" loading="lazy" onerror="this.classList.add('is-missing')"><b class="play-dot">▶</b></a><div class="card-body"><div class="meta-line"><span>${m.year}</span><span>${m.region}</span><span>${m.type}</span></div><h3><a href="${m.url}">${m.title}</a></h3><p>${m.oneLine}</p><div class="tag-row"><span>${m.categoryName}</span></div></div></article>`).join('') || '<p class="section-desc">没有找到匹配内容，请调整关键词或筛选条件。</p>';
}
document.addEventListener('DOMContentLoaded',()=>{const btn=document.getElementById('searchBtn'); if(btn)btn.addEventListener('click',runSearch); ['q','cat','year'].forEach(id=>{const el=document.getElementById(id); if(el)el.addEventListener('change',runSearch); if(el&&id==='q')el.addEventListener('keyup',e=>{if(e.key==='Enter')runSearch();});}); if(document.getElementById('searchResults'))runSearch();});
