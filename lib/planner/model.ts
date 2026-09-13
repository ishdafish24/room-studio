export type Kind = 'bed' | 'desk' | 'nightstand' | 'cabinet';
export type Item = {id:string; kind:Kind; name:string; w:number; d:number; h:number; x:number; z:number; r:number; color:string; visible:boolean; locked:boolean; source?:string};
export type Room = {width:number; length:number; solid:number; height:number; error:number; wall:string; floor:string};
export type Chair = {width:number; depth:number; base:number; height:number; armHeight:number; arms:boolean; tuck:number; pull:number; angle:number; lateral:number};
export type Plan = {version:1; room:Room; items:Item[]; chair:Chair; bedSource:'brief'|'ikea'|'custom'; drawerExtension:number};
export const SOURCES = {
 bed:'https://www.ikea.com/us/en/p/brimnes-bed-frame-with-storage-headboard-black-luroey-s79129608/',
 nightstand:'https://www.ikea.com/us/en/p/brimnes-nightstand-black-80340454/',
 desk:'https://www.ikea.com/us/en/p/mittzon-desk-sit-stand-electric-walnut-veneer-black-s79529456/',
 tour:'https://discover.matterport.com/space/ZHTxG3Rj6DU'
};
export function initialPlan():Plan {return {version:1, room:{width:127,length:142,solid:87,height:100,error:2,wall:'#f1f0ed',floor:'#888b8c'},bedSource:'brief',drawerExtension:24,chair:{width:22,depth:24,base:24,height:38,armHeight:26,arms:true,tuck:8,pull:6,angle:75,lateral:0},items:[
 {id:'bed',kind:'bed',name:'BRIMNES bed',w:62.25,d:94.5,h:43.75,x:33.125,z:47.25,r:0,color:'#292b2b',visible:true,locked:false,source:SOURCES.bed},
 {id:'nightstand',kind:'nightstand',name:'BRIMNES nightstand',w:15.4,d:16.1,h:20.9,x:73.95,z:8.05,r:0,color:'#292b2b',visible:true,locked:false,source:SOURCES.nightstand},
 {id:'desk',kind:'desk',name:'MITTZON desk',w:63,d:23.625,h:29.5,x:35,z:130.1875,r:0,color:'#74533a',visible:true,locked:false,source:SOURCES.desk}
]};}
export type Point={x:number;z:number};
export function transform(p:Point,origin:Point,r:number):Point {const a=r*Math.PI/180;return {x:origin.x+p.x*Math.cos(a)+p.z*Math.sin(a),z:origin.z-p.x*Math.sin(a)+p.z*Math.cos(a)};}
export function rect(x:number,z:number,w:number,d:number,r=0):Point[]{return [{x:-w/2,z:-d/2},{x:w/2,z:-d/2},{x:w/2,z:d/2},{x:-w/2,z:d/2}].map(p=>transform(p,{x,z},r));}
export function polygon(item:Item){return rect(item.x,item.z,item.w,item.d,item.r);}
export function overlap(a:Point[],b:Point[]):boolean {for(const p of [a,b])for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length],v=p[i],ax=q.z-v.z,az=v.x-q.x;const aa=a.map(t=>t.x*ax+t.z*az),bb=b.map(t=>t.x*ax+t.z*az);if(Math.max(...aa)<=Math.min(...bb)+0.001 || Math.max(...bb)<=Math.min(...aa)+0.001)return false;}return true;}
export function circleHits(c:Point,r:number,poly:Point[]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>c.z)!=(b.z>c.z)&&c.x<(b.x-a.x)*(c.z-a.z)/(b.z-a.z)+a.x)inside=!inside;const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((c.x-a.x)*dx+(c.z-a.z)*dz)/(dx*dx+dz*dz)));if(Math.hypot(c.x-a.x-t*dx,c.z-a.z-t*dz)<r-.001)return true;}return inside;}
export function outside(points:Point[],room:Room){return points.some(p=>p.x<-.01||p.x>room.width+.01||p.z<-.01||p.z>room.length+.01);}
export function bounds(item:Item){const p=polygon(item);return {left:Math.min(...p.map(t=>t.x)),right:Math.max(...p.map(t=>t.x)),rear:Math.min(...p.map(t=>t.z)),front:Math.max(...p.map(t=>t.z))};}
export function chairPose(plan:Plan,t=0){const desk=plan.items.find(i=>i.id==='desk'&&i.visible);if(!desk)return null;const c=plan.chair, pull=c.pull*Math.min(1,t*2), angle=c.angle*Math.max(0,t*2-1);const center=transform({x:c.lateral,z:-desk.d/2-c.depth/2+c.tuck-pull},desk,desk.r);return {...center,r:desk.r+angle,pull,angle};}
export function chairCollision(plan:Plan,t=0):string[]{const pose=chairPose(plan,t),desk=plan.items.find(i=>i.id==='desk'&&i.visible);if(!pose||!desk)return [];const c=plan.chair,body=rect(pose.x,pose.z,c.width,c.depth,pose.r),hits:string[]=[];
 if(outside(body,plan.room)||pose.x-c.base/2<0||pose.x+c.base/2>plan.room.width||pose.z-c.base/2<0||pose.z+c.base/2>plan.room.length)hits.push('Room boundary');
 for(const item of plan.items.filter(i=>i.visible&&i.kind!=='desk'))if(overlap(body,polygon(item))||circleHits(pose,c.base/2,polygon(item)))hits.push(item.name);
 const under=desk.h-1.25;
 if((c.arms&&c.armHeight>=under||18>=under)&&overlap(body,polygon(desk)))hits.push('Arms / desktop');
 const backCenter=transform({x:0,z:-c.depth/2+1.5},pose,pose.r);
 if(c.height>under&&overlap(rect(backCenter.x,backCenter.z,c.width*.86,3,pose.r),polygon(desk)))hits.push('Chair back / desktop');
 for(const side of [-1,1]){const leg=transform({x:side*Math.max(0,desk.w-8)/2,z:0},desk,desk.r);if(circleHits(pose,c.base/2,rect(leg.x,leg.z,3,Math.min(22,desk.d),desk.r)))hits.push('Caster base / desk feet');}
 return [...new Set(hits)];}
function pointSegmentDistance(p:Point,a:Point,b:Point){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);}
export function polygonDistance(a:Point[],b:Point[]){if(overlap(a,b))return 0;let min=Infinity;for(const [p,q] of [[a,b],[b,a]])for(const pt of p)for(let j=0;j<q.length;j++)min=Math.min(min,pointSegmentDistance(pt,q[j],q[(j+1)%q.length]));return min;}
export function analyze(plan:Plan){const items=plan.items.filter(i=>i.visible),issues:string[]=[];for(const item of items){if(outside(polygon(item),plan.room))issues.push(item.name+' crosses the room boundary');}for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(overlap(polygon(items[i]),polygon(items[j])))issues.push(items[i].name+' overlaps '+items[j].name);
 const bed=items.find(i=>i.id==='bed'),desk=items.find(i=>i.id==='desk'),ns=items.find(i=>i.id==='nightstand');
 const aligned=!!bed&&!!desk&&Math.abs(bed.r%360)<.01&&Math.abs(desk.r%360)<.01&&bounds(bed).left<bounds(desk).right&&bounds(bed).right>bounds(desk).left;
 const gap=aligned?bounds(desk!).rear-bounds(bed!).front:null;
 const spare=bed&&ns?plan.room.solid-bed.w-ns.w:null;
 const wallFit=!!bed&&!!ns&&Math.abs(bed.r%360)<.01&&Math.abs(ns.r%360)<.01&&bounds(bed).left>=0&&bounds(ns).right<=plan.room.solid&&bounds(bed).right<=plan.room.solid&&!overlap(polygon(bed),polygon(ns));
 let minBedClearance:number|null=bed&&desk?Infinity:null;let firstBlocked:number|null=null;const pathHits=new Set<string>();for(let n=0;n<=120;n++){const hits=chairCollision(plan,n/120);const pose=chairPose(plan,n/120);if(pose&&bed){const bp=polygon(bed);const bodyDistance=polygonDistance(rect(pose.x,pose.z,plan.chair.width,plan.chair.depth,pose.r),bp);const baseDistance=circleHits(pose,plan.chair.base/2,bp)?0:Math.min(...bp.map((pt,j)=>pointSegmentDistance(pose,pt,bp[(j+1)%bp.length])))-plan.chair.base/2;minBedClearance=Math.min(minBedClearance??Infinity,bodyDistance,Math.max(0,baseDistance));}if(hits.length&&firstBlocked===null)firstBlocked=n/120;hits.forEach(h=>pathHits.add(h));}
 const rear=plan.chair.depth-plan.chair.tuck;const seatedGap=gap===null?null:gap-Math.max(rear,plan.chair.depth/2-plan.chair.tuck+plan.chair.base/2);
 return {issues,gap,spare,wallFit,seatedGap,minBedClearance,aligned,firstBlocked,pathHits:[...pathHits],area:plan.room.width*plan.room.length/144};
}
export function drawerZones(plan:Plan){const b=plan.items.find(i=>i.id==='bed'&&i.visible);if(!b)return [];return [-1,1].map(side=>{const p=transform({x:side*(b.w/2+plan.drawerExtension/2),z:7},b,b.r);const poly=rect(p.x,p.z,plan.drawerExtension,Math.max(8,b.d-22),b.r);const blocked=outside(poly,plan.room)||plan.items.some(i=>i.visible&&i.id!==b.id&&overlap(poly,polygon(i)));return {poly,blocked,side};});}
export function validPlan(value:unknown):value is Plan{if(!value||typeof value!=='object')return false;const p=value as Plan;if(p.version!==1||!p.room||!p.chair||!Array.isArray(p.items)||p.items.length>40)return false;const finite=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;const color=(s:unknown)=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);if(!finite(p.room.width,40,600)||!finite(p.room.length,40,600)||!finite(p.room.height,48,200)||!finite(p.room.solid,0,p.room.width)||!finite(p.room.error,0,12)||!color(p.room.wall)||!color(p.room.floor)||!finite(p.drawerExtension,0,60))return false;for(const k of ['width','depth','base','height','armHeight'] as const)if(!finite(p.chair[k],1,70))return false;if(!finite(p.chair.tuck,0,Math.min(p.chair.depth,24))||!finite(p.chair.pull,0,40)||!finite(p.chair.angle,-90,90)||!finite(p.chair.lateral,-100,100)||typeof p.chair.arms!=='boolean')return false;return new Set(p.items.map(i=>i.id)).size===p.items.length&&p.items.every(i=>typeof i.id==='string'&&typeof i.name==='string'&&i.name.length<=100&&['bed','desk','nightstand','cabinet'].includes(i.kind)&&['w','d','h'].every(k=>finite(i[k as 'w'],1,300))&&finite(i.x,-300,900)&&finite(i.z,-300,900)&&finite(i.r,-360,360)&&color(i.color)&&typeof i.visible==='boolean'&&typeof i.locked==='boolean'&&(!i.source||i.source.startsWith('https://www.ikea.com/')));}
