const fs=require('fs'), vm=require('vm');
function Sheet(name, grid){ this.name=name; this.g=grid||[]; }
Sheet.prototype.getLastRow=function(){return this.g.length;};
Sheet.prototype.getLastColumn=function(){return this.g.reduce((m,r)=>Math.max(m,r.length),0);};
Sheet.prototype.clear=function(){this.g=[];return this;};
Sheet.prototype.setFrozenRows=function(){return this;};
Sheet.prototype.autoResizeColumns=function(){return this;};
Sheet.prototype.getRange=function(r,c,nr,nc){const sh=this;return{
  getValues(){const o=[];for(let i=0;i<nr;i++){const row=sh.g[r-1+i]||[];const out=[];for(let j=0;j<nc;j++)out.push(row[c-1+j]===undefined?'':row[c-1+j]);o.push(out);}return o;},
  setValues(v){v.forEach((row,i)=>{sh.g[r-1+i]=sh.g[r-1+i]||[];row.forEach((x,j)=>sh.g[r-1+i][c-1+j]=x);});return this;},
  setFontWeight(){return this;}, setBackground(){return this;}};};
const ss={sheets:{}, getSheetByName(n){return this.sheets[n]||null;}, insertSheet(n){return this.sheets[n]=new Sheet(n);}};
// old schema Numbers tab
ss.sheets.Numbers=new Sheet('Numbers',[['id','question','answer','unit','fact','source'],
  ['n1','How many babies?',385000,'per day','fact','src']]);
const bag={SHEET_ID:'X'};
const store={getProperty:k=>bag[k]||null, setProperty:(k,v)=>{bag[k]=v;}};
const ctx=vm.createContext({CacheService:{getScriptCache:()=>({get:()=>null,put:()=>{}})},
  PropertiesService:{getScriptProperties:()=>store},
  SpreadsheetApp:{openById:()=>ss}, console});
vm.runInContext(fs.readFileSync('src/Content.gs','utf8'),ctx);
const out=vm.runInContext('content()',ctx);
const n=out.numbers[0];
console.log('repaired header:', ss.sheets.Numbers.g[0].join('|'));
console.log('rows now:', ss.sheets.Numbers.g.length-1);
console.log('first question type/answer/options:', n.type, n.answer, JSON.stringify(n.options));
if(n.type!=='mc'||n.options.length!==4||!'ABCD'.includes(n.answer)) { console.log('FAIL'); process.exit(1); }
// second call: headers now fine, no rewrite
const before=JSON.stringify(ss.sheets.Numbers.g);
vm.runInContext('content()',ctx);
console.log('stable on second read:', before===JSON.stringify(ss.sheets.Numbers.g));
