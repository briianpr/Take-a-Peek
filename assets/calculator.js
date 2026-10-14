(() => {
  const $ = id => document.getElementById(id);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const body = document.body;

  const categoryData = {
    fashion:     { label:"Fashion & Aksesori", regular:8.25, mall:9.95, shipN:6.5, shipS:8 },
    beauty:      { label:"Kecantikan & Perawatan", regular:10, mall:11.70, shipN:5.5, shipS:7 },
    food:        { label:"Makanan & Minuman", regular:10, mall:10.20, shipN:6.5, shipS:8 },
    home:        { label:"Rumah Tangga & Dapur", regular:10, mall:11.70, shipN:6, shipS:7.5 },
    electronics: { label:"Elektronik & Gadget", regular:9.5, mall:10.45, shipN:5.5, shipS:7 },
    highend:     { label:"HP / Elektronik High-end", regular:5.25, mall:6.20, shipN:5.5, shipS:7 },
    supplement:  { label:"Suplemen & Susu Formula", regular:6.75, mall:7.70, shipN:6.5, shipS:8 },
    jewelry:     { label:"Logam Mulia & Perhiasan", regular:4.25, mall:4.70, shipN:2, shipS:3.5 },
    manual:      { label:"Kategori lain / manual", regular:8.25, mall:9.95, shipN:0, shipS:0 }
  };

  let calcMode = "profit";
  let uiMode = "simple";
  let lastAutoAdmin = null;
  let lastAutoShip = null;

  const n = id => Math.max(0, Number($(id)?.value) || 0);
  const isOn = id => !!$(id)?.checked;
  const sellerType = () => document.querySelector('input[name="sellerType"]:checked')?.value || "star";
  const category = () => categoryData[$("category").value] || categoryData.manual;
  const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
  const idr = value => "Rp" + new Intl.NumberFormat("id-ID").format(Math.round(Math.abs(value)));
  const negativeIdr = value => value > .5 ? "−" + idr(value) : "Rp0";
  const signedIdr = value => (value < -.5 ? "−" : value > .5 ? "+" : "") + idr(value);
  const percent = value => new Intl.NumberFormat("id-ID",{minimumFractionDigits:2,maximumFractionDigits:2}).format(value) + "%";
  const shortPercent = value => new Intl.NumberFormat("id-ID",{minimumFractionDigits:value%1?1:0,maximumFractionDigits:2}).format(value) + "%";

  function updateAutoPresets(force=false){
    const seller = sellerType();
    const c = category();
    const exempt = seller === "nonstar" && isOn("newSellerExempt");
    const autoAdmin = exempt ? 0 : seller === "mall" ? c.mall : c.regular;
    const currentAdmin = n("adminRate");
    if(force || lastAutoAdmin === null || Math.abs(currentAdmin-lastAutoAdmin)<.001){
      $("adminRate").value = autoAdmin;
    }
    lastAutoAdmin = autoAdmin;

    const autoShip = $("productSize").value === "special" ? c.shipS : c.shipN;
    const currentShip = n("freeShipRate");
    if(force || lastAutoShip === null || Math.abs(currentShip-lastAutoShip)<.001){
      $("freeShipRate").value = autoShip;
    }
    lastAutoShip = autoShip;

    $("exemptionRow").classList.toggle("hidden",seller!=="nonstar");
    $$(".mall-only").forEach(el=>el.classList.toggle("hidden",seller!=="mall"));
    $("sellerBadge").textContent = seller === "mall" ? "MALL" : seller === "star" ? "STAR" : "NON-STAR";
    $("freeShipCapLabel").textContent = $("productSize").value === "special" ? "Cap Rp60.000/unit" : "Cap Rp40.000/unit";

    if(exempt){
      $("processFee").value = 0;
    } else if(force && n("processFee")===0){
      $("processFee").value = 1250;
    }
  }

  function feeModel(unitPrice){
    const qty = Math.max(1,Math.round(n("qty")));
    const gross = Math.max(0,unitPrice*qty);
    const voucher = Math.min(gross,n("sellerVoucher"));
    const feeBase = Math.max(0,gross-voucher);
    const hpp = n("hpp")*qty;
    const packing = n("packing");
    const logistics = n("logistics");
    const otherFixed = n("otherFixed");
    const operating = hpp+packing+logistics+otherFixed;

    const admin = feeBase*n("adminRate")/100;
    const mallPayment = sellerType()==="mall" ? Math.min(feeBase*.018,50000*qty) : 0;
    const process = n("processFee");
    const pph = isOn("pph22") ? feeBase*.005 : 0;

    const freeCap = ($("productSize").value==="special" ? 60000 : 40000)*qty;
    const freeShip = isOn("freeShipOn") ? Math.min(feeBase*n("freeShipRate")/100,freeCap) : 0;
    const promo = isOn("promoOn") ? Math.min(feeBase*n("promoRate")/100,60000*qty) : 0;
    const preorder = isOn("preorderOn") ? feeBase*.03 : 0;
    const spay = isOn("spayOn") ? feeBase*(Number($("spayTenor").value)||0)/100 : 0;

    const affiliate = feeBase*n("affiliateRate")/100;
    const ads = feeBase*n("adsRate")/100;
    const live = feeBase*n("liveRate")/100;
    const insurance = feeBase*n("insuranceRate")/100;

    const mandatory = admin+mallPayment+process+pph;
    const optional = freeShip+promo+preorder+spay;
    const otherVariable = affiliate+ads+live+insurance;
    const fees = mandatory+optional+otherVariable;
    const netReceived = feeBase-fees;
    const profit = netReceived-operating;
    const margin = gross>0 ? profit/gross*100 : 0;
    const effectiveCut = gross>0 ? (fees+voucher)/gross*100 : 0;
    const beforeAdsProfit = profit+ads;
    const breakEvenRoas = beforeAdsProfit>0 ? gross/beforeAdsProfit : 0;

    return {qty,gross,voucher,feeBase,hpp,packing,logistics,otherFixed,operating,admin,mallPayment,process,pph,freeShip,promo,preorder,spay,affiliate,ads,live,insurance,mandatory,optional,otherVariable,fees,netReceived,profit,margin,effectiveCut,breakEvenRoas};
  }

  function findPrice(targetMarginPct){
    const target = Math.max(0,targetMarginPct)/100;
    let low=0;
    let high=Math.max(1000,n("hpp")*3+100000);
    for(let i=0;i<36;i++){
      const f=feeModel(high);
      if(f.profit>=f.gross*target) break;
      high*=1.6;
      if(high>1e9) return 0;
    }
    for(let i=0;i<72;i++){
      const mid=(low+high)/2;
      const f=feeModel(mid);
      if(f.profit>=f.gross*target) high=mid; else low=mid;
    }
    return Math.ceil(high/500)*500;
  }

  function health(margin){
    if(margin>=20) return {label:"CUAN SEHAT",color:"#6ee7a8",bg:"rgba(110,231,168,.10)"};
    if(margin>=10) return {label:"CUAN TIPIS",color:"#ffd36a",bg:"rgba(255,211,106,.10)"};
    if(margin>=0) return {label:"RAWAN",color:"#ffad72",bg:"rgba(255,173,114,.10)"};
    return {label:"RUGI",color:"#ff7c83",bg:"rgba(255,124,131,.10)"};
  }

  function setText(id,value){ if($(id)) $(id).textContent=value; }
  function setCost(id,value){ setText(id,negativeIdr(value)); }

  function renderSaved(){
    let saved=[];
    try{saved=JSON.parse(localStorage.getItem("tapModernScenarios")||"[]");}catch(e){}
    const list=$("savedScenarioList");
    if(!saved.length){list.innerHTML='<span class="empty-state">Belum ada skenario tersimpan.</span>';return;}
    list.innerHTML=saved.map((item,i)=>`<div class="saved-item"><span>${item.category} • ${item.seller}</span><b>${idr(item.price)} · ${signedIdr(item.profit)}</b><button type="button" data-delete-scenario="${i}">×</button></div>`).join("");
    $$('[data-delete-scenario]').forEach(btn=>btn.addEventListener('click',()=>{
      saved.splice(Number(btn.dataset.deleteScenario),1);
      localStorage.setItem("tapModernScenarios",JSON.stringify(saved));
      renderSaved();
    }));
  }

  function scenarioCard(price,label,current=false){
    const f=feeModel(price);
    return `<article class="scenario${current?' current':''}"><span>${label}</span><strong>${idr(price)}</strong><b>${signedIdr(f.profit)} · ${percent(f.margin)}</b></article>`;
  }

  function calculate(){
    updateAutoPresets(false);
    const bep=findPrice(0);
    const target=findPrice(n("targetMargin"));
    const displayPrice=calcMode==="target"?target:n("salePrice");
    const f=feeModel(displayPrice);
    const h=health(f.margin);

    setCost("adminCost",f.admin);
    setCost("mallPaymentCost",f.mallPayment);
    setCost("processCost",f.process);
    setCost("pphCost",f.pph);
    setCost("freeShipCost",f.freeShip);
    setCost("promoCost",f.promo);
    setCost("preorderCost",f.preorder);
    setCost("spayCost",f.spay);

    setText("mandatoryChip",idr(f.mandatory));
    setText("mandatorySubtotal",negativeIdr(f.mandatory));
    setText("optionalSubtotal",negativeIdr(f.optional));
    setText("otherSubtotal",negativeIdr(f.otherVariable+f.packing+f.logistics+f.otherFixed));

    setCost("dAdmin",f.admin);setCost("dMall",f.mallPayment);setCost("dProcess",f.process);setCost("dPph",f.pph);
    setCost("dFree",f.freeShip);setCost("dPromo",f.promo);setCost("dPre",f.preorder);setCost("dSpay",f.spay);
    setCost("dAffiliate",f.affiliate);setCost("dAds",f.ads);setCost("dLive",f.live);setCost("dInsurance",f.insurance);setCost("dFixed",f.packing+f.logistics+f.otherFixed);

    setText("profitMain",signedIdr(f.profit));
    setText("marginMain",percent(f.margin));
    setText("grossRevenue",idr(f.gross));
    setText("netReceived",idr(f.netReceived));
    setText("profitPerUnit",signedIdr(f.profit/f.qty));
    setText("bepPrice",idr(bep));
    setText("targetPrice",idr(target));
    setText("healthLabel",h.label);
    setText("healthPill",h.label);
    $("healthLabel").style.background=h.color;
    $("healthLabel").style.color="#1a1714";
    $("healthPill").style.color=h.color;
    $("healthPill").style.borderColor=h.color+"55";
    $("healthPill").style.background=h.bg;
    $("profitMain").style.color=h.color;

    const c=category();
    const extras=[];
    if(isOn("freeShipOn")) extras.push(`Gratis Ongkir ${shortPercent(n("freeShipRate"))}`);
    if(isOn("promoOn")) extras.push(`Promo XTRA ${shortPercent(n("promoRate"))}`);
    if(isOn("pph22")) extras.push("PPh22 0,5%");
    const seller=sellerType()==="mall"?"Mall":sellerType()==="star"?"Star":"Non-Star";
    setText("assumptionText",`${seller} • ${c.label} • Admin ${shortPercent(n("adminRate"))}${extras.length?' • '+extras.join(' • '):''}`);

    const total=Math.max(1,f.gross);
    const hppShare=clamp(f.hpp/total*100,0,100);
    const feeShare=clamp((f.fees+f.voucher+f.packing+f.logistics+f.otherFixed)/total*100,0,100);
    const profitShare=clamp(Math.max(0,f.profit)/total*100,0,100);
    const hppEnd=hppShare;
    const feeEnd=Math.min(100,hppShare+feeShare);
    $("donutChart").style.background=`conic-gradient(#ff9b47 0 ${hppEnd}%,#ff6078 ${hppEnd}% ${feeEnd}%,#6ee7a8 ${feeEnd}% 100%)`;
    setText("donutMargin",percent(f.margin));
    setText("hppShare",percent(hppShare));
    setText("feeShare",percent(feeShare));
    setText("profitShare",percent(profitShare));
    setText("econHpp",idr(f.hpp));
    setText("econFees",idr(f.fees+f.voucher+f.packing+f.logistics+f.otherFixed));
    setText("econProfit",signedIdr(f.profit));
    const roas=f.breakEvenRoas?f.breakEvenRoas.toFixed(2).replace('.',',')+'×':'—';
    setText("breakEvenRoas",roas);setText("sideRoas",roas);setText("effectiveCut",percent(f.effectiveCut));

    const activePrice=displayPrice;
    $("scenarioGrid").innerHTML=scenarioCard(Math.max(500,Math.round(activePrice*.9/500)*500),"Harga −10%")+scenarioCard(activePrice,"Harga aktif",true)+scenarioCard(Math.round(activePrice*1.1/500)*500,"Harga +10%");
    setText("resultTitle",calcMode==="target"?"Harga target":"Laba bersih");
  }

  function setCalcMode(mode){
    calcMode=mode;
    $$('[data-calc-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.calcMode===mode));
    $$('.profit-only').forEach(el=>el.classList.toggle('hidden',mode!=="profit"));
    $$('.target-only').forEach(el=>el.classList.toggle('hidden',mode!=="target"));
    setText("modeDescription",mode==="profit"?"Masukkan harga jual untuk melihat laba bersih.":"Masukkan target margin untuk mencari harga jual minimum.");
    calculate();
  }

  function setUiMode(mode){
    uiMode=mode;
    body.classList.toggle("simple-ui",mode==="simple");
    $$('[data-ui-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.uiMode===mode));
    calculate();
  }

  function summaryText(){
    const price=calcMode==="target"?findPrice(n("targetMargin")):n("salePrice");
    const f=feeModel(price);
    return `Take a peek. — Kalkulator Shopee\nKategori: ${category().label}\nTipe toko: ${sellerType()}\nHarga/unit: ${idr(price)}\nQty/pesanan: ${f.qty}\nHPP/unit: ${idr(n("hpp"))}\nDana masuk: ${idr(f.netReceived)}\nTotal fee: ${idr(f.fees)}\nLaba bersih: ${signedIdr(f.profit)}\nMargin: ${percent(f.margin)}\nBEP/unit: ${idr(findPrice(0))}\nHarga target ${shortPercent(n("targetMargin"))}: ${idr(findPrice(n("targetMargin")))}\nROAS impas: ${f.breakEvenRoas?f.breakEvenRoas.toFixed(2)+'x':'-'}`;
  }

  async function copyText(text){
    try{await navigator.clipboard.writeText(text);setText("copyStatus","Tersalin ✓");}
    catch(e){setText("copyStatus","Clipboard diblokir browser");}
    setTimeout(()=>setText("copyStatus",""),1800);
  }

  function attach(){
    ["hpp","salePrice","targetMargin","qty","sellerVoucher","adminRate","processFee","freeShipRate","promoRate","affiliateRate","adsRate","liveRate","insuranceRate","packing","logistics","otherFixed"].forEach(id=>$(id)?.addEventListener("input",calculate));
    ["pph22","freeShipOn","promoOn","preorderOn","spayOn","newSellerExempt"].forEach(id=>$(id)?.addEventListener("change",()=>{if(id==="newSellerExempt")updateAutoPresets(true);calculate();}));
    ["productSize","spayTenor"].forEach(id=>$(id)?.addEventListener("change",()=>{if(id==="productSize")updateAutoPresets(true);calculate();}));
    $("category").addEventListener("change",()=>{updateAutoPresets(true);calculate();});
    $$('input[name="sellerType"]').forEach(r=>r.addEventListener("change",()=>{updateAutoPresets(true);calculate();}));
    $$('[data-calc-mode]').forEach(btn=>btn.addEventListener('click',()=>setCalcMode(btn.dataset.calcMode)));
    $$('[data-ui-mode]').forEach(btn=>btn.addEventListener('click',()=>setUiMode(btn.dataset.uiMode)));

    $("togglePrograms").addEventListener("click",()=>{
      const list=$("programList");
      const collapsed=list.classList.toggle("collapsed");
      $("togglePrograms").textContent=collapsed?"Buka":"Tutup";
    });

    $$('[data-breakdown]').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.dataset.breakdown;
      const detail=$(key+'Detail');
      detail.classList.toggle('hidden');
      btn.querySelector('em').textContent=detail.classList.contains('hidden')?'›':'⌄';
    }));

    $("useTargetPrice").addEventListener("click",()=>{$("salePrice").value=findPrice(n("targetMargin"));setCalcMode("profit");});
    $("copySummary").addEventListener("click",()=>copyText(summaryText()));
    $("copyAiPrompt").addEventListener("click",()=>copyText(`Analisis unit economics Shopee berikut. Beri saran harga, margin aman, dan biaya yang paling layak dioptimalkan.\n\n${summaryText()}`));
    $("printBtn").addEventListener("click",()=>window.print());

    $("saveScenario").addEventListener("click",()=>{
      const price=calcMode==="target"?findPrice(n("targetMargin")):n("salePrice");
      const f=feeModel(price);
      let saved=[];try{saved=JSON.parse(localStorage.getItem("tapModernScenarios")||"[]");}catch(e){}
      saved.unshift({category:category().label,seller:sellerType(),price,profit:f.profit});
      localStorage.setItem("tapModernScenarios",JSON.stringify(saved.slice(0,8)));
      renderSaved();
    });
    $("clearScenarios").addEventListener("click",()=>{localStorage.removeItem("tapModernScenarios");renderSaved();});
  }

  updateAutoPresets(true);
  attach();
  setUiMode("simple");
  setCalcMode("profit");
  renderSaved();
})();
