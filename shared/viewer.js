pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
let pdf=null,pg=1,total=1,curUrl=null;
function openPdf(url,title){
  curUrl=url;pg=1;pdf=null;
  document.getElementById('viewer').style.display='flex';
  document.getElementById('vtitle').textContent=title||url.split('/').pop();
  document.getElementById('pdf-wrap').innerHTML='<div class="loading"><div class="spin"></div><div>Loading…</div></div>';
  (async()=>{
    try{
      const buf=await (await fetch(url,{cache:'force-cache'})).arrayBuffer();
      pdf=await pdfjsLib.getDocument({data:buf}).promise;
      total=pdf.numPages; draw();
    }catch(e){
      document.getElementById('pdf-wrap').innerHTML='<div class="loading"><div style="color:#c66">Could not load: '+e.message+'</div></div>';
    }
  })();
}
function draw(){
  if(!pdf)return;
  const wrap=document.getElementById('pdf-wrap');
  wrap.innerHTML='<div class="loading"><div class="spin"></div><div>Page '+pg+' of '+total+'</div></div>';
  pdf.getPage(pg).then(page=>{
    const c=document.createElement('canvas'),ctx=c.getContext('2d');
    const vp=page.getViewport({scale:1.6});
    c.width=vp.width;c.height=vp.height;wrap.innerHTML='';wrap.appendChild(c);
    page.render({canvasContext:ctx,viewport:vp});
    document.getElementById('pginfo').textContent=pg+'/'+total;
  });
}
function prevPage(){if(pg>1){pg--;draw()}}
function nextPage(){if(pg<total){pg++;draw()}}
function closeViewer(){document.getElementById('viewer').style.display='none';pdf=null}
function dl(){if(curUrl)window.open(curUrl,'_blank')}
document.addEventListener('keydown',e=>{
  if(document.getElementById('viewer').style.display!=='flex')return;
  if(e.key==='ArrowLeft')prevPage();
  if(e.key==='ArrowRight')nextPage();
  if(e.key==='Escape')closeViewer();
});
