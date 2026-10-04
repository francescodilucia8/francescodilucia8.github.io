import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const url=process.env.VERIFY_URL||'http://127.0.0.1:4322/';
if(!/^https?:\/\/(127\.0\.0\.1|localhost|francescodilucia8\.github\.io)(?::\d+)?\//.test(url))throw new Error('Use the local or published portfolio only');
const base=new URL(url).pathname;
const output=process.env.VERIFY_OUTPUT||'build-notes/languages';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const results=[];const check=async(name,run)=>{try{await run();results.push({name,status:'passed'});}catch(error){results.push({name,status:'failed',detail:error.message});}console.log(results.at(-1));};
for(const [locale,expected] of [['it-IT','it'],['it-CH','it'],['en-US','en'],['en-GB','en'],['fr-FR','en']]){
 await check('Browser default '+locale,async()=>{const context=await browser.newContext({locale});const page=await context.newPage();await page.goto(url);await page.waitForFunction(lang=>document.documentElement.lang===lang,expected);assert.equal(new URL(page.url()).pathname,base+(expected==='it'?'it/':''));await context.close();});
}
await check('Preferred supported language in browser list',async()=>{const context=await browser.newContext();await context.addInitScript(()=>Object.defineProperty(navigator,'languages',{get:()=>['de-DE','it-CH','en-US']}));const page=await context.newPage();await page.goto(url);await page.waitForURL(url+'it/');await context.close();});
await check('Saved preference, case route, query, anchor and keyboard switch',async()=>{
 const context=await browser.newContext({locale:'it-IT'});const page=await context.newPage();await page.goto(url+'work/local-ai/?source=check#main');await page.waitForURL(url+'it/work/local-ai/?source=check#main');
 const switcher=page.getByRole('link',{name:'Passa all’inglese'});await switcher.focus();await page.keyboard.press('Enter');await page.waitForURL(url+'work/local-ai/?source=check&lang=en#main');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.goto(url);assert.equal(new URL(page.url()).pathname,base);assert.equal(await page.evaluate(()=>localStorage.getItem('portfolio-language')),'en');
 await page.getByRole('link',{name:'Switch to Italian'}).click();await page.waitForURL(url+'it/?lang=it');await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'it');
 await page.goto(url+'it/work/multispectral-thesis/');assert.equal(await page.locator('html').getAttribute('lang'),'it');await page.goBack();assert.equal(await page.locator('html').getAttribute('lang'),'it');await context.close();
});
await check('Disabled storage still follows browser language and allows a switch',async()=>{
 const context=await browser.newContext({locale:'it-IT'});await context.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};});
 const page=await context.newPage();await page.goto(url);await page.waitForURL(url+'it/');await page.getByRole('link',{name:'Passa all’inglese'}).click();await page.waitForURL(url+'?lang=en');assert.equal(await page.locator('html').getAttribute('lang'),'en');await context.close();
});
await check('Italian content, routes, SEO, motion and phone layouts',async()=>{
 const context=await browser.newContext({locale:'it-IT',viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const route of ['','work/multispectral-thesis/','work/local-ai/','work/bounded-agents/','404/']){
  await page.goto(url+'it/'+route);await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'it');assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('link[hreflang="en"]').count());
  if(route==='work/multispectral-thesis/'){
   const stage=page.getByRole('button',{name:'03 / Regione e maschera'});await stage.click();assert.equal(await page.locator('.stage-label').innerText(),'Regione e maschera');
   await page.getByRole('button',{name:'Ripeti l’animazione della tesi'}).click();await page.getByRole('button',{name:'Metti in pausa l’animazione della tesi'}).click();assert.equal(await page.locator('[data-thesis]').getAttribute('data-playing'),'false');
  }
 }
 for(const width of [320,360,390,430,768,844,1440]){
  await page.setViewportSize({width,height:1000});await page.goto(url+'it/');await page.evaluate(()=>document.fonts.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+width);
  await page.locator('.portrait-block').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();window.scrollTo({top:0,behavior:'instant'});});
  await page.waitForFunction(()=>scrollY===0);
  await page.screenshot({path:output+'/it-'+width+'.png',fullPage:true});
  if(width===390||width===1440){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>scrollY===0);await page.screenshot({path:output+'/it-cover-'+width+'.png'});}
  if(width===320){await page.getByRole('button',{name:'Menu',exact:true}).click();await page.getByRole('link',{name:'Chi sono',exact:true}).click();assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'),'false');}
  await page.goto(url+'it/work/multispectral-thesis/');await page.getByRole('button',{name:'03 / Regione e maschera'}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===320||width===1440){await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});await page.locator('[data-thesis]').screenshot({path:output+'/it-thesis-'+width+'.png'});}
 }
 assert.deepEqual(errors,[]);await context.close();
});
await check('Italian reduced motion and no-JavaScript content',async()=>{
 const context=await browser.newContext({locale:'it-IT',reducedMotion:'reduce'});const page=await context.newPage();const requests=[];page.on('request',req=>requests.push(req.url()));await page.goto(url+'it/work/multispectral-thesis/');await page.getByRole('button',{name:'Mostra la fase successiva della tesi'}).click();assert.equal(await page.locator('.stage-label').innerText(),'Allinea le bande');assert.ok(!requests.some(req=>/gsap/i.test(req)));await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:568}});const p=await nojs.newPage();await p.goto(url+'it/');await p.getByRole('link',{name:'Esplora lo studio'}).click();assert.equal(await p.locator('.stage-static').count(),8);assert.equal(await p.locator('html').getAttribute('lang'),'it');await p.getByRole('link',{name:'Passa all’inglese'}).click();assert.equal(await p.locator('html').getAttribute('lang'),'en');await nojs.close();
});
await check('Axe accessibility on all ten localized pages',async()=>{
 const reports=[];
 for(const language of ['en','it']){
  const context=await browser.newContext({locale:language==='it'?'it-IT':'en-US'});const page=await context.newPage();
  for(const route of ['','work/multispectral-thesis/','work/local-ai/','work/bounded-agents/',language==='it'?'404/':'404.html']){
   await page.goto(url+(language==='it'?'it/':'')+route);const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();reports.push({language,route,violations:report.violations});
  }
  await context.close();
 }
 await writeFile(output+'/axe.json',JSON.stringify(reports,null,2));assert.deepEqual(reports.flatMap(report=>report.violations.map(v=>({language:report.language,route:report.route,id:v.id,impact:v.impact}))),[]);
});
await writeFile(output+'/results.json',JSON.stringify({url,browser:browser.version(),results},null,2));await browser.close();if(results.some(result=>result.status==='failed'))process.exitCode=1;
