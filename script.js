(() => {
  'use strict';

  const products = [
    {id:'espresso',name:'Эспрессо',description:'Плотный, сладкий и с долгим послевкусием.',price:900,category:'hot',categoryName:'Горячий кофе',image:'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=900&q=80',alt:'Чашка эспрессо на кофейном столе'},
    {id:'americano',name:'Американо',description:'Чистый вкус зерна в лёгком формате.',price:1100,category:'hot',categoryName:'Горячий кофе',image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',alt:'Чёрный кофе в керамической чашке'},
    {id:'cappuccino',name:'Капучино',description:'Двойной эспрессо и нежная молочная текстура.',price:1500,category:'hot',categoryName:'Горячий кофе',image:'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=900&q=80',alt:'Капучино с молочной пеной'},
    {id:'flat-white',name:'Флэт уайт',description:'Бархатное молоко и выразительное зерно.',price:1600,category:'hot',categoryName:'Горячий кофе',image:'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80',alt:'Флэт уайт в белой чашке'},
    {id:'iced-latte',name:'Айс-латте',description:'Эспрессо, молоко и звонкий лёд.',price:1700,category:'cold',categoryName:'Холодный кофе',image:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80',alt:'Холодный латте со льдом'},
    {id:'cold-brew',name:'Колд брю',description:'Медленная экстракция, мягкий вкус и лёд.',price:1800,category:'cold',categoryName:'Холодный кофе',image:'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',alt:'Стакан холодного кофе'},
    {id:'espresso-tonic',name:'Эспрессо-тоник',description:'Цитрусовая свежесть и яркий кофейный акцент.',price:1900,category:'cold',categoryName:'Холодный кофе',image:'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=80',alt:'Кофейный напиток со льдом'},
    {id:'matcha-latte',name:'Матча-латте',description:'Нежная молочная текстура с чаем матча.',price:1900,category:'tea',categoryName:'Чай',image:'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80',alt:'Матча латте в стеклянном стакане'},
    {id:'earl-grey',name:'Эрл грей',description:'Чёрный чай с ароматом бергамота.',price:1000,category:'tea',categoryName:'Чай',image:'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',alt:'Чай в прозрачном чайнике'},
    {id:'cheesecake',name:'Чизкейк',description:'Сливочный, с тонкой песочной основой.',price:1900,category:'dessert',categoryName:'Десерты',image:'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80',alt:'Кусочек чизкейка на тарелке'},
    {id:'croissant',name:'Круассан',description:'Слоёный, румяный, испечённый к утру.',price:1100,category:'dessert',categoryName:'Десерты',image:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',alt:'Свежий золотистый круассан'},
    {id:'tart',name:'Тарт с ягодами',description:'Хрустящая основа, крем и сезонные ягоды.',price:2200,category:'dessert',categoryName:'Десерты',image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',alt:'Десертный тарт с ягодами'}
  ];

  const STORAGE_KEY = 'mono-coffee-cart-v1';
  const productGrid = document.querySelector('#product-grid');
  const searchInput = document.querySelector('#menu-search');
  const resultsStatus = document.querySelector('#results-status');
  const cartDrawer = document.querySelector('#cart-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const cartContent = document.querySelector('#cart-content');
  const drawerBottom = document.querySelector('#drawer-bottom');
  const cartTrigger = document.querySelector('.cart-trigger');
  const toast = document.querySelector('.toast');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('#site-nav');
  let selectedCategory = 'all';
  let cart = loadCart();
  let checkoutOpen = false;
  let orderComplete = false;
  let toastTimer;
  let lastFocusedElement = null;

  const formatPrice = (amount) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits:0}).format(amount) + ' ₸';
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
      const valid = {};
      Object.entries(saved).forEach(([id, quantity]) => {
        if (products.some(product => product.id === id) && Number.isInteger(quantity) && quantity > 0 && quantity < 100) valid[id] = quantity;
      });
      return valid;
    } catch { return {}; }
  }

  function persistCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    catch { showToast('Не удалось сохранить корзину в этом браузере'); }
  }

  function cartCount() { return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0); }
  function cartTotal() { return products.reduce((sum, product) => sum + product.price * (cart[product.id] || 0), 0); }

  function renderProducts() {
    const query = searchInput.value.trim().toLocaleLowerCase('ru');
    const shown = products.filter(product => (selectedCategory === 'all' || product.category === selectedCategory) && (!query || `${product.name} ${product.description} ${product.categoryName}`.toLocaleLowerCase('ru').includes(query)));
    productGrid.innerHTML = shown.length ? shown.map(product => `
      <article class="product-card">
        <div class="product-image"><img src="${product.image}" alt="${escapeHTML(product.alt)}" loading="lazy"><span class="product-tag">${escapeHTML(product.categoryName.toLocaleUpperCase('ru'))}</span></div>
        <div class="product-meta"><h3 class="product-title">${escapeHTML(product.name)}</h3><span class="product-price">${formatPrice(product.price)}</span></div>
        <p class="product-description">${escapeHTML(product.description)}</p>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Добавить ${escapeHTML(product.name)} в корзину">Добавить в корзину <span aria-hidden="true">＋</span></button>
      </article>`).join('') : '<div class="empty-results"><strong>Ничего не найдено.</strong><br>Попробуйте изменить запрос или категорию.</div>';
    resultsStatus.textContent = shown.length ? `Позиций в меню: ${shown.length}` : '';
  }

  function renderCart() {
    const count = cartCount();
    document.querySelector('.cart-count').textContent = count;
    document.querySelector('.drawer-count').textContent = `(${count})`;
    cartTrigger.setAttribute('aria-label', `Открыть корзину, товаров: ${count}`);

    if (orderComplete) {
      cartContent.innerHTML = '<div class="order-success"><div class="success-mark" aria-hidden="true">✓</div><h3>Демо-заказ оформлен</h3><p>Это демонстрационный сценарий: заказ никуда не отправлен, оплата не производилась, данные не сохранены и не переданы.</p><button class="button button-dark success-close" type="button">Понятно</button></div>';
      drawerBottom.innerHTML = '';
      return;
    }

    const entries = products.filter(product => cart[product.id]);
    if (!entries.length) {
      checkoutOpen = false;
      cartContent.innerHTML = '<div class="cart-empty"><span class="empty-icon" aria-hidden="true">○</span><h3>Пока здесь пусто</h3><p>Выберите что-нибудь вкусное в меню.</p><button class="continue-button" type="button" data-continue>Продолжить покупки</button></div>';
      drawerBottom.innerHTML = '';
      return;
    }

    cartContent.innerHTML = entries.map(product => `
      <article class="cart-line">
        <img src="${product.image}" alt="" loading="lazy">
        <div class="cart-line-info"><h3>${escapeHTML(product.name)}</h3><span>${formatPrice(product.price)} / шт.</span>
          <div class="quantity-control" aria-label="Количество: ${cart[product.id]}">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Уменьшить количество: ${escapeHTML(product.name)}">−</button>
            <output>${cart[product.id]}</output>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Увеличить количество: ${escapeHTML(product.name)}">+</button>
          </div>
        </div>
        <div class="cart-line-price"><span>${formatPrice(product.price * cart[product.id])}</span><button class="remove-item" type="button" data-remove="${product.id}" aria-label="Удалить ${escapeHTML(product.name)}">Удалить</button></div>
      </article>`).join('');

    const summary = `<div class="drawer-summary"><span>Итого <small>${count} ${pluralize(count)} · оплата не подключена</small></span><span>${formatPrice(cartTotal())}</span></div>`;
    if (checkoutOpen) {
      drawerBottom.innerHTML = `${summary}
        <form class="checkout-form" id="checkout-form" novalidate>
          <h3>Детали заказа</h3>
          <div class="form-grid">
            <div class="form-field"><label for="customer-name">Имя *</label><input id="customer-name" name="name" autocomplete="name" required maxlength="60" placeholder="Как к вам обращаться"><small class="field-error" data-error="name"></small></div>
            <div class="form-field"><label for="customer-phone">Телефон *</label><input id="customer-phone" name="phone" type="tel" autocomplete="tel" required inputmode="tel" maxlength="24" placeholder="+7 700 000 00 00"><small class="field-error" data-error="phone"></small></div>
            <div class="form-field full"><label for="order-method">Способ получения *</label><select id="order-method" name="method" required><option value="">Выберите способ</option><option value="pickup">Самовывоз</option><option value="cafe">В кофейне</option></select><small class="field-error" data-error="method"></small></div>
            <div class="form-field full"><label for="order-comment">Комментарий <span class="muted">(необязательно)</span></label><textarea id="order-comment" name="comment" maxlength="240" placeholder="Пожелания к заказу"></textarea></div>
          </div>
          <div class="checkout-total"><span>К оплате при получении</span><span>${formatPrice(cartTotal())}</span></div>
          <button class="button button-dark" type="submit">Создать демо-заказ <span aria-hidden="true">↗</span></button>
          <p class="demo-disclaimer">Демонстрация: заказ не отправляется, платежи и обработка персональных данных не выполняются.</p>
          <button class="clear-cart back-to-cart" type="button">← Вернуться к корзине</button>
        </form>`;
    } else {
      drawerBottom.innerHTML = `${summary}<button class="button button-dark checkout-button" type="button" data-checkout>Перейти к оформлению <span aria-hidden="true">↗</span></button><button class="clear-cart" type="button" data-clear>Очистить корзину</button>`;
    }
  }

  function pluralize(number) {
    const mod10 = number % 10, mod100 = number % 100;
    if (mod10 === 1 && mod100 !== 11) return 'товар';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара';
    return 'товаров';
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function openCart() {
    lastFocusedElement = document.activeElement;
    orderComplete = false;
    checkoutOpen = false;
    renderCart();
    document.body.classList.add('drawer-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add('is-visible');
      cartDrawer.classList.add('is-open');
      cartDrawer.focus();
    });
  }

  function closeCart() {
    if (!cartDrawer.classList.contains('is-open')) return;
    cartDrawer.classList.remove('is-open');
    backdrop.classList.remove('is-visible');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    setTimeout(() => { if (!cartDrawer.classList.contains('is-open')) backdrop.hidden = true; }, 300);
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
  }

  function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    cart[id] = Math.min((cart[id] || 0) + 1, 99);
    persistCart();
    renderCart();
    showToast(`${product.name} добавлен в корзину`);
  }

  function setFieldError(name, message) {
    const input = document.querySelector(`[name="${name}"]`);
    const error = document.querySelector(`[data-error="${name}"]`);
    if (!input || !error) return;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message;
  }

  function validateCheckout(form) {
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const method = String(data.get('method') || '').trim();
    let valid = true;
    if (name.length < 2 || !/[\p{L}]/u.test(name)) { setFieldError('name', 'Введите имя (не менее 2 символов).'); valid = false; }
    else setFieldError('name', '');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15 || !/^[+\d(][\d\s()+-]*$/.test(phone)) { setFieldError('phone', 'Введите корректный номер телефона.'); valid = false; }
    else setFieldError('phone', '');
    if (!['pickup','cafe'].includes(method)) { setFieldError('method', 'Выберите способ получения.'); valid = false; }
    else setFieldError('method', '');
    return valid;
  }

  document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
    selectedCategory = button.dataset.category;
    document.querySelectorAll('.filter-button').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderProducts();
  }));
  searchInput.addEventListener('input', renderProducts);
  productGrid.addEventListener('click', event => {
    const button = event.target.closest('[data-add]');
    if (button) addToCart(button.dataset.add);
  });
  cartTrigger.addEventListener('click', openCart);
  document.querySelector('.close-cart').addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);
  cartContent.addEventListener('click', event => {
    if (event.target.closest('[data-continue]') || event.target.closest('.success-close')) { closeCart(); return; }
    const quantityButton = event.target.closest('[data-quantity]');
    if (quantityButton) {
      const id = quantityButton.dataset.quantity;
      const next = (cart[id] || 0) + Number(quantityButton.dataset.change);
      if (next <= 0) delete cart[id]; else cart[id] = Math.min(next, 99);
      persistCart(); renderCart(); return;
    }
    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) { delete cart[removeButton.dataset.remove]; persistCart(); renderCart(); showToast('Товар удалён'); }
  });
  drawerBottom.addEventListener('click', event => {
    if (event.target.closest('[data-checkout]')) { checkoutOpen = true; renderCart(); document.querySelector('#customer-name')?.focus(); }
    if (event.target.closest('[data-clear]')) { cart = {}; checkoutOpen = false; persistCart(); renderCart(); showToast('Корзина очищена'); }
    if (event.target.closest('.back-to-cart')) { checkoutOpen = false; renderCart(); }
  });
  drawerBottom.addEventListener('submit', event => {
    if (event.target.id !== 'checkout-form') return;
    event.preventDefault();
    if (!validateCheckout(event.target)) {
      event.target.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    // Intentional demo-only flow: form fields are not stored or sent anywhere.
    cart = {};
    persistCart();
    checkoutOpen = false;
    orderComplete = true;
    renderCart();
  });
  drawerBottom.addEventListener('input', event => {
    if (event.target.matches('[aria-invalid="true"]')) setFieldError(event.target.name, '');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (cartDrawer.classList.contains('is-open')) closeCart();
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    if (event.key === 'Tab' && cartDrawer.classList.contains('is-open')) {
      const focusable = [...cartDrawer.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    siteNav.classList.toggle('is-open', open);
  });
  siteNav.addEventListener('click', event => {
    if (event.target.closest('a')) { siteNav.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); }
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
})();
