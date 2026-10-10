
(() => {
  const $=id=>document.getElementById(id);
  const ids=["cost","packing","platformFee","dynamicFee","logistics","promoFee","affiliateFee","adsFee","targetMargin","sellerVoucher"];
  const presets={
    shopee:{label:"Shopee",platformFee:9,fixedFee:1250,note:"Preset biaya tetap Shopee Rp1.250 aktif. Tarif persentase tetap dapat diedit."},
    tiktok:{label:"TikTok Shop",platformFee:9,fixedFee:0,note:"Preset contoh TikTok Shop aktif. Sesuaikan komisi dan biaya aktual dari Seller Center."},
    tokopedia:{label:"Tokopedia",platformFee:9,fixedFee:0,note:"Preset contoh Tokopedia aktif. Sesuaikan komisi dan biaya aktual dari Seller Center."}
  };
  let market="shopee";
  const n=id=>Math.max(0,Number($(id).value)||0);
  const rp=v=>"Rp"+new Intl.NumberFormat("id-ID").format(Math.round(Math.abs(v)));
  const pct=v=>new Intl.NumberFormat("id-ID",{minimumFractionDigits:v%1?1:0,maximumFractionDigits:2}).format(v)+"%";
  const round100=v=>Math.ceil(v/100)*100;

  function calc(){
    const base=n("cost")+n("packing")+n("logistics"), voucher=n("sellerVoucher");
    const pph=$("pph22").checked?.5:0;
    const ratePct=n("platformFee")+n("dynamicFee")+n("promoFee")+n("affiliateFee")+n("adsFee")+pph;
    const margin=Math.min(95,n("targetMargin"))/100, rate=ratePct/100, fixed=presets[market].fixedFee;
    const d=1-rate-margin;
    $("totalRate").textContent=pct(ratePct);
    if(d<=0){$("minPrice").textContent="Tidak dapat dihitung";["profitEstimate","actualMargin","transactionPrice","marketDeductions","netReceived","totalCost","profit"].forEach(id=>$(id).textContent="—");return;}
    const price=round100((base+fixed+voucher)/d);
    const afterVoucher=Math.max(0,price-voucher);
    const deductions=price*rate+fixed;
    const received=afterVoucher-deductions;
    const profit=received-base;
    const actual=price?profit/price*100:0;
    $("minPrice").textContent=rp(price);
    $("profitEstimate").textContent=rp(profit);
    $("actualMargin").textContent=pct(actual);
    $("transactionPrice").textContent=rp(afterVoucher);
    $("marketDeductions").textContent="−"+rp(deductions);
    $("netReceived").textContent=rp(received);
    $("totalCost").textContent="−"+rp(base);
    $("profit").textContent=rp(profit);
  }

  function setMarket(m){
    market=m;
    document.querySelectorAll(".market-tab").forEach(b=>b.classList.toggle("active",b.dataset.market===m));
    const p=presets[m];
    $("platformFee").value=p.platformFee;
    $("presetNote").textContent=p.note;
    $("marketBadge").textContent=p.label.toUpperCase();
    $("fixedFeeNote").textContent=`Kalkulator estimasi satu produk per pesanan. ${p.fixedFee?`Biaya tetap ${rp(p.fixedFee)} otomatis dimasukkan untuk preset ${p.label}.`:`Tidak ada biaya tetap otomatis pada preset ${p.label}.`} Belum memodelkan plafon komisi, PPN keluaran untuk PKP, biaya retur, penalti, atau syarat khusus promo. Gunakan tarif aktual di Seller Center sebelum menetapkan harga final.`;
    calc();
  }

  ids.forEach(id=>$(id).addEventListener("input",calc));
  $("pph22").addEventListener("change",calc);
  document.querySelectorAll(".market-tab").forEach(b=>b.addEventListener("click",()=>setMarket(b.dataset.market)));
  $("resetCalc").addEventListener("click",()=>{
    Object.assign($("cost"),{value:50000});$("packing").value=2000;$("dynamicFee").value=0;$("logistics").value=0;$("promoFee").value=0;$("affiliateFee").value=0;$("adsFee").value=0;$("targetMargin").value=20;$("sellerVoucher").value=0;$("pph22").checked=true;setMarket("shopee");
  });
  $("copyResult").addEventListener("click",async()=>{
    const text=`Take a peek. — Kalkulator Marketplace
Marketplace: ${presets[market].label}
Harga jual minimum: ${$("minPrice").textContent}
Total tarif: ${$("totalRate").textContent}
Laba estimasi: ${$("profitEstimate").textContent}
Margin aktual: ${$("actualMargin").textContent}
Estimasi dana masuk: ${$("netReceived").textContent}`;
    try{await navigator.clipboard.writeText(text);$("copyStatus").textContent="Tersalin ✓"}catch(e){$("copyStatus").textContent="Gagal menyalin"}
    setTimeout(()=>$("copyStatus").textContent="",1800);
  });
  setMarket("shopee");
})();
