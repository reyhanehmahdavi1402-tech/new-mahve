/* ============================================
   MAHVE — اسکریپت مشترک
   شامل: سبد خرید، علاقه‌مندی، محصولات،
         پرداخت، پنل ادمین و مخاطبین
   ============================================ */

/* ============================================
   1) ثابت‌ها (CONSTANTS)
   ============================================ */
const ADMIN_EMAIL    = 'admin@mahve.com';   // ایمیل مدیر برای ورود به پنل
const FREE_SHIPPING  = 10000;               // حد مبلغ برای ارسال رایگان ($)
const SHIPPING_COST  = 150;                 // هزینه ارسال وقتی زیر حد رایگان ($)

/* کلیدهای localStorage — برای جلوگیری از تایپ مکرر و یکدستی */
const KEYS = {
  cart:        'mahve_cart',           // سبد خرید
  wishlist:    'mahve_wishlist',       // علاقه‌مندی‌ها
  products:    'mahve_products',       // محصولات (قابل ویرایش توسط مدیر)
  contacts:    'mahve_contacts',       // مخاطبین (پنل ادمین)
  adminSession:'mahve_admin_session',  // وضعیت ورود مدیر
  orderTotal:  'mahve_order_total',    // مبلغ نهایی سفارش
  lastOrder:   'mahve_last_order'      // شماره آخرین سفارش
};

/* ============================================
   2) محصولات پیش‌فرض (DEFAULT_PRODUCTS)
   این آرایه پایه است؛ مدیر می‌تواند تغییرش دهد
   ============================================ */
const DEFAULT_PRODUCTS = [
  { id:1,  name:'Emerald Heritage Ring',   cat:'rings',      price:2450, img:'photos/Emerald Filigree Ring on Velvet.png', badge:'New',     date:6 },
  { id:2,  name:'Persian Sun Necklace',    cat:'necklaces',  price:3180, img:'photos/Ruby Sunburst Pendant on Velvet.png', desc:'Hand-engraved 18k gold pendant celebrating the sun of ancient Persia.', badge:'',        date:5 },
  { id:3,  name:'Ruby Drop Earrings',      cat:'earrings',   price:1890, img:'photos/Ornate Ruby and Emerald Drop Earrings.png', desc:'Rose gold drops with Burmese rubies — a whisper of royal elegance.',    badge:'Limited', date:4 },
  { id:4,  name:'Eternity Gold Bracelet',  cat:'bracelets',  price:4200, img:'photos/Ruby and Emerald Gold Bracelet on Velvet.png ', desc:'Handmade 22k gold cuff, polished to a mirror finish.',                 badge:'',        date:3 },
  { id:5,  name:'Diamond Legacy Ring',     cat:'rings',      price:5600, img:'photos/Ornate Diamond Ring on Emerald Velvet.png', desc:'Platinum band with a brilliant-cut diamond at its heart.',             badge:'',        date:2 },
  { id:6,  name:'Emerald Tear Pendant',    cat:'necklaces',  price:3950, img:'photos/Emerald Pendant on Velvet.png', desc:'Colombian emerald drop on a fine 18k gold chain.',                    badge:'',        date:1 },
  { id:7,  name:'Pearl Cascade Earrings',  cat:'earrings',   price:1450, img:'photos/Emerald Pearl Earrings on Velvet.png', desc:'Freshwater pearls cascading in a contemporary silhouette.',           badge:'',        date:0 },
  { id:8,  name:'Sapphire Moon Ring',      cat:'rings',      price:3300, img:'photos/Crescent Sapphire Ring on Velvet.png', desc:'Ceylon sapphire set in a crescent of 18k gold.',                      badge:'',        date:-1 },
  { id:9,  name:'Gold Heritage Cuff',      cat:'bracelets',  price:2900, img:'photos/Ornate Gold Ruby Cuff on Velvet.png', desc:'Wide 18k gold cuff with repoussé Persian motifs.',                    badge:'',        date:-2 },
  { id:10, name:'Bridal Set Royale',       cat:'sets',       price:8500, img:'photos/Emerald and Ruby Bridal Jewelry Set.png', desc:'Necklace, earrings and ring — a complete bridal legacy.',              badge:'Limited', date:-3 },
  { id:11, name:'Turquoise Persian Ring',  cat:'rings',      price:1750, img:'photos/Ornate Turquoise Ring on Velvet.png', desc:'Nishapur turquoise in a hand-carved gold setting.',                   badge:'',        date:-4 },
  { id:12, name:'Diamond Halo Necklace',   cat:'necklaces',  price:6200, img:'photos/Ornate Turquoise Ring on Velvet.png', desc:'A halo of diamonds suspended on a delicate platinum chain.',          badge:'',        date:-5 },
];

/* ============================================
   3) محصولات — ذخیره در localStorage
   ============================================ */

/* خواندن محصولات از localStorage؛ اگر نبود → آرایه پیش‌فرض */
function loadProducts(){
  try {
    const raw = localStorage.getItem(KEYS.products);
    if(!raw) return [...DEFAULT_PRODUCTS];         // هیچ‌چیز ذخیره نشده → پیش‌فرض
    const arr = JSON.parse(raw);
    // اگر داده معتبر بود → همان؛ وگرنه پیش‌فرض
    return Array.isArray(arr) && arr.length ? arr : [...DEFAULT_PRODUCTS];
  } catch { return [...DEFAULT_PRODUCTS]; }         // خطای JSON → پیش‌فرض
}

/* ذخیره محصولات در localStorage */
function saveProducts(list){
  localStorage.setItem(KEYS.products, JSON.stringify(list));
}

/* PRODUCTS در حافظه — نقطه شروع همه‌ی رندرها */
let PRODUCTS = loadProducts();

/* ============================================
   4) مخاطبین — ذخیره در localStorage
   ============================================ */
let contacts = JSON.parse(localStorage.getItem(KEYS.contacts) || '[]');
function saveContacts(){
  localStorage.setItem(KEYS.contacts, JSON.stringify(contacts));
}

/* ============================================
   5) وضعیت (STATE)
   ============================================ */
let cart     = JSON.parse(localStorage.getItem(KEYS.cart) || '[]');      // سبد خرید
let wishlist = JSON.parse(localStorage.getItem(KEYS.wishlist) || '[]');  // علاقه‌مندی

/* ============================================
   6) توابع کمکی (HELPERS)
   ============================================ */
const $  = (s, p=document) => p.querySelector(s);            // انتخاب یک المان
const $$ = (s, p=document) => [...p.querySelectorAll(s)];    // انتخاب همه المان‌ها
const fmt = n => '$' + n.toLocaleString('en-US');            // قالب‌بندی قیمت
const findProduct = id => PRODUCTS.find(p => p.id === id);   // پیدا کردن محصول با id

function saveCart(){     localStorage.setItem(KEYS.cart, JSON.stringify(cart)); }
function saveWishlist(){ localStorage.setItem(KEYS.wishlist, JSON.stringify(wishlist)); }

/* ============================================
   7) توست — پیام شناور کوچک
   ============================================ */
function toast(msg){
  const el = $('#toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('is-show');
  clearTimeout(el._t);                                         // لغو تایمر قبلی
  el._t = setTimeout(() => el.classList.remove('is-show'), 2200); // مخفی بعد از ۲.۲ ثانیه
}

/* ============================================
   8) سبد خرید (CART)
   ============================================ */

/* مجموع مبلغ سبد */
function cartTotal(){
  return cart.reduce((sum, item) => {
    const p = findProduct(item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}

/* افزودن محصول به سبد (اگر بود → تعداد زیاد) */
function addToCart(id, qty = 1){
  if(!findProduct(id)) return;                                  // محصول نامعتبر
  const existing = cart.find(i => i.id === id);
  if(existing) existing.qty += qty;
  else cart.push({ id, qty });
  saveCart(); renderCart(); updateBadges();
  toast('Added to cart');
}

/* حذف کامل یک محصول از سبد */
function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart(); updateBadges();
}

/* تغییر تعداد (+/-) — اگر صفر شد، حذف */
function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) return removeFromCart(id);
  saveCart(); renderCart(); updateBadges();
}

/* رسم سبد خرید داخل drawer */
function renderCart(){
  const box     = $('#cartItems');
  const totalEl = $('#cartTotal');
  if(!box) return;

  // فقط محصولاتی که هنوز در PRODUCTS وجود دارند (مدیر ممکن است حذف کند)
  const valid = cart.filter(i => findProduct(i.id));

  if(valid.length === 0){
    box.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
  } else {
    box.innerHTML = valid.map(i => {
      const p = findProduct(i.id);
      return `
        <div class="cart-item">
          <img src="${p.img}" alt="${p.name}" />
          <div class="cart-item__info">
            <h4>${p.name}</h4>
            <span>${fmt(p.price)}</span>
            <div class="cart-item__qty">
              <button data-qty="-1" data-id="${p.id}">−</button>
              <span>${i.qty}</span>
              <button data-qty="1"  data-id="${p.id}">+</button>
            </div>
          </div>
          <button class="cart-item__remove" data-remove="${p.id}">&times;</button>
        </div>`;
    }).join('');
  }

  const total = cartTotal();
  if(totalEl) totalEl.textContent = fmt(total);
  renderShippingBar(total);

  // اتصال دکمه‌های +/- و حذف
  $$('[data-remove]', box).forEach(b => b.onclick = () => removeFromCart(+b.dataset.remove));
  $$('[data-qty]',   box).forEach(b => b.onclick = () => changeQty(+b.dataset.id, +b.dataset.qty));
}

/* نوار پیشرفت ارسال رایگان */
function renderShippingBar(total){
  const fill = $('#shippingFill');
  const text = $('#shippingText');
  if(!fill || !text) return;
  const pct = Math.min(100, (total / FREE_SHIPPING) * 100);
  fill.style.width = pct + '%';
  if(total >= FREE_SHIPPING){
    text.textContent = '🎉 Free shipping unlocked!';
    text.classList.add('is-done');
  } else {
    text.textContent = `You're ${fmt(FREE_SHIPPING - total)} away from free shipping`;
    text.classList.remove('is-done');
  }
}

/* ============================================
   9) علاقه‌مندی‌ها (WISHLIST)
   ============================================ */

/* اگر بود → حذف، اگر نبود → اضافه */
function toggleWish(id){
  if(wishlist.includes(id)){
    wishlist = wishlist.filter(w => w !== id);
    toast('Removed from wishlist');
  } else {
    wishlist.push(id);
    toast('Added to wishlist');
  }
  saveWishlist(); renderWishlist(); updateBadges();
  // آپدیت ظاهر همه دکمه‌های قلب مربوط به این محصول
  $$(`[data-wish="${id}"]`).forEach(b => b.classList.toggle('is-active'));
}

/* رسم لیست علاقه‌مندی داخل drawer */
function renderWishlist(){
  const box = $('#wishlistItems');
  if(!box) return;
  const valid = wishlist.filter(id => findProduct(id));
  if(valid.length === 0){
    box.innerHTML = '<p class="cart-empty">Your wishlist is empty.</p>';
    return;
  }
  box.innerHTML = valid.map(id => {
    const p = findProduct(id);
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}" />
        <div class="cart-item__info">
          <h4>${p.name}</h4>
          <span>${fmt(p.price)}</span>
          <div class="cart-item__qty">
            <button data-addwish="${p.id}" style="width:auto;padding:0 .6rem;font-size:.7rem;letter-spacing:.1em">Add to Cart</button>
          </div>
        </div>
        <button class="cart-item__remove" data-unwish="${p.id}">&times;</button>
      </div>`;
  }).join('');
  $$('[data-unwish]', box).forEach(b => b.onclick = () => toggleWish(+b.dataset.unwish));
  $$('[data-addwish]',box).forEach(b => b.onclick = () => addToCart(+b.dataset.addwish));
}

/* به‌روزرسانی عددهای badge روی آیکون‌ها */
function updateBadges(){
  const c = cart.reduce((s, i) => s + i.qty, 0);     // مجموع تعداد سبد
  const w = wishlist.length;                         // تعداد علاقه‌مندی
  const cc = $('#cartCount'), wc = $('#wishlistCount');
  if(cc){ cc.textContent = c; cc.classList.toggle('is-visible', c > 0); }
  if(wc){ wc.textContent = w; wc.classList.toggle('is-visible', w > 0); }
}

/* ============================================
   10) قالب کارت محصول (PRODUCT CARD)
   ============================================ */
function productCard(p){
  const wished = wishlist.includes(p.id);
  return `
    <article class="product">
      <div class="product__media">
        <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy" /></a>
        ${p.badge ? `<span class="product__badge">${p.badge}</span>` : ''}
        <button class="product__wish ${wished ? 'is-active' : ''}" data-wish="${p.id}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>
        </button>
      </div>
      <div class="product__info">
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <p>${p.cat[0].toUpperCase() + p.cat.slice(1)}</p>
        <div class="product__row">
          <span class="product__price">${fmt(p.price)}</span>
          <button class="product__add" data-add="${p.id}">Add to Cart</button>
        </div>
      </div>
    </article>`;
}

/* اتصال کلیک دکمه‌های سبد و علاقه‌مندی در یک محدوده */
function bindProductButtons(scope = document){
  $$('[data-add]', scope).forEach(b => b.onclick = e => { e.preventDefault(); addToCart(+b.dataset.add); });
  $$('[data-wish]',scope).forEach(b => b.onclick = e => { e.preventDefault(); toggleWish(+b.dataset.wish); });
}

/* ============================================
   11) صفحه اصلی — محصولات ویژه (FEATURED)
   ============================================ */
function renderFeatured(){
  const grid = $('#featuredGrid');
  if(!grid) return;
  grid.innerHTML = PRODUCTS.slice(0, 6).map(productCard).join(''); // فقط ۶ تای اول
  bindProductButtons(grid);
}

/* ============================================
   12) صفحه محصولات — فیلتر و مرتب‌سازی
   ============================================ */
let filterState = { cat: 'all', price: 'all', sort: 'newest' };

function renderProductsPage(){
  const grid = $('#productsGrid');
  if(!grid) return;

  let list = [...PRODUCTS];

  // فیلتر دسته
  if(filterState.cat   !== 'all') list = list.filter(p => p.cat === filterState.cat);

  // فیلتر قیمت (بازه)
  if(filterState.price !== 'all'){
    const [min, max] = filterState.price.split('-').map(Number);
    list = list.filter(p => p.price >= min && p.price <= max);
  }

  // مرتب‌سازی
  if(filterState.sort === 'price-asc')       list.sort((a, b) => a.price - b.price);
  else if(filterState.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else                                       list.sort((a, b) => b.date - a.date); // جدیدترین

  grid.innerHTML = list.map(productCard).join('');
  bindProductButtons(grid);

  const empty = $('#productsEmpty');
  if(empty) empty.style.display = list.length ? 'none' : 'block';

  // علامت‌گذاری دکمه فیلتر فعال
  $$('.filter-btn').forEach(b => b.classList.toggle('is-active', b.dataset.cat === filterState.cat));
}

function initProductsPage(){
  if(!$('#productsGrid')) return;

  // اگر ?cat=rings در URL بود، فیلتر اولیه را تنظیم کن
  const params = new URLSearchParams(location.search);
  if(params.get('cat')) filterState.cat = params.get('cat');

  // اتصال دکمه‌های دسته
  $$('.filter-btn').forEach(b => {
    b.onclick = () => { filterState.cat = b.dataset.cat; renderProductsPage(); };
  });

  // اتصال selectهای قیمت و مرتب‌سازی
  const pf = $('#priceFilter');
  const sf = $('#sortFilter');
  if(pf) pf.onchange = () => { filterState.price = pf.value; renderProductsPage(); };
  if(sf) sf.onchange = () => { filterState.sort  = sf.value; renderProductsPage(); };

  renderProductsPage();
}

/* ============================================
   13) صفحه جزئیات محصول (PRODUCT DETAIL)
   ============================================ */
function renderProductDetail(){
  const box = $('#productDetail');
  if(!box) return;

  // خواندن ?id= از URL
  const id = +new URLSearchParams(location.search).get('id');
  const p  = findProduct(id) || PRODUCTS[0];
  if(!p){ box.innerHTML = '<p class="cart-empty">Product not found.</p>'; return; }

  const wished = wishlist.includes(p.id);

  box.innerHTML = `
    <div class="product-detail__media"><img src="${p.img}" alt="${p.name}" /></div>
    <div class="product-detail__info">
      <span class="product-detail__cat">${p.cat}</span>
      <h1>${p.name}</h1>
      <div class="product-detail__price">${fmt(p.price)}</div>
      <p class="product-detail__desc">${p.desc || ''}</p>
      <div class="product-detail__actions">
        <button class="btn btn--gold" id="detailAdd">Add to Cart</button>
        <button class="btn btn--ghost ${wished ? 'is-active' : ''}" id="detailWish">
          ${wished ? 'In Wishlist' : 'Add to Wishlist'}
        </button>
      </div>
      <ul class="product-detail__meta">
        <li><span>Material</span> 18k gold · precious stones</li>
        <li><span>Origin</span> Handcrafted in Tehran</li>
        <li><span>Delivery</span> Complimentary insured shipping over $10,000</li>
        <li><span>Returns</span> 14-day returns on unworn pieces</li>
      </ul>
    </div>`;

  // اتصال دکمه‌ها
  $('#detailAdd').onclick  = () => addToCart(p.id);
  $('#detailWish').onclick = () => {
    toggleWish(p.id);
    const w   = wishlist.includes(p.id);
    const btn = $('#detailWish');
    btn.textContent = w ? 'In Wishlist' : 'Add to Wishlist';
    btn.classList.toggle('is-active', w);
  };
}

/* ============================================
   14) صفحه تسویه حساب (CHECKOUT)
   ============================================ */
function initCheckout(){
  const form = $('#checkoutForm');
  if(!form) return;

  const itemsEl = $('#checkoutItems');
  const subEl   = $('#checkoutSubtotal');
  const shipEl  = $('#checkoutShipping');
  const totEl   = $('#checkoutTotal');

  // رسم خلاصه سفارش
  const valid = cart.filter(i => findProduct(i.id));
  if(valid.length === 0){
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. <a href="products.html" style="color:var(--gold)">Browse collections</a></p>';
  } else {
    itemsEl.innerHTML = valid.map(i => {
      const p = findProduct(i.id);
      return `<div class="summary-item">
        <img src="${p.img}" alt="${p.name}" />
        <div><strong>${p.name}</strong><span>Qty ${i.qty}</span></div>
        <span>${fmt(p.price * i.qty)}</span>
      </div>`;
    }).join('');
  }

  // محاسبه هزینه‌ها
  const sub  = cartTotal();
  const ship = (sub >= FREE_SHIPPING || sub === 0) ? 0 : SHIPPING_COST;
  subEl.textContent  = fmt(sub);
  shipEl.textContent = ship === 0 ? 'Free' : fmt(ship);
  totEl.textContent  = fmt(sub + ship);

  // ثبت فرم
  form.onsubmit = e => {
    e.preventDefault();
    if(cart.length === 0){ toast('Your cart is empty'); return; }

    const method = form.querySelector('input[name="pay"]:checked')?.value || 'card';
    localStorage.setItem(KEYS.orderTotal, String(sub + ship));

    // پرداخت نقدی → مستقیم به success
    if(method === 'cash'){
      cart = [];
      saveCart();
      localStorage.setItem(KEYS.lastOrder, 'MV-' + Math.floor(100000 + Math.random() * 900000));
      location.href = 'success.html';
      return;
    }
    // کارت → به صفحه پرداخت
    location.href = 'payment.html';
  };
}

/* ============================================
   15) صفحه پرداخت (PAYMENT)
   ============================================ */
function initPayment(){
  const form = $('#paymentForm');
  if(!form) return;

  const total = +(localStorage.getItem(KEYS.orderTotal) || cartTotal());
  $('#payAmount').textContent = fmt(total);

  form.onsubmit = e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.textContent = 'Processing...';
    btn.disabled = true;

    // شبیه‌سازی پرداخت (۱.۴ ثانیه تاخیر)
    setTimeout(() => {
      cart = [];
      saveCart();
      localStorage.setItem(KEYS.lastOrder, 'MV-' + Math.floor(100000 + Math.random() * 900000));
      location.href = 'success.html';
    }, 1400);
  };
}

/* ============================================
   16) صفحه موفقیت (SUCCESS)
   ============================================ */
function initSuccess(){
  const el = $('#orderNumber');
  if(!el) return;
  el.textContent = localStorage.getItem(KEYS.lastOrder) || 'MV-000000';
}

/* ============================================
   17) پنل ادمین (ADMIN PANEL)
   شامل: ورود، تب‌ها، محصولات، مخاطبین
   ============================================ */
function isAdminLoggedIn(){
  return localStorage.getItem(KEYS.adminSession) === ADMIN_EMAIL;
}

function initAdmin(){
  const loginView = $('#adminLogin');
  const dashView  = $('#adminDashboard');
  if(!loginView || !dashView) return;  // این صفحه admin نیست

  /* ---------- ورود مدیر ---------- */
  $('#adminLoginForm').onsubmit = e => {
    e.preventDefault();
    const email = $('#adminEmail').value.trim().toLowerCase();
    if(email === ADMIN_EMAIL){
      localStorage.setItem(KEYS.adminSession, ADMIN_EMAIL);
      showDashboard();
      toast('Welcome, Admin');
    } else {
      toast('Invalid admin email');
    }
  };

  /* ---------- نمایش/پنهان کردن داشبورد ---------- */
  function showDashboard(){
    loginView.style.display = 'none';
    dashView.style.display  = 'block';
    renderAdminList();
    renderContactsList();
  }
  function showLogin(){
    loginView.style.display = 'block';
    dashView.style.display  = 'none';
  }

  /* ---------- خروج ---------- */
  $('#adminLogout').onclick = () => {
    localStorage.removeItem(KEYS.adminSession);
    showLogin();
    toast('Logged out');
  };

  /* ---------- تب‌ها (Products / Contacts) ---------- */
  $$('.admin-tab').forEach(btn => {
    btn.onclick = () => {
      $$('.admin-tab').forEach(b => b.classList.toggle('is-active', b === btn));
      $$('.admin-tab-panel').forEach(p => p.classList.toggle('is-active',
        p.id === 'tab-' + btn.dataset.tab));
    };
  });

  /* ============================================
     محصولات — افزودن / حذف / بازگردانی
     ============================================ */

  // بازگردانی به محصولات پیش‌فرض
  $('#adminReset').onclick = () => {
    if(!confirm('Reset all products to defaults?')) return;
    PRODUCTS = [...DEFAULT_PRODUCTS];
    saveProducts(PRODUCTS);
    renderAdminList();
    toast('Products reset to defaults');
  };

  // افزودن محصول جدید
  $('#adminAddForm').onsubmit = e => {
    e.preventDefault();
    const newProduct = {
      id:    PRODUCTS.length ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1,
      name:  $('#newName').value.trim(),
      cat:   $('#newCat').value,
      price: +$('#newPrice').value,
      img:   $('#newImg').value.trim(),
      badge: $('#newBadge').value.trim(),
      desc:  $('#newDesc').value.trim(),
      date:  Date.now()
    };
    if(!newProduct.name || !newProduct.img || !newProduct.price){
      toast('Please fill required fields'); return;
    }
    PRODUCTS.push(newProduct);
    saveProducts(PRODUCTS);
    e.target.reset();
    renderAdminList();
    toast('Product added');
  };

  // حذف محصول + پاکسازی از سبد و علاقه‌مندی
  function deleteProduct(id){
    if(!confirm('Delete this product?')) return;
    PRODUCTS = PRODUCTS.filter(p => p.id !== id);
    saveProducts(PRODUCTS);
    cart     = cart.filter(i => i.id !== id);  saveCart();
    wishlist = wishlist.filter(w => w !== id); saveWishlist();
    renderAdminList();
    toast('Product deleted');
  }

  // رسم لیست محصولات در پنل
  function renderAdminList(){
    const list  = $('#adminProductList');
    const count = $('#adminCount');
    if(!list) return;
    if(count) count.textContent = PRODUCTS.length;

    if(PRODUCTS.length === 0){
      list.innerHTML = '<p class="cart-empty">No products yet.</p>';
      return;
    }

    list.innerHTML = PRODUCTS.map(p => `
      <div class="admin-product">
        <img src="${p.img}" alt="${p.name}" onerror="this.style.opacity=.2" />
        <div class="admin-product__info">
          <strong>${p.name}</strong>
          <span>${p.cat} · ${fmt(p.price)}</span>
        </div>
        <button class="admin-product__del" data-del="${p.id}" aria-label="Delete">🗑</button>
      </div>`).join('');

    $$('[data-del]', list).forEach(b => b.onclick = () => deleteProduct(+b.dataset.del));
  }

  /* ============================================
     مخاطبین — افزودن / ویرایش / حذف / جستجو
     ============================================ */

  // افزودن مخاطب
  $('#contactForm').onsubmit = e => {
    e.preventDefault();
    const name  = $('#cName').value.trim();
    const phone = $('#cPhone').value.trim();
    const email = $('#cEmail').value.trim();
    if(!name || !phone || !email){
      toast('Please fill all fields'); return;
    }
    contacts.push({ id: Date.now(), name, phone, email });
    saveContacts();
    e.target.reset();
    renderContactsList();
    toast('Contact registered');
  };

  // جستجو زنده
  $('#contactsSearch').oninput = () => {
    renderContactsList($('#contactsSearch').value.trim());
  };

  /* ---------- ویرایش مخاطب ---------- */
  let editingContactId = null;

  function openEditContact(id){
    const c = contacts.find(x => x.id === id);
    if(!c) return;
    editingContactId = id;
    $('#eName').value  = c.name;
    $('#ePhone').value = c.phone;
    $('#eEmail').value = c.email;
    $('#editContactModal').classList.add('is-open');
    document.body.style.overflow = 'hidden';      // قفل اسکرول
    setTimeout(() => $('#eName').focus(), 100);
  }
  function closeEditContact(){
    $('#editContactModal').classList.remove('is-open');
    document.body.style.overflow = '';            // آزاد کردن اسکرول
  }

  $('#editContactClose').onclick   = closeEditContact;
  $('#editContactOverlay').onclick = closeEditContact;

  // ذخیره ویرایش
  $('#editContactForm').onsubmit = e => {
    e.preventDefault();
    const c = contacts.find(x => x.id === editingContactId);
    if(!c) return;
    c.name  = $('#eName').value.trim();
    c.phone = $('#ePhone').value.trim();
    c.email = $('#eEmail').value.trim();
    saveContacts();
    closeEditContact();
    renderContactsList($('#contactsSearch').value.trim());
    toast('Contact updated');
  };

  /* ---------- حذف مخاطب ---------- */
  function deleteContact(id){
    if(!confirm('Delete this contact?')) return;
    contacts = contacts.filter(c => c.id !== id);
    saveContacts();
    renderContactsList($('#contactsSearch').value.trim());
    toast('Contact deleted');
  }

  /* ---------- رسم لیست مخاطبین ---------- */
  function renderContactsList(query = ''){
    const list  = $('#contactsList');
    const count = $('#contactsCount');
    if(!list) return;
    if(count) count.textContent = contacts.length;

    // فیلتر جستجو
    const q = query.toLowerCase();
    const filtered = contacts.filter(c =>
      c.name.toLowerCase().includes(q)  ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );

    if(filtered.length === 0){
      list.innerHTML = `<p class="cart-empty">${
        contacts.length === 0 ? 'No contacts yet.' : 'No results match your search.'
      }</p>`;
      return;
    }

    list.innerHTML = filtered.map(c => `
      <div class="admin-contact">
        <div class="admin-contact__avatar">${c.name.charAt(0).toUpperCase()}</div>
        <div class="admin-contact__info">
          <strong>${c.name}</strong>
          <span>${c.email}</span>
          <span>${c.phone}</span>
        </div>
        <div class="admin-contact__actions">
          <button class="admin-contact__edit" data-edit="${c.id}" aria-label="Edit">✎</button>
          <button class="admin-contact__del"  data-del="${c.id}"  aria-label="Delete">🗑</button>
        </div>
      </div>`).join('');

    // اتصال دکمه‌های ویرایش و حذف
    $$('[data-edit]', list).forEach(b => b.onclick = () => openEditContact(+b.dataset.edit));
    $$('[data-del]',  list).forEach(b => b.onclick = () => deleteContact(+b.dataset.del));
  }

  /* ---------- نمایش اولیه ---------- */
  if(isAdminLoggedIn()) showDashboard();
  else                  showLogin();
}

/* ============================================
   18) کشوهای کناری (DRAWERS) — سبد و علاقه‌مندی
   ============================================ */
function initDrawers(){
  const overlay   = $('#drawerOverlay');
  const cartDrawer= $('#cartDrawer');
  const wishDrawer= $('#wishlistDrawer');

  const closeAll = () => {
    overlay?.classList.remove('is-open');
    cartDrawer?.classList.remove('is-open');
    wishDrawer?.classList.remove('is-open');
    document.body.style.overflow = '';             // آزاد کردن اسکرول
  };
  const open = d => {
    closeAll();
    d?.classList.add('is-open');
    overlay?.classList.add('is-open');
    document.body.style.overflow = 'hidden';        // قفل اسکرول
  };

  $('#cartBtn')?.addEventListener('click',     () => open(cartDrawer));
  $('#wishlistBtn')?.addEventListener('click', () => open(wishDrawer));
  overlay?.addEventListener('click', closeAll);
  $$('[data-close]').forEach(b => b.addEventListener('click', closeAll));
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeAll(); });
}

/* ============================================
   19) نویگیشن (NAV)
   شامل: افکت اسکرول + منوی موبایل
   ============================================ */
function initNav(){
  const nav = $('#nav');
  // اگر nav--solid نباشد (صفحه اصلی)، با اسکرول بک‌گراند اضافه شود
  if(nav && !nav.classList.contains('nav--solid')){
    window.addEventListener('scroll', () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    });
  }
  // منوی همبرگری
  const toggle = $('#navToggle');
  const links  = $('.nav__links');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('is-open');
    links?.classList.toggle('is-open');
  });
}

/* ============================================
   20) نشانگر ماوس سفارشی (CURSOR)
   ============================================ */
function initCursor(){
  const c = $('#cursor'), d = $('#cursorDot');
  if(!c || !d) return;

  let x = 0, y = 0, cx = 0, cy = 0;          // موقعیت هدف و فعلی

  // حرکت نقطه‌ی دقیق با ماوس
  window.addEventListener('mousemove', e => {
    x = e.clientX; y = e.clientY;
    d.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
  });

  // حرکت نرم دایره (با تاخیر) با requestAnimationFrame
  (function loop(){
    cx += (x - cx) * 0.15;
    cy += (y - cy) * 0.15;
    c.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();

  // بزرگ‌تر شدن روی عناصر تعاملی
  const bindHover = () => {
    $$('a, button, .product, .collection-card').forEach(el => {
      if(el._cursorBound) return;           // جلوگیری از اتصال مکرر
      el._cursorBound = true;
      el.addEventListener('mouseenter', () => c.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => c.classList.remove('is-hover'));
    });
  };
  bindHover();
  setTimeout(bindHover, 400);               // اتصال مجدد بعد از رندر محتوای داینامیک
}

/* ============================================
   21) پیش‌لودر (PRELOADER)
   ============================================ */
function initPreloader(){
  const p = $('#preloader');
  if(!p) return;

  // وقتی صفحه لود شد → بعد از ۲.۱ ثانیه محو شود
  window.addEventListener('load', () => {
    setTimeout(() => p.classList.add('is-done'), 2100);
  });
  // fallback: هر حالا بعد ۳.۵ ثانیه محو شود
  setTimeout(() => p.classList.add('is-done'), 3500);
}

/* ============================================
   22) ظاهر شدن با اسکرول (REVEAL)
   ============================================ */
function initReveal(){
  const els = $$('.section-title, .section-eyebrow, .story__text p, .story__media, .collection-card, .craft__step, .product, .quote__text, .contact__info, .contact__form');
  if(!('IntersectionObserver' in window) || els.length === 0) return;

  // ابتدا مخفی
  els.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition= 'opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1)';
  });

  // وقتی وارد دید شد → نمایش
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
}

/* ============================================
   23) اجرای همه در start (BOOT)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderCart();         // رسم سبد
  renderWishlist();     // رسم علاقه‌مندی
  updateBadges();       // به‌روز کردن عددها
  renderFeatured();     // محصولات ویژه صفحه اصلی
  initProductsPage();   // فیلترها صفحه محصولات
  renderProductDetail();// صفحه جزئیات
  initCheckout();       // فرم تسویه
  initPayment();        // فرم پرداخت
  initSuccess();        // شماره سفارش
  initAdmin();          // پنل ادمین (تب + محصولات + مخاطبین)
  initDrawers();        // کشوها
  initNav();            // نویگیشن
  initCursor();         // موس سفارشی
  initPreloader();      // پیش‌لودر
  initReveal();         // افکت اسکرول
});