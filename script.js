const products = [
  { id: 1, name: "Bananas", price: 2.50, image: "banana.jpg" },
  { id: 2, name: "Milk", price: 1.80, image: "milk.jpg" },
  { id: 3, name: "Bread", price: 2.00, image: "bread.jpg" },
  { id: 4, name: "Eggs (Dozen)", price: 3.20, image: "eggs.jpg" },
  { id: 5, name: "Tomatoes (1kg)", price: 2.30, image: "tomatoes.jpg" }
];

let cart = JSON.parse(localStorage.getItem('cart')) || {};

const discountRate = 0.1;

const productListEl = document.getElementById('product-list');
const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartDiscountEl = document.getElementById('cart-discount');
const cartTotalEl = document.getElementById('cart-total');
const printReceiptBtn = document.getElementById('print-receipt');
const clearCartBtn = document.getElementById('clear-cart');

function renderProducts() {
  productListEl.innerHTML = '';
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" />
      <div class="product-name">${product.name}</div>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
    `;

    productListEl.appendChild(productCard);
  });
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  let subtotal = 0;

  Object.values(cart).forEach(item => {
    const product = products.find(p => p.id === item.id);
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';

    cartItem.innerHTML = `
      <div class="cart-item-name">${product.name}</div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
        <input type="number" min="1" value="${item.quantity}" data-id="${item.id}" class="quantity-input" />
        <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
      </div>
      <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
      <button class="remove-item-btn" data-id="${item.id}">x</button>
    `;

    cartItemsEl.appendChild(cartItem);
  });

  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  cartSubtotalEl.textContent = subtotal.toFixed(2);
  cartDiscountEl.textContent = discount.toFixed(2);
  cartTotalEl.textContent = total.toFixed(2);

  saveCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId) {
  if (cart[productId]) {
    cart[productId].quantity += 1;
  } else {
    cart[productId] = { id: productId, quantity: 1 };
  }
  renderCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  renderCart();
}

function updateQuantity(productId, quantity) {
  if (quantity < 1) return;
  cart[productId].quantity = quantity;
  renderCart();
}

function handleQuantityButton(productId, action) {
  if (!cart[productId]) return;
  if (action === 'increase') {
    cart[productId].quantity += 1;
  } else if (action === 'decrease') {
    if (cart[productId].quantity > 1) {
      cart[productId].quantity -= 1;
    } else if (cart[productId].quantity === 1) {
      delete cart[productId];
    }
  }
  renderCart();
}

function printReceipt() {
  let receiptWindow = window.open('', 'Print Receipt', 'width=600,height=600');
  let receiptContent = `
    <html>
    <head>
      <title>Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #5a8dee; color: white; }
        tfoot td { font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Receipt</h1>
      <table>
        <thead>
          <tr>
            <th>Product</th><th>Quantity</th><th>Price</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
  `;

  let subtotal = 0;
  Object.values(cart).forEach(item => {
    const product = products.find(p => p.id === item.id);
    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;
    receiptContent += `
      <tr>
        <td>${product.name}</td>
        <td>${item.quantity}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>$${itemTotal.toFixed(2)}</td>
      </tr>
    `;
  });

  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  receiptContent += `
        </tbody>
        <tfoot>
          <tr><td colspan="3">Subtotal</td><td>$${subtotal.toFixed(2)}</td></tr>
          <tr><td colspan="3">Discount</td><td>-$${discount.toFixed(2)}</td></tr>
          <tr><td colspan="3">Total</td><td>$${total.toFixed(2)}</td></tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

  receiptWindow.document.write(receiptContent);
  receiptWindow.document.close();
  receiptWindow.focus();
  receiptWindow.print();
  receiptWindow.close();
}

function clearCart() {
  cart = {};
  renderCart();
}

productListEl.addEventListener('click', e => {
  if (e.target.classList.contains('add-to-cart-btn')) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    addToCart(productId);
  }
});

cartItemsEl.addEventListener('click', e => {
  const productId = parseInt(e.target.getAttribute('data-id'));
  if (e.target.classList.contains('remove-item-btn')) {
    removeFromCart(productId);
  } else if (e.target.classList.contains('quantity-btn')) {
    const action = e.target.getAttribute('data-action');
    handleQuantityButton(productId, action);
  }
});

cartItemsEl.addEventListener('change', e => {
  if (e.target.classList.contains('quantity-input')) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    const quantity = parseInt(e.target.value);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(productId, quantity);
    } else {
      renderCart();
    }
  }
});

printReceiptBtn.addEventListener('click', printReceipt);
clearCartBtn.addEventListener('click', clearCart);

renderProducts();
renderCart();
