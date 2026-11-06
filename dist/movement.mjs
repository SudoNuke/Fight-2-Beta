export const ARENA_WIDTH=2600,MIN_X=140,MAX_X=ARENA_WIDTH-140;
export class DoubleTap{
 constructor(windowMs=280){this.windowMs=windowMs;this.reset()}
 reset(){this.last=[null,null]}
 press(player,direction,time){const previous=this.last[player];if(previous&&previous.direction===direction&&time-previous.time<=this.windowMs&&time>previous.time){this.last[player]=null;return true}this.last[player]={direction,time};return false}
}
export class Camera{
 constructor(){this.x=ARENA_WIDTH/2;this.zoom=.68}
 reset(fighters){this.x=(fighters[0].x+fighters[1].x)/2;this.zoom=.68}
 update(fighters,dt){const distance=Math.abs(fighters[0].x-fighters[1].x);const targetZoom=Math.max(1200/ARENA_WIDTH,Math.min(.68,960/(distance+270)));this.zoom+=(targetZoom-this.zoom)*(1-Math.exp(-dt*5));this.zoom=Math.min(this.zoom,1200/(distance+280));const half=600/this.zoom;const center=(fighters[0].x+fighters[1].x)/2;const targetX=Math.max(half,Math.min(ARENA_WIDTH-half,center));this.x+=(targetX-this.x)*(1-Math.exp(-dt*6));const low=Math.max(...fighters.map(f=>f.x))+140-half,high=Math.min(...fighters.map(f=>f.x))-140+half;this.x=Math.max(low,Math.min(high,this.x));this.x=Math.max(half,Math.min(ARENA_WIDTH-half,this.x))}
 get left(){return this.x-600/this.zoom}
}
