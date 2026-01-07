const tg = window.Telegram.WebApp;
tg.ready();

const API_URL = "https://raviosta-backend.onrender.com/api/menu"; // 🔴 PROD’da domeningizni yozing
const menuEl = document.getElementById("menu");
const totalEl = document.getElementById("total");
const orderBtn = document.getElementById("orderBtn");

let cart = {}; // { id: { item, qty } }

// MENYU OLIB KELISH
fetch(API_URL)
  .then(res => res.json())
  .then(renderMenu)
  .catch(() => {
    menuEl.innerHTML = "<p class='loading'>❌ Menyu yuklanmadi</p>";
  });

// MENYU CHIQARISH
function renderMenu(items) {
  menuEl.innerHTML = "";

  const categories = {};
  items.forEach(item => {
    categories[item.category] = categories[item.category] || [];
    categories[item.category].push(item);
  });

  Object.keys(categories).forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "category";
    catDiv.innerHTML = `<h3>${cat}</h3>`;

    categories[cat].forEach(item => {
      catDiv.appendChild(renderItem(item));
    });

    menuEl.appendChild(catDiv);
  });
}

// BITTA MAHSULOT
function renderItem(item) {
  const div = document.createElement("div");
  div.className = "item";

  const img = document.createElement("img");
  img.src = item.image || "https://via.placeholder.com/80";
  img.className = "item-img";
  img.onerror = () => {
    img.src = "https://via.placeholder.com/80";
  };

  const info = document.createElement("div");
  info.className = "info";
  info.innerHTML = `
    <div class="name">${item.name}</div>
    <div class="price">${Number(item.price.currentPrice).toLocaleString()} so‘m</div>
  `;

  const controls = document.createElement("div");
  controls.className = "controls";

  const minus = document.createElement("button");
  minus.textContent = "−";

  const qty = document.createElement("span");
  qty.textContent = "0";

  const plus = document.createElement("button");
  plus.textContent = "+";

  minus.onclick = () => changeQty(item, -1, qty);
  plus.onclick = () => changeQty(item, +1, qty);

  controls.append(minus, qty, plus);
  div.append(img, info, controls);

  return div;
}

// SONINI O‘ZGARTIRISH
function changeQty(item, delta, qtyEl) {
  const entry = cart[item.id] || { item, qty: 0 };
  entry.qty = Math.max(0, entry.qty + delta);

  if (entry.qty === 0) {
    delete cart[item.id];
  } else {
    cart[item.id] = entry;
  }

  qtyEl.textContent = entry.qty;
  updateTotal();
}

// JAMI HISOB
function updateTotal() {
  let sum = 0;
  Object.values(cart).forEach(e => {
    sum += Number(e.item.price.currentPrice) * e.qty;
  });
  totalEl.textContent = sum.toLocaleString() + " so‘m";
}

// BUYURTMA YUBORISH
orderBtn.onclick = () => {
  const order = Object.values(cart).map(e => ({
    id: e.item.id,
    name: e.item.name,
    price: e.item.price,
    qty: e.qty
  }));

  if (!order.length) {
    tg.showAlert("Savatcha bo‘sh");
    return;
  }

  tg.sendData(JSON.stringify({ order }));
  tg.close();
};






