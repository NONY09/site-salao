(() => {
  'use strict';
  const services = window.GLOW_SERVICES;
  const PHONE = '351912162550';
  const selected = new Set();
  const categories = {cabelo:'cabelo',unhas:'unhas',olhar:'sobrancelhas e pestanas',cera:'depilação a cera',laser:'laser',todos:'todas as categorias'};
  let category = 'cabelo';
  let expanded = false;
  const $ = (selector) => document.querySelector(selector);
  const list = $('#service-list');
  const search = $('#service-search');
  const bookingDialog = $('#booking-dialog');
  const checkout = $('#whatsapp-checkout');
  const dateInput = $('#preferred-date');
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const euro = (value) => new Intl.NumberFormat('pt-PT', {style:'currency',currency:'EUR',minimumFractionDigits:Number.isInteger(value)?0:2,maximumFractionDigits:2}).format(value);
  const duration = (minutes) => `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)} h` : ''}${minutes % 60 ? `${minutes >= 60 ? ' ' : ''}${minutes % 60} min` : ''}`;
  const priceText = (service) => service.price === null ? 'Sob consulta' : `${service.from ? 'A partir de ' : ''}${euro(service.price)}`;
  const getSelected = () => services.filter(service => selected.has(service.id));
  const getTotals = () => {
    const items = getSelected();
    return {items,total:items.reduce((sum,item)=>sum+(item.price === null ? 0 : Math.round(item.price*100)),0)/100,unknown:items.filter(item=>item.price === null).length,from:items.some(item=>item.from),minutes:items.reduce((sum,item)=>sum+item.minutes,0)};
  };
  const todayLisbon = () => {
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const value = Object.fromEntries(parts.map(part=>[part.type,part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  };
  dateInput.min = todayLisbon();
  $('#year').textContent = new Date().getFullYear();

  function renderServices() {
    const query = normalize(search.value);
    const matches = services.filter(service => (category === 'todos' || service.category === category) && (!query || normalize(`${service.name} ${service.description}`).includes(query)));
    const visible = expanded || query ? matches : matches.slice(0,8);
    list.innerHTML = visible.map(service => `<article class="service-row${selected.has(service.id)?' selected':''}" data-service="${service.id}"><div><h3 class="service-title">${escapeHTML(service.name)}</h3><p class="service-description">${escapeHTML(service.description)}</p><span class="service-duration"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4v4l3 2"/></svg>${duration(service.minutes)}</span></div><div class="service-choice"><span class="service-price${service.price===null?' consult':''}">${service.from?'<small>a partir de</small>':''}${service.price===null?'Sob consulta':euro(service.price)}</span><button class="add-service" data-id="${service.id}" aria-pressed="${selected.has(service.id)}" aria-label="${selected.has(service.id)?'Remover':'Adicionar'} ${escapeHTML(service.name)}">${selected.has(service.id)?'✓':'+'}</button></div></article>`).join('');
    if (!matches.length) {
      list.innerHTML = '<div class="empty-results"><p>Não encontrámos esse serviço.</p><button class="text-link" id="reset-search">Ver todos os serviços <span aria-hidden="true">↗</span></button></div>';
      $('#reset-search').addEventListener('click',()=>{search.value='';setCategory('todos');});
    }
    const more = $('#show-more');
    more.hidden = !!query || matches.length <= 8;
    more.innerHTML = `${expanded?'Mostrar menos':`Ver todos os serviços${category==='todos'?'':' de '+categories[category]}`} <span aria-hidden="true">${expanded?'↑':'↓'}</span>`;
  }

  function setCategory(value) {
    category=value;expanded=false;
    document.querySelectorAll('.filter').forEach(button=>{const active=button.dataset.category===category;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
    renderServices();
  }
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{search.value='';setCategory(button.dataset.category);}));
  search.addEventListener('input',()=>{if(search.value && category!=='todos')setCategory('todos');else renderServices();});
  $('#show-more').addEventListener('click',()=>{expanded=!expanded;renderServices();if(!expanded)$('#servicos').scrollIntoView({behavior:'smooth'});});
  list.addEventListener('click',event=>{
    const button=event.target.closest('.add-service');if(!button)return;
    const id=button.dataset.id;
    const service=services.find(item=>item.id===id);
    if(selected.has(id))selected.delete(id);else selected.add(id);
    button.setAttribute('aria-pressed',String(selected.has(id)));
    button.setAttribute('aria-label',`${selected.has(id)?'Remover':'Adicionar'} ${service.name}`);
    button.textContent=selected.has(id)?'✓':'+';
    button.closest('.service-row').classList.toggle('selected',selected.has(id));
    renderSelection();
    $('#announcer').textContent=`${service.name} ${selected.has(id)?'adicionado à':'removido da'} seleção. ${selected.size} ${selected.size===1?'serviço escolhido':'serviços escolhidos'}.`;
  });

  function renderSelection() {
    const {items,total,unknown,from}=getTotals();
    const allUnknown=items.length>0 && unknown===items.length;
    $('#selection-bar').hidden=!items.length;
    document.body.classList.toggle('has-selection',!!items.length);
    $('#selection-count').textContent=String(items.length);
    $('#selection-label').textContent=items.length===1?'serviço escolhido':'serviços escolhidos';
    $('#selection-total').textContent=allUnknown?'Valor sob consulta':`${unknown?(from?'Subtotal desde ':'Subtotal: '):from?'A partir de ':''}${euro(total)}${unknown?' + sob consulta':''}`;
    $('#selected-list').innerHTML=items.length?items.map(item=>`<div class="selected-row"><div><h3>${escapeHTML(item.name)}</h3><p>${duration(item.minutes)}</p></div><span class="selected-price">${item.price===null?'Sob consulta':`${item.from?'desde ':''}${euro(item.price)}`}</span><button class="remove-service" data-id="${item.id}" aria-label="Remover ${escapeHTML(item.name)} da seleção">×</button></div>`).join(''):'<p class="empty-selection">A sua seleção está vazia. Escolha um serviço para começar.</p>';
    $('#total-label').textContent=unknown?(from?'Subtotal a partir de':'Subtotal conhecido'):from?'Total a partir de':'Total dos serviços';
    $('#dialog-total').textContent=allUnknown?'Sob consulta':euro(total);
    $('#total-note').textContent=unknown?`${unknown} ${unknown===1?'serviço com valor':'serviços com valores'} sob consulta. Será acrescentado ao subtotal após confirmação.${from?' Os restantes valores são indicativos.':''}`:from?'O preço final dos serviços “a partir de” é confirmado pela equipa.':'A equipa confirma os serviços e as condições da marcação.';
    if(allUnknown)$('#total-label').textContent='Valor dos serviços';
    updateWhatsApp();
  }

  function buildMessage() {
    const {items,total,unknown,from,minutes}=getTotals();
    const clientName=$('#client-name').value.trim();
    const date=dateInput.value;
    const period=$('#preferred-period').value;
    const lines=[`Olá, Karen!${clientName?` O meu nome é ${clientName}.`:''} Gostava de pedir uma marcação na Glow Carioca.`, '', 'Os serviços que escolhi:', ...items.map(item=>`• ${item.name} — ${priceText(item)} (${duration(item.minutes)})`), ''];
    if(unknown===items.length)lines.push('Valor total: sob consulta.');
    else if(unknown)lines.push(`Subtotal ${from?'a partir de ':''}${euro(total)} + ${unknown} ${unknown===1?'serviço sob consulta':'serviços sob consulta'}.`);
    else lines.push(`Total ${from?'a partir de ':''}${euro(total)}.`);
    lines.push(`Duração somada indicativa: ${duration(minutes)}.`);
    if(date){const [year,month,day]=date.split('-');lines.push(`Data preferida: ${day}/${month}/${year}.`);}
    if(period)lines.push(`Preferência de horário: ${period}.`);
    lines.push('', 'Podem confirmar a disponibilidade, os valores e as condições? Obrigado/a!');
    return lines.join('\n');
  }

  function updateWhatsApp() {
    const invalidDate=!!dateInput.value && dateInput.value<todayLisbon();
    $('#date-error').hidden=!invalidDate;
    checkout.setAttribute('aria-disabled',String(selected.size===0 || invalidDate));
    if(selected.size===0 || invalidDate){checkout.removeAttribute('href');checkout.tabIndex=-1;}
    else{checkout.href=`https://wa.me/${PHONE}?text=${encodeURIComponent(buildMessage())}`;checkout.tabIndex=0;}
  }
  $('#selected-list').addEventListener('click',event=>{const button=event.target.closest('.remove-service');if(!button)return;const index=[...document.querySelectorAll('.remove-service')].indexOf(button);selected.delete(button.dataset.id);renderServices();renderSelection();const remaining=document.querySelectorAll('.remove-service');(remaining[Math.min(index,remaining.length-1)]||$('#continue-selection')).focus();});
  $('#booking-form').addEventListener('input',updateWhatsApp);
  $('#booking-form').addEventListener('change',updateWhatsApp);
  $('#booking-form').addEventListener('submit',event=>event.preventDefault());
  checkout.addEventListener('click',event=>{updateWhatsApp();if(checkout.getAttribute('aria-disabled')==='true')event.preventDefault();});
  function openDialog(dialog){dialog.showModal();document.body.classList.add('dialog-open');}
  function closeDialog(dialog){dialog.close();document.body.classList.remove('dialog-open');}
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelectorAll('.close-dialog').forEach(button=>button.addEventListener('click',()=>closeDialog(dialog)));
    dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
    dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);});
  });
  $('#selection-bar').addEventListener('click',()=>{dateInput.min=todayLisbon();renderSelection();openDialog(bookingDialog);});
  $('#continue-selection').addEventListener('click',()=>{closeDialog(bookingDialog);$('#servicos').scrollIntoView({behavior:'smooth'});});
  document.querySelectorAll('.gallery-item').forEach(button=>button.addEventListener('click',()=>{$('#large-photo').src=button.dataset.photo;$('#large-photo').alt=button.querySelector('img').alt;$('#photo-caption').textContent=button.dataset.caption;openDialog($('#photo-dialog'));}));
  $('#privacy-open').addEventListener('click',()=>openDialog($('#privacy-dialog')));
  const menu=$('.menu-toggle');
  const mobileNav=$('#mobile-nav');
  function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menu');mobileNav.hidden=true;}
  menu.addEventListener('click',()=>{const opened=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened?'Fechar menu':'Abrir menu');mobileNav.hidden=!opened;});
  mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && !mobileNav.hidden){closeMenu();menu.focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});
  renderServices();renderSelection();
})();
