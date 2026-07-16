// ===== 万物生长粒子系统 + 流星 + 星光 =====
(function(){
const canvas = document.getElementById('bg-canvas');
if(!canvas) return;
const ctx = canvas.getContext('2d');
let W,H;
function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
window.addEventListener('resize',resize);resize();

const GROW_COUNT=100, grows=[];
class Grow{
  constructor(init){
    this.x=Math.random()*W;
    this.baseY=H+Math.random()*100;this.y=this.baseY;
    this.targetY=Math.random()*H*0.7;
    this.speed=Math.random()*0.3+0.1;
    this.r=Math.random()*2.5+1;
    this.a=Math.random()*0.3+0.08;
    this.hue=25+Math.random()*20;
    this.phase=Math.random()*Math.PI*2;
    this.completed=init?false:Math.random()>0.5;
    if(this.completed) this.y=this.targetY;
  }
  update(){
    if(this.completed){
      this.y=this.targetY+Math.sin(Date.now()*0.001+this.phase)*0.3;
      this.x+=Math.sin(Date.now()*0.0008+this.phase)*0.05;
    }else{
      this.y-=this.speed;this.x+=Math.sin(Date.now()*0.001+this.phase)*0.03;
      if(this.y<=this.targetY){this.y=this.targetY;this.completed=true;}
    }
  }
  draw(){
    const alpha=this.a*(this.completed?1:Math.max(0.1,(this.baseY-this.y)/(this.baseY-this.targetY)));
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=`hsla(${this.hue},80%,60%,${alpha})`;ctx.fill();
    if(this.completed){
      ctx.beginPath();ctx.arc(this.x,this.y,this.r*2.5,0,Math.PI*2);
      ctx.fillStyle=`hsla(${this.hue},90%,70%,${alpha*0.15})`;ctx.fill();
    }
  }
  isDead(){return this.y<-10;}
}
for(let i=0;i<GROW_COUNT;i++) grows.push(new Grow(true));

// Meteors
class Meteor{
  constructor(){
    this.x=Math.random()*W*1.2-W*0.1;this.y=Math.random()*H*0.3;
    this.len=Math.random()*120+60;this.speed=Math.random()*6+4;
    this.angle=Math.PI*0.25+Math.random()*0.15;
    this.life=0;this.maxLife=60+Math.random()*40;this.trail=[];
  }
  update(){
    this.life++;
    this.x+=Math.cos(this.angle)*this.speed;
    this.y+=Math.sin(this.angle)*this.speed;
    this.trail.push({x:this.x,y:this.y});
    if(this.trail.length>15) this.trail.shift();
  }
  draw(){
    const alpha=Math.min(1,Math.min(this.life/20,(this.maxLife-this.life)/20))*0.8;
    if(alpha<=0) return;
    for(let i=0;i<this.trail.length;i++){
      const t=this.trail[i],a=(i/this.trail.length)*alpha*0.3;
      ctx.beginPath();ctx.arc(t.x,t.y,1.2*(i/this.trail.length),0,Math.PI*2);
      ctx.fillStyle=`rgba(251,191,36,${a})`;ctx.fill();
    }
    const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,8);
    g.addColorStop(0,`rgba(255,245,200,${alpha})`);
    g.addColorStop(0.3,`rgba(251,191,36,${alpha*0.5})`);
    g.addColorStop(1,'rgba(251,146,60,0)');
    ctx.beginPath();ctx.arc(this.x,this.y,2,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();ctx.moveTo(this.x,this.y);
    ctx.lineTo(this.x-Math.cos(this.angle)*this.len*0.5,this.y-Math.sin(this.angle)*this.len*0.5);
    ctx.strokeStyle=`rgba(251,191,36,${alpha*0.12})`;ctx.lineWidth=1.5;ctx.stroke();
  }
  isDead(){return this.life>this.maxLife||this.x>W+100||this.y>H+100;}
}
const meteors=[];
for(let i=0;i<2;i++){const m=new Meteor();m.life=-Math.random()*200;meteors.push(m);}

// Stars
const stars=[];
for(let i=0;i<50;i++) stars.push({x:Math.random()*W,y:Math.random()*H*0.5,r:Math.random()*1+0.3,a:Math.random()*0.3+0.08,s:Math.random()*0.02+0.005});
function drawStars(t){
  stars.forEach(s=>{
    const f=Math.sin(t*s.s+s.x)*0.3+0.7;
    ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,245,220,${s.a*f})`;ctx.fill();
  });
}

// Bottom glow
function drawGlow(){
  const g=ctx.createLinearGradient(0,H*0.75,0,H);
  g.addColorStop(0,'rgba(251,146,60,0)');
  g.addColorStop(0.3,'rgba(251,146,60,0.006)');
  g.addColorStop(1,'rgba(251,191,36,0)');
  ctx.fillStyle=g;ctx.fillRect(0,H*0.5,W,H*0.5);
}

let mt=0;
function anim(t){
  ctx.clearRect(0,0,W,H);drawGlow();drawStars(t);
  grows.forEach(p=>{p.update();p.draw();});
  for(let i=grows.length-1;i>=0;i--){if(grows[i].isDead())grows.splice(i,1);}
  while(grows.length<GROW_COUNT) grows.push(new Grow(false));
  mt++;if(mt>350+Math.random()*200){mt=0;if(meteors.length<5)meteors.push(new Meteor());}
  meteors.forEach(m=>{m.update();m.draw();});
  for(let i=meteors.length-1;i>=0;i--){if(meteors[i].isDead())meteors.splice(i,1);}
  requestAnimationFrame(anim);
}
anim(0);
})();

// ===== 导航高亮 =====
(function(){
const links=document.querySelectorAll('.nav-links a');
const page=window.location.pathname.split('/').pop()||'index.html';
links.forEach(a=>{
  const href=a.getAttribute('href');
  if(href===page||(page==='index.html'&&(!href||href==='#'||href==='index.html'))) a.classList.add('active');
});
document.getElementById('hamToggle')?.addEventListener('click',()=>{
  document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click',()=>document.getElementById('navLinks').classList.remove('open'));
});
})();

// ===== 滚动渐入 =====
(function(){
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
})();
