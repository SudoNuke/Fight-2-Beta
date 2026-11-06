import assert from'node:assert/strict';import{MIN_X,MAX_X}from'../dist/movement.mjs';import{Fight,TOTAL,frameAt}from'../dist/fight-core.mjs';
const fresh=()=>{const g=new Fight(()=>.5);g.start({mode:'local'});g.phase='fight';g.fighters[0].x=490;g.fighters[1].x=690;return g};const advance=(g,seconds,inputs=[{},{}])=>{for(let t=0;t<seconds;t+=.01)g.update(.01,inputs)};
{
let g=fresh();g.action(0,'punch');advance(g,.7);assert.equal(g.fighters[1].hp,91);assert.equal(g.fighters[0].action,'idle');assert.equal(g.events.filter(e=>e.type==='hit').length,1);
}
for(const type of['jump','dodge']){let g=fresh();g.fighters[1].action=type;g.fighters[1].frame=3;g.fighters[0].action='punch';assert.equal(g.hit(0,1),false);assert.equal(g.fighters[1].hp,100)}
{let g=fresh();g.fighters[1].action='block';g.fighters[1].frame=3;g.fighters[0].action='kick';g.hit(0,1);assert.equal(g.fighters[1].hp,98);assert.equal(g.fighters[1].energy,91)}
{let g=fresh();g.fighters[1].x=900;g.action(0,'kick');advance(g,.8);assert.equal(g.fighters[1].hp,100)}
{let g=fresh();g.fighters[0].energy=27;assert.equal(g.action(0,'dodge'),false);g.fighters[0].energy=100;assert.equal(g.action(0,'dodge'),true);assert.equal(g.fighters[0].energy,72)}
{let g=fresh();advance(g,1,[{block:true},{}]);assert.equal(g.fighters[0].action,'block');assert.equal(g.fighters[0].frame,3);advance(g,.6);assert.equal(g.fighters[0].action,'idle')}
{let g=fresh();g.timer=.01;g.fighters[1].hp=30;g.update(.02);assert.equal(g.phase,'roundOver');assert.deepEqual(g.wins,[1,0]);advance(g,3);assert.equal(g.round,2);assert.equal(g.fighters[1].hp,100);advance(g,3);g.endRound(0);assert.equal(g.phase,'matchOver');assert.equal(g.winner,0)}
{let g=fresh();g.timer=.01;g.update(.02);assert.equal(g.roundWinner,null);assert.deepEqual(g.wins,[0,0])}
{let g=fresh();g.paused=true;g.action(0,'punch');advance(g,2);assert.equal(g.timer,60);assert.equal(g.fighters[0].action,'idle')}
{let g=fresh();g.fighters[0].x=140;g.fighters[1].x=150;g.update(.01);assert.ok(g.fighters[0].x>=140);assert.ok(g.fighters[1].x-g.fighters[0].x>=158)}
{let g=fresh();g.mode='cpu';advance(g,12);assert.ok(g.fighters[0].hp<100,'CPU attacks player');assert.ok(g.fighters.every(f=>f.x>=MIN_X&&f.x<=MAX_X))}
{let g=fresh();g.fighters.forEach(f=>{f.hp=9;f.action='punch';f.t=.27;f.frame=3});g.update(.01);assert.equal(g.roundWinner,null);assert.deepEqual(g.fighters.map(f=>f.hp),[0,0])}
for(const type of Object.keys(TOTAL)){assert.equal(frameAt(type,0),0);assert.equal(frameAt(type,TOTAL[type]),5)}
console.log('Passed: damage once, range, jump/dodge evasion, block chip, dodge energy, held block, round progression, match victory, draw, pause, collision bounds, CPU combat, simultaneous KO, frame timing.');
