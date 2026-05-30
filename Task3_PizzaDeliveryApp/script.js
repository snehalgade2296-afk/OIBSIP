
/* ─── DATA ──────────────────────────────────────────── */
const PIZZAS = [
  {id:1,name:'Margherita Classic',desc:'San Marzano tomato, fresh mozzarella, basil',price:299,emoji:'🍕',cat:'classic',badge:'best',stars:5,rating:'4.8',orders:2340},
  {id:2,name:'BBQ Chicken Loaded',desc:'Smoky BBQ sauce, grilled chicken, red onions',price:449,emoji:'🔥',cat:'premium',badge:'best',stars:5,rating:'4.9',orders:1820},
  {id:3,name:'Garden Veggie Supreme',desc:'Bell peppers, mushrooms, olives, corn',price:349,emoji:'🥗',cat:'veggie',badge:null,stars:4,rating:'4.6',orders:980},
  {id:4,name:'Pepperoni Feast',desc:'Double pepperoni, mozzarella, oregano',price:399,emoji:'🥩',cat:'classic',badge:'spicy',stars:5,rating:'4.7',orders:3100},
  {id:5,name:'Paneer Tikka Special',desc:'Marinated paneer, capsicum, tandoori sauce',price:379,emoji:'🟡',cat:'veggie',badge:'new',stars:4,rating:'4.5',orders:760},
  {id:6,name:'Quattro Formaggi',desc:'4-cheese blend: mozz, cheddar, parmesan, gouda',price:499,emoji:'🧀',cat:'premium',badge:null,stars:5,rating:'4.9',orders:1240},
  {id:7,name:'Spicy Diavola',desc:'Spicy salami, jalapeños, chili oil, arugula',price:429,emoji:'🌶️',cat:'spicy',badge:'spicy',stars:5,rating:'4.8',orders:1560},
  {id:8,name:'Truffle Mushroom',desc:'Wild mushrooms, truffle oil, rosemary, fontina',price:549,emoji:'🍄',cat:'premium',badge:'new',stars:5,rating:'4.9',orders:620},
  {id:9,name:'Hawaiian Twist',desc:'Ham, pineapple, mozzarella, honey drizzle',price:359,emoji:'🍍',cat:'classic',badge:null,stars:3,rating:'4.2',orders:890},
  {id:10,name:'Garlic Breadsticks',desc:'Buttery garlic breadsticks with marinara dip',price:149,emoji:'🥖',cat:'sides',badge:null,stars:4,rating:'4.5',orders:4200},
  {id:11,name:'Spicy Wings (6pc)',desc:'Crispy chicken wings tossed in sriracha',price:249,emoji:'🍗',cat:'sides',badge:null,stars:4,rating:'4.4',orders:2100},
  {id:12,name:'Mango Smoothie',desc:'Fresh mango, yogurt, a hint of cardamom',price:129,emoji:'🥭',cat:'drinks',badge:null,stars:4,rating:'4.3',orders:1800},
];

const ORDER_HISTORY = [
  {name:'BBQ Chicken Loaded',emoji:'🔥',price:489,status:'Delivered',date:'27 May 2026',id:'#SD-8810'},
  {name:'Quattro Formaggi',emoji:'🧀',price:539,status:'Delivered',date:'24 May 2026',id:'#SD-8790'},
  {name:'Custom Builder Pizza',emoji:'🍕',price:399,status:'Delivered',date:'20 May 2026',id:'#SD-8765'},
  {name:'Pepperoni Feast',emoji:'🥩',price:439,status:'Cancelled',date:'18 May 2026',id:'#SD-8750'},
];

const INVENTORY = [
  {name:'Mozzarella Cheese',stock:3,max:50,unit:'kg',low:true},
  {name:'Pizza Dough (base)',stock:28,max:60,unit:'units',low:false},
  {name:'Tomato Sauce',stock:15,max:40,unit:'litres',low:false},
  {name:'Paneer',stock:5,max:30,unit:'kg',low:true},
  {name:'Bell Peppers',stock:22,max:50,unit:'kg',low:false},
  {name:'Mushrooms',stock:8,max:25,unit:'kg',low:false},
  {name:'Pepperoni',stock:4,max:20,unit:'kg',low:true},
  {name:'Chicken (grilled)',stock:18,max:40,unit:'kg',low:false},
];

const AI_RECS = [
  {name:'Truffle Mushroom',emoji:'🍄',why:'You love premium toppings',id:8},
  {name:'Spicy Diavola',emoji:'🌶️',why:'Based on your spice history',id:7},
  {name:'Quattro Formaggi',emoji:'🧀',why:'Cheese lovers pick',id:6},
  {name:'BBQ Chicken',emoji:'🔥',why:'Top rated near you',id:2},
  {name:'Garlic Breadsticks',emoji:'🥖',why:'Perfect with your order',id:10},
];

const CHAT_REPLIES = {
  'track my order': 'Your order #SD-8821 is currently being prepared! Estimated arrival: 28 minutes. 🛵',
  'best sellers?': 'Our top picks are: 🥩 Pepperoni Feast, 🔥 BBQ Chicken, and 🍕 Margherita Classic!',
  'offers today': '🎉 Today\'s deals: FREE garlic breadsticks on orders above ₹399 | Use code SLICE20 for 20% off!',
  'delivery time?': '⏱️ We typically deliver in 25–35 minutes. Express delivery available for a small fee!',
  'default': 'Great question! Let me connect you to our support team. Meanwhile, you can also check our FAQ. 😊',
};

/* ─── STATE ─────────────────────────────────────────── */
let cart = [];
let currentCategory = 'all';
let builderState = { size:'8" Regular', crust:'Thin Crust', sauce:'Classic Tomato', cheese:'Mozzarella', toppings:[], basePrice:299 };
let trackingStep = 2;
let isOnline = true;
let paymentMethod = 'card';

/* ─── INIT ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  spawnFloatingEmojis();
  setTimeout(loadMenu, 900); // simulate loading
  renderAIRecs();
  renderHistory();
  renderAdminDashboard();
  renderInventory();
  renderCustomers();
  renderDeliveryHistory();
  renderAnalytics();
  document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  animateKPIs();
});

/* ─── PAGE NAVIGATION ───────────────────────────────── */
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  window.scrollTo(0,0);
  if(id==='payment') populatePayment();
  if(id==='home'){
    document.querySelectorAll('.nav-links a').forEach(a=>a.classList.remove('active'));
    document.querySelector('.nav-links a').classList.add('active');
  }
}

/* ─── FLOATING EMOJIS ───────────────────────────────── */
function spawnFloatingEmojis(){
  const emojis = ['🍕','🍅','🧀','🌶️','🍄','🫒','🥖','🧅','🫑'];
  const container = document.getElementById('floating-items');
  emojis.forEach((e,i)=>{
    const el = document.createElement('div');
    el.className='float-item';
    el.textContent=e;
    el.style.cssText=`left:${5+i*11}%;top:${10+Math.sin(i)*30}%;animation-duration:${5+i%3*2}s;animation-delay:${i*.4}s;`;
    container.appendChild(el);
  });
}

/* ─── MENU LOADING ──────────────────────────────────── */
function loadMenu(){
  renderMenu(PIZZAS);
}

function renderMenu(items){
  const grid = document.getElementById('pizza-grid');
  if(!items.length){
    grid.innerHTML=`<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🔍</div><h3>No results found</h3><p>Try a different search</p></div>`;
    return;
  }
  grid.innerHTML = items.map(p=>`
    <div class="pizza-card" onclick="addToCart(${p.id})">
      <div class="pizza-img">
        ${p.badge?`<div class="pizza-badge badge-${p.badge}">${p.badge==='best'?'⭐ Bestseller':p.badge==='new'?'✨ New':'🌶️ Spicy'}</div>`:''}
        <span style="position:relative;z-index:1;">${p.emoji}</span>
      </div>
      <div class="pizza-info">
        <div class="stars">${'⭐'.repeat(p.stars)}${p.stars<5?'<span style="color:var(--text3)">⭐</span>'.repeat(5-p.stars):''}<span style="color:var(--text2);font-size:12px;margin-left:4px;">${p.rating} (${(p.orders/100|0)*100}+)</span></div>
        <div class="pizza-name">${p.name}</div>
        <div class="pizza-desc">${p.desc}</div>
        <div class="pizza-footer">
          <div class="pizza-price">₹${p.price}</div>
          <button class="add-btn" onclick="event.stopPropagation();addToCart(${p.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterCat(cat, el){
  currentCategory=cat;
  document.querySelectorAll('.cat-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  const q = document.getElementById('search-input').value.toLowerCase();
  filterMenu(q,cat);
}

function filterMenu(){
  const q = document.getElementById('search-input').value.toLowerCase();
  filterMenu(q,currentCategory);
}

function filterMenu(q='',cat=currentCategory){
  let items = PIZZAS;
  if(cat!=='all') items=items.filter(p=>p.cat===cat);
  if(q) items=items.filter(p=>p.name.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q));
  renderMenu(items);
}

/* ─── AI RECOMMENDATIONS ────────────────────────────── */
function renderAIRecs(){
  document.getElementById('ai-recs').innerHTML = AI_RECS.map(r=>`
    <div class="ai-card" onclick="addToCart(${r.id})">
      <span class="ai-card-emoji">${r.emoji}</span>
      <div class="ai-card-name">${r.name}</div>
      <div class="ai-card-why">💡 ${r.why}</div>
    </div>
  `).join('');
}

/* ─── CART ──────────────────────────────────────────── */
function addToCart(id){
  const pizza = PIZZAS.find(p=>p.id===id);
  if(!pizza) return;
  const existing = cart.find(c=>c.id===id && !c.custom);
  if(existing){ existing.qty++; }
  else { cart.push({...pizza, qty:1, custom:false}); }
  updateCartUI();
  showToast(`${pizza.emoji} ${pizza.name} added to cart!`, 'success');
}

function addBuilderToCart(){
  const item = {
    id: Date.now(), name:'Custom Pizza', emoji:'🍕', qty:1, custom:true,
    price: parseInt(document.getElementById('builder-total').textContent.replace('₹','').replace(',','')),
    desc:`${builderState.size} · ${builderState.crust} · ${builderState.sauce}`,
  };
  cart.push(item);
  updateCartUI();
  showToast('🍕 Custom pizza added to cart!', 'success');
  showPage('home');
}

function updateCartUI(){
  const total = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cart-count').textContent = total;
  renderCartItems();
}

function renderCartItems(){
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if(!cart.length){
    body.innerHTML=`<div class="cart-empty"><div class="empty-icon">🍕</div><div style="font-size:16px;font-weight:600;color:var(--text2);">Your cart is empty</div><div style="font-size:13px;">Add some delicious pizzas!</div></div>`;
    footer.style.display='none';
    return;
  }
  const sub = cart.reduce((s,i)=>s+(i.price*i.qty),0);
  body.innerHTML=`<div class="cart-items">`+cart.map((item,idx)=>`
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} each</div>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
        <div class="qty-val">${item.qty}</div>
        <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
      </div>
    </div>
  `).join('')+`</div>`;
  footer.style.display='block';
  const grand = sub+40;
  document.getElementById('cart-subtotal').textContent=`₹${sub}`;
  document.getElementById('cart-grand-total').textContent=`₹${grand}`;
}

function changeQty(idx, delta){
  cart[idx].qty += delta;
  if(cart[idx].qty<=0) cart.splice(idx,1);
  updateCartUI();
}

function toggleCart(){
  document.getElementById('cart-sidebar').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open');
}

function goCheckout(){
  toggleCart();
  showPage('payment');
}

/* ─── PIZZA BUILDER ─────────────────────────────────── */
function selectSize(el, label, price){
  document.querySelectorAll('#size-opts .option-chip').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  builderState.size=label;
  builderState.basePrice=parseInt(price.replace('₹',''));
  updateBuilderSummary();
}

function selectOpt(el, type, val){
  const parent = el.closest('.option-grid') || el.parentNode;
  parent.querySelectorAll('.option-chip').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  builderState[type]=val;
  updateBuilderSummary();
}

function toggleTopping(el, name){
  const idx = builderState.toppings.indexOf(name);
  if(idx>-1){
    builderState.toppings.splice(idx,1);
    el.classList.remove('selected');
  } else {
    if(builderState.toppings.length>=6){ showToast('Max 6 toppings allowed','warning'); return; }
    builderState.toppings.push(name);
    el.classList.add('selected');
  }
  updateBuilderSummary();
}

function updateBuilderSummary(){
  document.getElementById('s-size').textContent=builderState.size;
  document.getElementById('s-crust').textContent=builderState.crust;
  document.getElementById('s-sauce').textContent=builderState.sauce;
  document.getElementById('s-cheese').textContent=builderState.cheese;
  document.getElementById('s-toppings').textContent=builderState.toppings.length?builderState.toppings.join(', '):'None';
  const extra = (builderState.crust.includes('+₹60')?60:0)+(builderState.crust.includes('+₹40')?40:0)
              + (builderState.cheese.includes('+₹40')?40:0)+(builderState.cheese.includes('+₹50')?50:0)
              + builderState.toppings.length*15;
  const total = builderState.basePrice+extra;
  document.getElementById('builder-total').textContent=`₹${total}`;
}

/* ─── AUTH ──────────────────────────────────────────── */
function switchAuthTab(tab, el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('login-form').style.display = tab==='login'?'block':'none';
  document.getElementById('signup-form').style.display = tab==='signup'?'block':'none';
}

function doLogin(){
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  let valid = true;
  if(!email||!email.includes('@')){ showErr('login-email-err',true); valid=false; } else showErr('login-email-err',false);
  if(!pass){ showErr('login-pass-err',true); valid=false; } else showErr('login-pass-err',false);
  if(!valid) return;
  document.getElementById('auth-btn').textContent='👤 Priya';
  showToast('✅ Welcome back, Priya!','success');
  showPage('home');
}

function doSignup(){
  const name=document.getElementById('signup-name').value;
  const email=document.getElementById('signup-email').value;
  const pass=document.getElementById('signup-pass').value;
  let valid=true;
  if(!name){ showErr('signup-name-err',true); valid=false; } else showErr('signup-name-err',false);
  if(!email||!email.includes('@')){ showErr('signup-email-err',true); valid=false; } else showErr('signup-email-err',false);
  if(pass.length<8){ showErr('signup-pass-err',true); valid=false; } else showErr('signup-pass-err',false);
  if(!valid) return;
  showToast('📧 Verification email sent! Check your inbox.','info');
  setTimeout(()=>{ document.getElementById('auth-btn').textContent='👤 '+name.split(' ')[0]; showToast('✅ Account created!','success'); showPage('home'); },1500);
}

function socialLogin(provider){
  showToast(`🔄 Connecting to ${provider}...`,'info');
  setTimeout(()=>{ document.getElementById('auth-btn').textContent='👤 User'; showToast(`✅ Signed in with ${provider}!`,'success'); showPage('home'); },1200);
}

function showForgot(){
  showToast('📧 Password reset link sent to your email!','info');
}

function showErr(id,show){ document.getElementById(id).classList.toggle('show',show); }

/* ─── ORDER TRACKING ────────────────────────────────── */
const STEPS = ['step-cooking','step-delivery','step-delivered'];
const STEP_MSGS = [['👨‍🍳','Being Prepared','Chef is crafting your pizza'],['🛵','Out for Delivery','Rahul is on the way! 3.2 km'],['🏠','Delivered','Enjoy your meal! 🎉']];

function advanceTracking(){
  const s = STEPS[trackingStep];
  if(!s){ showToast('Order already delivered! ✅','success'); return; }
  const el = document.getElementById(s);
  el.classList.add('current');
  if(trackingStep>0){
    const prev=document.getElementById(STEPS[trackingStep-1]);
    if(prev){ prev.classList.remove('current'); prev.classList.add('done'); prev.querySelector('.step-icon').textContent='✅'; }
  }
  const [icon,label,sub]=STEP_MSGS[trackingStep];
  el.querySelector('.step-icon').textContent=icon;
  el.querySelector('.step-label').textContent=label;
  el.querySelector('.step-sub').textContent=sub;
  el.querySelector('.step-time').textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  showToast(`📦 Update: ${label}`,'info');
  trackingStep++;
  if(trackingStep===3) showToast('🎉 Your pizza has been delivered! Enjoy!','success');
}

/* ─── PAYMENT ───────────────────────────────────────── */
function populatePayment(){
  if(!cart.length){ document.getElementById('payment-items').innerHTML='<div style="color:var(--text2);font-size:13px;">No items in cart</div>'; return; }
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tax=Math.round(sub*.05);
  document.getElementById('payment-items').innerHTML=cart.map(i=>`<div class="summary-line"><span>${i.emoji} ${i.name} ×${i.qty}</span><span>₹${i.price*i.qty}</span></div>`).join('');
  document.getElementById('pay-sub').textContent=`₹${sub}`;
  document.getElementById('pay-tax').textContent=`₹${tax}`;
  document.getElementById('pay-total').textContent=`₹${sub+40+tax}`;
}

function selectPayment(el){
  document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('selected'));
  el.classList.add('selected');
  paymentMethod=el.textContent.trim().toLowerCase();
  document.getElementById('card-form').style.display=(paymentMethod.includes('card'))?'block':'none';
}

function formatCard(input){
  let v=input.value.replace(/\s/g,'').replace(/\D/g,'');
  input.value=v.match(/.{1,4}/g)?.join(' ')||v;
}

function processPayment(){
  const btn=document.getElementById('pay-btn');
  btn.textContent='🔄 Processing...';
  btn.disabled=true;
  setTimeout(()=>{
    document.getElementById('payment-form-area').style.display='none';
    document.getElementById('payment-success').style.display='block';
    cart=[];
    updateCartUI();
    showToast('✅ Payment of ₹'+document.getElementById('pay-total').textContent.replace('₹','') + ' successful!','success');
  },2200);
}

/* ─── HISTORY ───────────────────────────────────────── */
function renderHistory(){
  document.getElementById('history-list').innerHTML = ORDER_HISTORY.length
    ? ORDER_HISTORY.map(o=>`
      <div class="history-card">
        <div class="history-emoji">${o.emoji}</div>
        <div class="history-info">
          <div class="history-name">${o.name}</div>
          <div class="history-meta">${o.id} · ${o.status==='Delivered'?'✅':'❌'} ${o.status}</div>
        </div>
        <div class="history-right">
          <div class="history-price">₹${o.price}</div>
          <div class="history-date">${o.date}</div>
          ${o.status==='Delivered'?`<button class="reorder-btn" onclick="reorder('${o.name}')">🔄 Reorder</button>`:''}
        </div>
      </div>`).join('')
    : `<div class="empty-state"><div class="empty-icon">📋</div><h3>No orders yet</h3><p>Your order history will appear here</p></div>`;
}

function reorder(name){ showToast(`🛒 ${name} added to cart!`,'success'); }

/* ─── ADMIN DASHBOARD ───────────────────────────────── */
function renderAdminDashboard(){
  // Chart
  const bars=[55,72,48,88,65,91,78];
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const maxBar=Math.max(...bars);
  document.getElementById('chart-bars').innerHTML=bars.map((b,i)=>`
    <div class="bar-wrap">
      <div class="bar" style="height:${(b/maxBar)*140}px;background:${i===5?'linear-gradient(180deg,#ff5722,#ff1744)':'rgba(255,255,255,0.1)'}"></div>
    </div>`).join('');
  document.getElementById('chart-labels').innerHTML=days.map(d=>`<div style="flex:1;text-align:center;font-size:11px;color:var(--text3);">${d}</div>`).join('');

  // Live orders
  const liveOrders=[
    {id:'#8821',name:'Priya Sharma',item:'Margherita',status:'Cooking',amt:'₹339'},
    {id:'#8820',name:'Rohan Mehta',item:'BBQ Chicken',status:'Out for Delivery',amt:'₹489'},
    {id:'#8819',name:'Anjali Rao',item:'Custom Pizza',status:'Delivered',amt:'₹399'},
    {id:'#8818',name:'Vikram Singh',item:'Pepperoni',status:'Preparing',amt:'₹439'},
    {id:'#8817',name:'Meera Nair',item:'Quattro',status:'Delivered',amt:'₹539'},
  ];
  document.getElementById('live-orders-table').innerHTML=liveOrders.map(o=>`
    <div class="table-row">
      <span style="color:var(--text3);font-size:12px;width:52px;">${o.id}</span>
      <span style="flex:1;">${o.name}<div style="color:var(--text2);font-size:12px;">${o.item}</div></span>
      <span class="status-pill s-${o.status.toLowerCase().replace(' for ','').replace(' ','')}">${o.status}</span>
      <span style="font-weight:700;color:var(--orange2);">${o.amt}</span>
    </div>`).join('');

  // Top items
  const topItems=[
    {emoji:'🥩',name:'Pepperoni Feast',orders:3100},
    {emoji:'🔥',name:'BBQ Chicken',orders:1820},
    {emoji:'🍕',name:'Margherita',orders:2340},
    {emoji:'🧀',name:'Quattro Formaggi',orders:1240},
  ];
  document.getElementById('top-items-table').innerHTML=topItems.map((t,i)=>`
    <div class="table-row">
      <span style="font-family:'Syne',sans-serif;color:var(--text3);font-size:14px;">${i+1}</span>
      <span style="font-size:20px;">${t.emoji}</span>
      <span style="flex:1;">${t.name}</span>
      <span style="color:var(--text2);font-size:13px;">${t.orders.toLocaleString()} orders</span>
    </div>`).join('');

  // All orders
  document.getElementById('all-orders-table').innerHTML=liveOrders.concat(liveOrders.slice(0,3)).map(o=>`
    <div class="table-row">
      <span style="color:var(--text3);font-size:12px;width:52px;">${o.id}</span>
      <span style="flex:1;">${o.name}<div style="color:var(--text2);font-size:12px;">${o.item}</div></span>
      <span class="status-pill s-${o.status.toLowerCase().replace(' for ','').replace(' ','')}">${o.status}</span>
      <span style="font-weight:700;color:var(--orange2);">${o.amt}</span>
      <button class="btn-secondary" style="font-size:11px;padding:4px 10px;" onclick="showToast('Status updated!','success')">Update</button>
    </div>`).join('');

  // Admin menu
  document.getElementById('admin-menu-grid').innerHTML=PIZZAS.slice(0,8).map(p=>`
    <div class="pizza-card" style="cursor:default;">
      <div class="pizza-img" style="height:120px;font-size:48px;">${p.emoji}</div>
      <div class="pizza-info">
        <div class="pizza-name" style="font-size:14px;">${p.name}</div>
        <div class="pizza-footer">
          <div class="pizza-price">₹${p.price}</div>
          <button class="add-btn" style="background:rgba(255,255,255,.1);box-shadow:none;font-size:16px;" onclick="showToast('Edit mode coming soon','info')">✏️</button>
        </div>
      </div>
    </div>`).join('');
}

function animateKPIs(){
  animateCounter('kpi-orders',0,142,1800,'');
  animateCounter('kpi-revenue',0,48290,2000,'₹',true);
}

function animateCounter(id,from,to,dur,prefix,comma=false){
  const el=document.getElementById(id);
  if(!el) return;
  let start=null;
  const step=(ts)=>{
    if(!start)start=ts;
    const prog=Math.min((ts-start)/dur,1);
    const val=Math.floor(from+(to-from)*prog);
    el.textContent=prefix+(comma?val.toLocaleString():val);
    if(prog<1)requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function renderInventory(){
  document.getElementById('inventory-list').innerHTML=`
  <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;">
  ${INVENTORY.map(i=>{
    const pct=(i.stock/i.max)*100;
    return `<div style="padding:18px 22px;border-bottom:1px solid var(--border);">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-weight:600;font-size:14px;${i.low?'color:var(--orange2)':''}">${i.low?'⚠️ ':''} ${i.name}</span>
        <span style="color:var(--text2);font-size:13px;">${i.stock}/${i.max} ${i.unit}</span>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${i.low?'linear-gradient(90deg,var(--orange),var(--red))':'linear-gradient(90deg,#00c853,#00bcd4)'};border-radius:4px;transition:width 1s ease;"></div>
      </div>
    </div>`;
  }).join('')}
  </div>`;
}

function renderCustomers(){
  const custs=[
    {name:'Priya Sharma',orders:12,spent:'₹5,240',emoji:'👩'},
    {name:'Rohan Mehta',orders:9,spent:'₹3,890',emoji:'👨'},
    {name:'Anjali Rao',orders:15,spent:'₹7,120',emoji:'👩‍🦱'},
    {name:'Vikram Singh',orders:7,spent:'₹2,980',emoji:'🧔'},
    {name:'Meera Nair',orders:11,spent:'₹4,450',emoji:'👩‍🦰'},
  ];
  document.getElementById('customers-table').innerHTML=custs.map(c=>`
    <div class="table-row">
      <span style="font-size:24px;">${c.emoji}</span>
      <span style="flex:1;">${c.name}<div style="color:var(--text2);font-size:12px;">${c.orders} orders</div></span>
      <span style="font-family:'Syne',sans-serif;font-weight:700;color:var(--green);">${c.spent}</span>
      <button class="btn-secondary" style="font-size:11px;padding:4px 10px;">View</button>
    </div>`).join('');
}

function renderAnalytics(){
  const months=['Jan','Feb','Mar','Apr','May','Jun'];
  const vals=[42,58,71,65,89,95];
  const maxV=Math.max(...vals);
  document.getElementById('monthly-bars').innerHTML=months.map((m,i)=>`
    <div class="bar-wrap">
      <div class="bar" style="height:${(vals[i]/maxV)*140}px;background:${i===5?'linear-gradient(180deg,var(--orange),var(--red))':'rgba(255,255,255,.12)'}"></div>
      <div class="bar-label">${m}</div>
    </div>`).join('');

  const cats=[{name:'Classic',pct:42,color:'var(--orange)'},{name:'Premium',pct:28,color:'var(--purple)'},{name:'Veggie',pct:18,color:'var(--green)'},{name:'Spicy',pct:12,color:'#ff5f7e'}];
  document.getElementById('cat-breakdown').innerHTML=cats.map(c=>`
    <div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;">
        <span>${c.name}</span><span style="color:${c.color};font-weight:700;">${c.pct}%</span>
      </div>
      <div style="height:8px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${c.pct}%;background:${c.color};border-radius:4px;"></div>
      </div>
    </div>`).join('');
}

function switchAdmin(panel, el){
  document.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('admin-'+panel).classList.add('active');
}

/* ─── DELIVERY PARTNER ──────────────────────────────── */
function toggleOnline(){
  isOnline=!isOnline;
  const t=document.getElementById('online-toggle');
  const s=document.getElementById('online-status');
  t.classList.toggle('on',isOnline);
  s.textContent=isOnline?'Online':'Offline';
  s.style.color=isOnline?'var(--green)':'var(--text3)';
  showToast(isOnline?'🟢 You are now online!':'🔴 You went offline','info');
}

function acceptOrder(){
  document.getElementById('order-request').style.display='none';
  showToast('✅ Order accepted! Navigate to pickup point.','success');
}

function rejectOrder(){
  document.getElementById('order-request').style.display='none';
  showToast('❌ Order rejected.','warning');
}

function renderDeliveryHistory(){
  const hist=[
    {name:'Priya Sharma',earn:'₹60',km:'3.2 km',time:'Today 6:45 PM'},
    {name:'Rohan Mehta',earn:'₹45',km:'2.1 km',time:'Today 5:12 PM'},
    {name:'Anjali Rao',earn:'₹75',km:'4.8 km',time:'Today 4:20 PM'},
  ];
  document.getElementById('delivery-history').innerHTML=hist.map(h=>`
    <div class="history-card">
      <div style="width:44px;height:44px;border-radius:12px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:22px;">🛵</div>
      <div class="history-info">
        <div class="history-name">${h.name}</div>
        <div class="history-meta">${h.km} · ${h.time}</div>
      </div>
      <div class="history-right"><div class="history-price">${h.earn}</div></div>
    </div>`).join('');
}

/* ─── CHATBOT ───────────────────────────────────────── */
function toggleChat(){
  document.getElementById('chat-window').classList.toggle('open');
}

function quickMsg(msg){
  appendMsg(msg,'user');
  document.getElementById('quick-chips').style.display='none';
  setTimeout(()=>{ botReply(msg); },800);
}

function sendChat(){
  const input=document.getElementById('chat-input');
  const msg=input.value.trim();
  if(!msg) return;
  input.value='';
  appendMsg(msg,'user');
  setTimeout(()=>{ botReply(msg); },900);
}

function appendMsg(text,type){
  const msgs=document.getElementById('chat-msgs');
  const div=document.createElement('div');
  div.className=`msg ${type}`;
  div.textContent=text;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

function botReply(msg){
  const key=Object.keys(CHAT_REPLIES).find(k=>msg.toLowerCase().includes(k))||'default';
  appendMsg(CHAT_REPLIES[key],'bot');
}

/* ─── TOAST SYSTEM ──────────────────────────────────── */
function showToast(msg, type='info'){
  const icons={success:'✅',error:'❌',info:'ℹ️',warning:'⚠️'};
  const container=document.getElementById('toast-container');
  const toast=document.createElement('div');
  toast.className=`toast ${type}`;
  toast.innerHTML=`<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(()=>{
    toast.style.animation='slideOut .3s ease forwards';
    setTimeout(()=>toast.remove(),300);
  },3200);
}

/* ─── MISC ──────────────────────────────────────────── */
// Navbar scroll effect
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').style.boxShadow = window.scrollY>10 ? '0 4px 30px rgba(0,0,0,.3)' : 'none';
});

