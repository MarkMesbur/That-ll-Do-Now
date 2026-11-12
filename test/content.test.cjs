const { test } = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const script = fs.readFileSync('extension/content.js', 'utf8');
async function setup(url, saved = {}) {
 const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {url, runScripts:'outside-only', pretendToBeVisual:true});
 let listener;
 const NativeObserver = dom.window.MutationObserver; const observers = [];
 dom.window.MutationObserver = class extends NativeObserver { constructor(fn) { super(fn); observers.push(this); } };
 const close = dom.window.close.bind(dom.window); dom.window.close = () => { observers.forEach(o => o.disconnect()); close(); };
 dom.window.chrome = {storage:{local:{get:(_keys, cb)=>cb(saved)},onChanged:{addListener:fn=>listener=fn}}};
 dom.window.eval(script);
 await new Promise(r=>setTimeout(r,40));
 return {dom, change:(changes)=>listener(changes,'local')};
}
for (const [url, blocked] of [
 ['https://www.youtube.com/shorts/123',true],['https://www.youtube.com/watch?v=123',false],
 ['https://www.reddit.com/',true],['https://www.reddit.com/r/popular/',true],['https://www.reddit.com/r/test/comments/123/post/',false],
 ['https://www.instagram.com/reels/',true],['https://www.instagram.com/',false],
 ['https://www.tiktok.com/foryou',true],['https://www.tiktok.com/@example',false]
]) test(url, async()=>{const {dom}=await setup(url); assert.equal(!!dom.window.document.querySelector('#focus-blocker-overlay'),blocked); dom.window.close();});
test('settings remove overlay immediately', async()=>{const {dom,change}=await setup('https://www.reddit.com/'); change({redditFeeds:{newValue:false}}); await new Promise(r=>setTimeout(r,40)); assert.equal(dom.window.document.querySelector('#focus-blocker-overlay'),null);dom.window.close();});
test('navigation to an allowed page removes overlay', async()=>{const {dom}=await setup('https://www.reddit.com/'); dom.window.history.pushState({},'', '/r/example/comments/123/post');dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate')); await new Promise(r=>setTimeout(r,40));assert.equal(dom.window.document.querySelector('#focus-blocker-overlay'),null);dom.window.close();});
test('shorts hiding style updates on settings change',async()=>{const {dom,change}=await setup('https://www.youtube.com/');assert.match(dom.window.document.querySelector('#focus-blocker-style').textContent,/shorts/);change({youtubeShorts:{newValue:false}});await new Promise(r=>setTimeout(r,40));assert.equal(dom.window.document.querySelector('#focus-blocker-style').textContent,'');dom.window.close();});
