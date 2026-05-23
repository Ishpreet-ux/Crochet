
/* ============================
   PRODUCT DATA
==============================*/
const PRODUCTS = [
  { id:1, name:"Strawberry Plushie", emoji:"🍓", desc:"Super squishy amigurumi, 15cm tall. Great gift!", price:249, badge:"Bestseller" },
  { id:2, name:"Bunny Keychain",     emoji:"🐰", desc:"Mini bunny charm with a blush bow. Adorbs!", price:129, badge:"" },
  { id:3, name:"Cloud Cushion",      emoji:"☁️", desc:"Fluffy cloud-shaped pillow in pastel blue.", price:399, badge:"New" },
  { id:4, name:"Rainbow Scarf",      emoji:"🌈", desc:"Lightweight striped scarf, one size fits all.", price:349, badge:"" },
  { id:5, name:"Ghost Plushie",      emoji:"👻", desc:"Tiny spooky friend, just 10cm. So cute it's scary!", price:199, badge:"" },
  { id:6, name:"Sunflower Headband", emoji:"🌻", desc:"Chunky crochet headband, adjustable & cozy.", price:179, badge:"New" },
  { id:7, name:"Heart Bag Charm",    emoji:"🫶", desc:"Crochet heart charm, clips to any bag.", price:99,  badge:"" },
  { id:8, name:"Bear Plushie",       emoji:"🐻", desc:"Classic teddy bear, handmade & huggable.", price:299, badge:"Popular" },
];

/* ============================
   GOOGLE SHEETS WEB APP URL
   → Replace this with your deployed Apps Script URL
==============================*/
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbz9GpQ3nUwZYjIkCAJOR7y0R3a5kRTOmZyGGunR5SF6ueDEfmqWGeTy_MUFpUF1vqgasw/exec";
const SHEET_ID = "136rCH9XqH530Kf8DhYhwSIh1jOXIi8_9K5ziACK33pk";

/* ============================
   CART STATE (localStorage)
==============================*/
let cart = JSON.parse(localStorage.getItem("loopy_cart") || "[]");
let selectedPayment = "UPI";

function saveCart() { localStorage.setItem("loopy_cart", JSON.stringify(cart)); }

/* ============================
   RENDER PRODUCTS
==============================*/
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card">
      <div class="product-img">
        <span style="font-size:72px">${p.emoji}</span>
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ""}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">₹${p.price}</div>
          <button class="add-to-cart" id="btn-${p.id}" onclick="addToCart(${p.id})">+ Add</button>
        </div>
      </div>
    </div>
  `).join("");
}

/* ============================
   CART LOGIC
==============================*/
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart();
  updateCartUI();

  // Button feedback
  const btn = document.getElementById(`btn-${id}`);
  if (btn) {
    btn.textContent = "✓ Added!";
    btn.classList.add("added");
    setTimeout(() => { btn.textContent = "+ Add"; btn.classList.remove("added"); }, 1600);
  }
  showToast(`${product.emoji} ${product.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart(); updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); }
}

function getTotal() { return cart.reduce((s, c) => s + c.price * c.qty, 0); }

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById("cart-count").textContent = count;

  const itemsEl = document.getElementById("cartItems");
  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="big">🧺</div>Your basket is empty!<br><small>Browse our cozy creations above.</small></div>`;
  } else {
    itemsEl.innerHTML = cart.map(c => `
      <div class="cart-item">
        <div class="cart-item-icon">${c.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${c.name}</div>
          <div class="cart-item-price">₹${c.price} each</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${c.id},-1)">−</button>
            <span class="qty-num">${c.qty}</span>
            <button class="qty-btn" onclick="changeQty(${c.id},1)">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="removeFromCart(${c.id})" title="Remove">🗑️</button>
      </div>
    `).join("");
  }
  document.getElementById("cartTotal").textContent = `₹${getTotal()}`;
}

/* ============================
   CART OPEN/CLOSE
==============================*/
function openCart() {
  document.getElementById("cartOverlay").classList.add("open");
  document.getElementById("cartSidebar").classList.add("open");
}
function closeCart() {
  document.getElementById("cartOverlay").classList.remove("open");
  document.getElementById("cartSidebar").classList.remove("open");
}

/* ============================
   CHECKOUT MODAL
==============================*/
function openCheckout() {
  if (cart.length === 0) { showToast("Your cart is empty!"); return; }
  closeCart();

  // Build order summary
  const summaryEl = document.getElementById("orderSummary");
  summaryEl.innerHTML = cart.map(c => `
    <div class="order-summary-item">
      <span>${c.emoji} ${c.name} × ${c.qty}</span>
      <span>₹${c.price * c.qty}</span>
    </div>
  `).join("") + `<div class="order-summary-item"><span>Total</span><span>₹${getTotal()}</span></div>`;

  document.getElementById("checkoutOverlay").classList.add("open");
}
function closeCheckout() {
  document.getElementById("checkoutOverlay").classList.remove("open");
}

function selectPay(el) {
  document.querySelectorAll(".pay-option").forEach(o => o.classList.remove("selected"));
  el.classList.add("selected");
  selectedPayment = el.dataset.method;
}

/* ============================
   PLACE ORDER
==============================*/
async function placeOrder() {
  const name    = document.getElementById("oName").value.trim();
  const phone   = document.getElementById("oPhone").value.trim();
  const address = document.getElementById("oAddress").value.trim();

  if (!name || !phone || !address) {
    showToast("Please fill in all required fields!"); return;
  }

  const orderData = {
    name: name,
    phone: phone,
    address: address,
    products: cart.map(c => `${c.name} x${c.qty}`).join(", "),
    quantity: cart.reduce((sum, c) => sum + c.qty, 0),
    total: getTotal(),
    payment: selectedPayment
  };

  console.log("Sending order:", orderData);

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.innerHTML = "Placing Order...";

  try {
    const formData = new FormData();
    formData.append('data', JSON.stringify(orderData));

    const response = await fetch(SHEETS_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();
    console.log("Response:", result);

    if (result.status === "success") {
      cart = [];
      saveCart();
      updateCartUI();
      closeCheckout();
      showConfirm();
    } else {
      throw new Error(result.message || "Failed to save order");
    }

  } catch (error) {
    console.error(error);
    showToast("Error placing order");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "✨ Place My Order";
  }
}

/* ============================
   CONFIRMATION POPUP
==============================*/
function showConfirm() {
  document.getElementById("confirmOverlay").classList.add("open");
  // Reset form
  ["oName","oPhone","oAddress"].forEach(id => document.getElementById(id).value = "");
}
function closeConfirm() {
  document.getElementById("confirmOverlay").classList.remove("open");
}

/* ============================
   CUSTOM ORDER FORM
==============================*/
function submitCustomOrder() {
  const name    = document.getElementById("cname").value.trim();
  const contact = document.getElementById("ccontact").value.trim();
  const desc    = document.getElementById("cdesc").value.trim();

  if (!name || !contact || !desc) { showToast("Please fill all fields! "); return; }
  showToast("Custom request sent! We'll contact you soon");
  ["cname","ccontact","cdesc","cbudget"].forEach(id => document.getElementById(id).value = "");
}

/* ============================
   TOAST
==============================*/
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

/* ============================
   HAMBURGER MENU
==============================*/
function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("open");
}

/* ============================
   LOADING SCREEN
==============================*/
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("hidden"), 1200);
});

/* ============================
   INIT
==============================*/
renderProducts();
updateCartUI();
