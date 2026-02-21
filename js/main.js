/* ============================================
   JACOPO PECA — MAIN JAVASCRIPT
   ============================================ */

'use strict';

/* ---- CART STATE ---- */
let cart = JSON.parse(localStorage.getItem('jp_cart') || '[]');

function saveCart() {
  localStorage.setItem('jp_cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  document.querySelectorAll('.cart-count').forEach(el => {
    const count = getCartCount();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id && i.size === product.size);
  if (existing) {
    existing.qty += product.qty || 1;
  } else {
    cart.push({ ...product, qty: product.qty || 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`<i class="fa-solid fa-bag-shopping"></i> <span><strong>${product.name}</strong> aggiunto al carrello</span>`);
}

function removeFromCart(id, size) {
  cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart();
  updateCartBadge();
  if (typeof renderCart === 'function') renderCart();
}

function updateQty(id, size, qty) {
  const item = cart.find(i => i.id === id && i.size === size);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart();
  }
  if (typeof renderCart === 'function') renderCart();
}

/* ---- TOAST ---- */
let toastTimeout;
function showToast(html) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = html;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---- MOBILE MENU ---- */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.mobile-menu__close');

  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  mobileMenu.addEventListener('click', e => {
    if (e.target === mobileMenu) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ---- FILTER TOGGLE (mobile) ---- */
function initFilterToggle() {
  const filterGroups = document.querySelectorAll('.filter-group__title');
  filterGroups.forEach(title => {
    title.addEventListener('click', () => {
      title.classList.toggle('collapsed');
      const options = title.nextElementSibling;
      if (options) {
        options.style.display = title.classList.contains('collapsed') ? 'none' : '';
      }
    });
  });

  // Mobile filter toggle
  const filterToggleBtn = document.querySelector('.filter-toggle-btn');
  const sidebar = document.querySelector('.filters');
  if (filterToggleBtn && sidebar) {
    filterToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      filterToggleBtn.textContent = sidebar.classList.contains('open') ? 'Nascondi filtri' : 'Mostra filtri';
    });
  }
}

/* ---- VIEW MODE (grid/list) ---- */
function initViewMode() {
  const viewBtns = document.querySelectorAll('.view-btn');
  const grid = document.querySelector('.products-grid');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (grid) {
        if (btn.dataset.view === 'list') {
          grid.style.gridTemplateColumns = '1fr';
        } else {
          grid.style.gridTemplateColumns = '';
        }
      }
    });
  });
}

/* ---- SIZE SELECTOR ---- */
function initSizeSelector() {
  const sizeBtns = document.querySelectorAll('.size-btn:not(:disabled)');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ---- QUANTITY SELECTOR ---- */
function initQtySelector() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.quantity-selector').querySelector('.qty-input');
      let val = parseInt(input.value) || 1;
      if (btn.dataset.action === 'plus') val++;
      if (btn.dataset.action === 'minus') val = Math.max(1, val - 1);
      input.value = val;
    });
  });
}

/* ---- ADD TO CART (product page) ---- */
function initAddToCart() {
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-product]');
      if (!card) return;
      const product = {
        id:    card.dataset.productId || Math.random().toString(36).slice(2),
        name:  card.dataset.productName || 'Prodotto',
        price: parseFloat(card.dataset.productPrice) || 0,
        size:  'U',
        qty:   1,
      };
      addToCart(product);
    });
  });

  // Product detail page
  const addBtn = document.querySelector('#btn-add-to-cart');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const activeSize = document.querySelector('.size-btn.active');
      const qty = parseInt(document.querySelector('.qty-input')?.value) || 1;
      if (!activeSize) {
        showToast('<i class="fa-solid fa-triangle-exclamation"></i> <span>Seleziona una taglia</span>');
        return;
      }
      addToCart({
        id:    addBtn.dataset.productId,
        name:  addBtn.dataset.productName,
        price: parseFloat(addBtn.dataset.productPrice),
        size:  activeSize.textContent.trim(),
        qty,
      });
    });
  }
}

/* ---- GALLERY THUMBNAILS ---- */
function initGallery() {
  const thumbs = document.querySelectorAll('.product-gallery__thumb');
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  if (thumbs.length) thumbs[0].classList.add('active');
}

/* ---- NEWSLETTER ---- */
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.value) return;
    showToast('<i class="fa-solid fa-check"></i> <span>Iscrizione avvenuta con successo!</span>');
    input.value = '';
  });
}

/* ---- STICKY HEADER SHADOW ---- */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.6)';
    } else {
      header.style.boxShadow = '';
    }
  }, { passive: true });
}

/* ---- CART PAGE RENDER ---- */
function renderCart() {
  const tbody = document.querySelector('#cart-items');
  const emptyMsg = document.querySelector('#cart-empty');
  const cartContent = document.querySelector('#cart-content');
  if (!tbody) return;

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (cartContent) cartContent.style.display = '';

  tbody.innerHTML = cart.map(item => `
    <tr>
      <td>
        <div class="cart-item__td-product">
          <div class="cart-item__img"><i class="fa-regular fa-image"></i></div>
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__variant">Taglia: ${item.size}</div>
          </div>
        </div>
      </td>
      <td>€${item.price.toFixed(2)}</td>
      <td>
        <div class="quantity-selector" style="border:none;gap:4px;">
          <button class="qty-btn" onclick="cartQty('${item.id}','${item.size}',-1)" data-action="minus">−</button>
          <input class="qty-input" type="number" value="${item.qty}" min="1"
            onchange="cartQtySet('${item.id}','${item.size}',this.value)" style="width:44px;">
          <button class="qty-btn" onclick="cartQty('${item.id}','${item.size}',1)" data-action="plus">+</button>
        </div>
      </td>
      <td>€${(item.price * item.qty).toFixed(2)}</td>
      <td>
        <button class="cart-remove" onclick="removeFromCart('${item.id}','${item.size}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </td>
    </tr>
  `).join('');

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 6.90) : 0;
  const total = subtotal + shipping;

  const set = (sel, val) => { const el = document.querySelector(sel); if(el) el.textContent = val; };
  set('#summary-subtotal', `€${subtotal.toFixed(2)}`);
  set('#summary-shipping', shipping === 0 ? 'Gratuita' : `€${shipping.toFixed(2)}`);
  set('#summary-total', `€${total.toFixed(2)}`);
}

window.cartQty = (id, size, delta) => {
  const item = cart.find(i => i.id === id && i.size === size);
  if (item) updateQty(id, size, item.qty + delta);
};

window.cartQtySet = (id, size, val) => {
  updateQty(id, size, parseInt(val));
};

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initMobileMenu();
  initFilterToggle();
  initViewMode();
  initSizeSelector();
  initQtySelector();
  initAddToCart();
  initGallery();
  initNewsletter();
  initStickyHeader();
  renderCart();
});
