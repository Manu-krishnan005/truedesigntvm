(() => {
  const form = document.getElementById('td-rental-form');
  if (!form) return;
  const items = document.getElementById('td-rental-items');
  const preview = document.getElementById('td-rental-preview');
  const date = document.getElementById('td-rental-date');
  const options = ['Student Gowns','Faculty Gowns','PhD Gowns','Kids Gowns','Guest Gowns','Customised Hoodies','Graduation Stoles','Graduation Caps','Academic Oath Scrolls','Other item'];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = new Date(); const localToday = new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
  date.min = localToday;
  function addItem(name = '', quantity = 1) {
    const row = document.createElement('div'); row.className = 'td-rental-item';
    row.innerHTML = `<div class="td-rental-field"><label>Item *</label><select class="td-item-name" required><option value="">Choose an item</option>${options.map(o => `<option value="${escapeHTML(o)}">${escapeHTML(o)}</option>`).join('')}</select></div><div class="td-rental-field"><label>Quantity *</label><input class="td-item-qty" type="number" min="1" max="9999" step="1" required value="${Math.max(1,Math.min(9999,Number(quantity)||1))}"></div><button type="button" class="td-rental-remove" aria-label="Remove item">✕</button>`;
    row.querySelector('select').value = options.includes(name) ? name : (name ? 'Other item' : '');
    if (name && !options.includes(name)) {
      const other = document.createElement('input'); other.className='td-item-other'; other.placeholder='Specify item'; other.value=name; other.required=true; other.style.cssText='margin-top:7px;width:100%;border:1px solid #d6d8e0;padding:10px'; row.firstElementChild.appendChild(other);
    }
    row.querySelector('select').addEventListener('change', e => {
      row.querySelector('.td-item-other')?.remove();
      if(e.target.value === 'Other item') {
        const other=document.createElement('input'); other.className='td-item-other';other.placeholder='Specify item';other.required=true;other.style.cssText='margin-top:7px;width:100%;border:1px solid #d6d8e0;padding:10px';row.firstElementChild.appendChild(other);
      }
      update();
    });
    row.querySelector('.td-rental-remove').addEventListener('click', () => {if(items.children.length>1)row.remove();update();});
    items.appendChild(row);update();
  }
  function getItems(){return [...items.children].map(row=>({name:row.querySelector('.td-item-other')?.value.trim()||row.querySelector('.td-item-name').value,qty:Number(row.querySelector('.td-item-qty').value)}));}
  function selectedCall(){return form.querySelector('input[name="td-call"]:checked')?.value || 'Not selected';}
  function summaryLine(label,value){return `<div class="td-rental-summary-line"><strong>${escapeHTML(label)}</strong>${escapeHTML(value)}</div>`;}
  function update(){
    const list=getItems().filter(x=>x.name).map(x=>`${x.name} × ${x.qty||'—'}`).join('; ') || 'Choose your items';
    preview.innerHTML=summaryLine('ITEMS',list)+summaryLine('RENTAL DATE',date.value||'Choose a date')+summaryLine('PREFERRED CALL TIME',selectedCall())+summaryLine('SPECIAL INSTRUCTIONS',document.getElementById('td-rental-notes').value.trim()||'None');
  }
  document.getElementById('td-rental-add').addEventListener('click',()=>addItem());
  form.addEventListener('input',update);form.addEventListener('change',update);
  form.addEventListener('submit',event=>{
    event.preventDefault(); if(!form.reportValidity())return;
    const chosen=getItems(); if(chosen.some(x=>!x.name||!Number.isInteger(x.qty)||x.qty<1||x.qty>9999)){alert('Please enter valid items and quantities.');return;}
    if(date.value<localToday){alert('Please choose today or a future rental date.');return;}
    const msg=['Hello True Dezigns! I would like to request a rental.','','ITEMS',...chosen.map((x,i)=>`${i+1}. ${x.name} — Quantity: ${x.qty}`),'',`Rental start date: ${date.value}`,`Preferred time to speak: ${selectedCall()}`,`Anything else: ${document.getElementById('td-rental-notes').value.trim()||'None'}`,'','Please confirm availability, rental price and next steps. Thank you!'].join('\n');
    window.open('https://wa.me/919745845989?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
  });
  document.getElementById('td-cart-rental-link')?.addEventListener('click',()=>{
    const bag=window.getTrueDezignsRentalCart?.()||[];
    if(bag.length){items.innerHTML='';bag.forEach(x=>addItem(x.name,x.quantity));const first=bag.find(x=>x.startDate);if(first?.startDate && /^\d{4}-\d{2}-\d{2}$/.test(first.startDate))date.value=first.startDate;update();}
    document.getElementById('cart-overlay')?.classList.remove('visible','is-active');
  });
  // Catalogue and product details follow the reference's image-left / details-right layout.
  const modal=document.getElementById('td-catalog-modal');
  const grid=document.getElementById('td-catalog-grid');
  const detail=document.getElementById('td-catalog-detail');
  const browse=document.getElementById('td-browse-products');
  const close=document.getElementById('td-catalog-close');
  const products=()=>window.trueDezignsCatalogue||[];
  let focusBefore=null;
  function openCatalogue(){
    focusBefore=document.activeElement; modal.hidden=false;document.body.classList.add('td-catalog-open');
    detail.hidden=true;grid.hidden=false;
    grid.innerHTML=products().length?products().map((p,i)=>`<button type="button" class="td-catalog-card" data-product="${i}"><img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy"><span>${escapeHTML(p.category)}</span><strong>${escapeHTML(p.name)}</strong></button>`).join(''):'<p>Products are loading. Please try again in a moment.</p>';
    close.focus();
  }
  function closeCatalogue(){modal.hidden=true;document.body.classList.remove('td-catalog-open');focusBefore?.focus();}
  function field(label,value){return `<div class="td-detail-field"><span>${label}</span><strong>${escapeHTML(value)}</strong></div>`;}
  function showProduct(p){
    grid.hidden=true;detail.hidden=false;
    const price=p.price!==null && p.price!=='' ? `₹${escapeHTML(p.price)}` : 'Price on request';
    detail.innerHTML=`<button type="button" class="td-detail-back">← All products</button><div class="td-detail-layout"><div class="td-detail-photo"><img class="td-detail-main-image" src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}">${(p.images||[]).length>1?`<div class="td-oath-thumbs">${p.images.map((src,i)=>`<button type="button" class="td-oath-thumb" data-src="${escapeHTML(src)}" aria-label="View image ${i+1}"><img src="${escapeHTML(src)}" alt="" loading="lazy"></button>`).join('')}</div>`:''}</div><div class="td-detail-info"><span class="td-rental-eyebrow">${escapeHTML(p.category)}</span><h3>${escapeHTML(p.name)}</h3><div class="td-detail-fields">${field('Cloth colour',p.colour||'Confirm with rental team')}${field('Type',p.category)}${field('Material',p.material||'Confirm with rental team')}${field('Rental price',price)}</div>${p.description?`<p class="td-oath-description">${escapeHTML(p.description)}</p>`:''}<button type="button" class="td-detail-select">Add to rental request →</button></div></div>`;
    detail.querySelectorAll('.td-oath-thumb').forEach(btn=>btn.addEventListener('click',()=>{detail.querySelector('.td-detail-main-image').src=btn.dataset.src;}));
    detail.querySelector('.td-detail-back').onclick=()=>{detail.hidden=true;grid.hidden=false;};
    detail.querySelector('.td-detail-select').onclick=()=>{
      const empty=[...items.children].find(row=>!row.querySelector('.td-item-name').value);
      if(empty){empty.remove();}
      addItem(p.name,1);closeCatalogue();update();
      document.getElementById('td-rental-items').scrollIntoView({behavior:'smooth',block:'center'});
    };
  }
  browse?.addEventListener('click',openCatalogue);
  close?.addEventListener('click',closeCatalogue);
  modal?.addEventListener('click',e=>{if(e.target===modal)closeCatalogue();});
  grid?.addEventListener('click',e=>{const b=e.target.closest('[data-product]');if(b){const p=products()[Number(b.dataset.product)];if(p)showProduct(p);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeCatalogue();});
  // Optional transfer from the homepage shopping bag.
  try { const saved=JSON.parse(sessionStorage.getItem('td-rental-transfer')||'[]'); if(Array.isArray(saved)&&saved.length){items.innerHTML='';saved.forEach(x=>addItem(x.name,x.quantity));sessionStorage.removeItem('td-rental-transfer');update();} }catch(e){}
  addItemIfEmpty();
  function addItemIfEmpty(){if(!items.children.length)addItem();}
})();
