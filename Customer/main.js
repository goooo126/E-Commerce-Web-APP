// ---------- LocalStorage Wishlist Helpers ----------
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function setWishlist(wishlist) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function isInWishlist(id) {
  return getWishlist().some(p => String(p.id) === String(id));
}

// ---------- DOMContentLoaded ----------
document.addEventListener("DOMContentLoaded", () => {

document.getElementById("confirmOrderBtn")?.addEventListener("click", () => {
  sendCartToAdmin();
});

  // ---------- Load Navbar ----------
  fetch("navbar.html")
    .then(res => res.text())
    .then(data => {
      document.body.insertAdjacentHTML("afterbegin", data);
      initSearch();
      initNavbarActive();
      updateCartCount();
    })
   

  window.allProducts = [];

  // ---------- Navbar Active ----------
  function initNavbarActive() {
    const currentPage = location.pathname.split("/").pop();
    document.querySelectorAll(".nav-left a").forEach(link => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });
  }

  // ---------- Products Grid ----------
  const productsGrid = document.getElementById("productsGrid");

  function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function renderProducts(products) {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    const shuffledProducts = shuffleArray(products);

    if (shuffledProducts.length === 0) {
      productsGrid.innerHTML = `<p style="text-align:center;">No products found</p>`;
      return;
    }

    shuffledProducts.forEach(product => {
      productsGrid.innerHTML += `
        <div class="product">
          <button class="wishlist-btn ${isInWishlist(product.id) ? "active" : ""}" data-id="${product.id}">
            <i class="fa-${isInWishlist(product.id) ? "solid" : "regular"} fa-heart"></i>
          </button>
          <div class="img_product">
            <img src="../${product.imageUrl}" alt="${product.name}">
          </div>
          <h4 class="name_product" style="font-size:20px; text-align:center">${product.name}</h4>
          <h4 style="font-size:20px;text-align:center">${product.description}</h4>
          <div class="price">
            <p style="font-size:20px;text-align:center">$${product.price}</p>
          </div>
          <div class="icons">
            <span class="btn_add_cart btn">
              <i class="fa-solid fa-cart-plus"></i> Add
           
            </span>
          </div>
        </div>
      `;
    });
  }

  function fetchProducts(url = "http://localhost:3000/products") {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        window.allProducts = data.products || data;
        renderProducts(window.allProducts);
      })
   
  }

  fetchProducts();

  // ---------- Search ----------
  function initSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase().trim();
      const filtered = query
        ? window.allProducts.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
        : window.allProducts;

      renderProducts(filtered);
    });
  }

  // ---------- Category Filter ----------
  function setActive(clickedElement) {
    document.querySelectorAll(".filters a").forEach(el => el.classList.remove("active"));
    clickedElement.classList.add("active");
  }

  document.querySelectorAll("[data-category-id]").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      setActive(this);
      fetchProducts(`http://localhost:3000/products?categoryId=${this.dataset.categoryId}`);
    });
  });

  const allBtn = document.getElementById("allProducts");
  if (allBtn) {
    allBtn.addEventListener("click", e => {
      e.preventDefault();
      setActive(allBtn);
      fetchProducts();
    });
  }

  // ---------- Price Filter ----------
  document.querySelectorAll("[data-price-id]").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      setActive(this);

      let url = "http://localhost:3000/products";
      switch(this.dataset.priceId) {
        case "cat_007": url += "?price_lte=99"; break;
        case "cat_008": url += "?price_gte=100&price_lte=500"; break;
        case "cat_009": url += "?price_gte=501&price_lte=1000"; break;
        case "cat_0010": url += "?price_gte=1001"; break;
      }

      fetchProducts(url);
    });
  });

  // ---------- Wishlist Toggle (works on Home and Wishlist) ----------
  document.addEventListener("click", function(e) {
    const btn = e.target.closest(".wishlist-btn");
    if (!btn) return;

    const productId = String(btn.dataset.id);
    let wishlist = getWishlist();
    const icon = btn.querySelector("i");
    const productCard = btn.closest(".product");
    const isWishlistPage = document.body.classList.contains("wishlist-page") || document.getElementById("wishlistGrid");

    if (btn.classList.contains("active")) {
   
      btn.classList.remove("active");
      icon?.classList.replace("fa-solid", "fa-regular");
      wishlist = wishlist.filter(p => String(p.id) !== productId);
      setWishlist(wishlist);

      if (isWishlistPage && productCard) productCard.remove();
      if (isWishlistPage && wishlist.length === 0) {
        const wishlistGrid = document.getElementById("wishlistGrid");
        if (wishlistGrid) {
    wishlistGrid.innerHTML = `
      <p style="
          text-align: center !important; 
          width: 100% !important; 
          grid-column: 1 / -1 !important; 
          font-size: 20px !important; 
          font-weight: bold !important; 
          padding: 100px 0 !important; 

          display: block !important;
      ">No wishlist items</p>`;
}
      }

    } else {
    
      btn.classList.add("active");
      icon?.classList.replace("fa-regular", "fa-solid");

      const product = window.allProducts.find(p => String(p.id) === productId);
      if (product && !wishlist.some(p => String(p.id) === productId)) {
        wishlist.push(product);
        setWishlist(wishlist);
      }
    }
  });

  // ---------- Wishlist Page Rendering ----------
  const wishlistGrid = document.getElementById("wishlistGrid");

if (wishlistGrid) {
  function renderWishlist() {
    const wishlist = getWishlist().filter(p => p && p.id && p.name && p.price && p.imageUrl);
    wishlistGrid.innerHTML = wishlist.length === 0
      ? "<p style='text-align:center; width:100%; grid-column: 1/-1; font-size: 30px !important;font-weight: bold;padding: 150px 0;'>No wishlist items</p>"
      : wishlist.map(product => `
        <div class="product">
          <button class="wishlist-btn active" data-id="${product.id}">
            <i class="fa-solid fa-heart"></i>
          </button>
          <div class="img_product">
            <img src="../${product.imageUrl}" alt="${product.name}">
          </div>
          <h4 class="name_product" style="font-size:20px; text-align:center">${product.name}</h4>
          <p style="text-align:center; font-size:16px;">${product.description}</p>
          <div class="price">
            <p style="font-size:20px; text-align:center; font-weight:bold;">$${product.price}</p>
          </div>
          
        </div>
      `).join("");
  }
  renderWishlist();
}


 // ---------- My Orders Page Rendering ----------
  const myOrdersContainer = document.getElementById('myOrdersGrid');
  if (myOrdersContainer) {
    async function renderMyOrders() {
      const uri = ' http://localhost:3000/cart';

      const cartProductsRes = await fetch(uri);
      const cartProducts = await cartProductsRes.json();
      var userProducts = [];

      const userName = localStorage.getItem('userName');

      cartProducts.forEach((product) => {
        if (product.customerName === userName) {
          userProducts.push(product);
        }
      });

      myOrdersContainer.innerHTML = '';
      var template = '';

      userProducts.forEach((product) => {
        template +=`
             <div class="card">
        <div class="card-header">
          <div class="user">
            <h3>${product.customerName}</h3>
            <h5>${product.orderDate}</h5>
          </div>
          <div class="status ${product.status}-btn">
            <div class="${product.status}-circle"></div>
            <div>${product.status}</div>
          </div>
        </div>
        <hr />
        <div class="card-items">`;

        for (const item in product.items) {
          const totalPrice = product.items[item].price * product.items[item].quantity;
          template +=`
           <div class="item">
            <div class="product-info">
              <div>
                <img
                  src="${product.items[item].image}"
                  alt="" />
              </div>
              <div class="info">
                <h3>${product.items[item].name}</h3>
                <h5>${product.items[item].price}$</h5>
              </div>
            </div>
            <div class="price">
              <div>
                <p class="quantity">x${product.items[item].quantity}</p>
                <p class="total-price">$${totalPrice}</p>
              </div>
            </div>
          </div>
          `;
        }

        template +=`       
        </div>
        <hr />
        <div class="card-footer">
          <div class="total-items">${product.items.length} items</div>
          <div class="total-prie">
            <div>
              <p>Total</p>
              <p>$${product.totalPrice}</p>
            </div>
          </div>
        </div>
      </div>
        `;
      });

      myOrdersContainer.innerHTML = template;
    }

    renderMyOrders();
  }




 

});
let currentSlide = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    slides[currentSlide].classList.remove('active');

    currentSlide = (currentSlide + direction + slides.length) % slides.length;

    slides[currentSlide].classList.add('active');
}


// setInterval(() => {
//     changeSlide(1);
// }, 4000);
// ///////////// Cart//////////////////

// ================= CART HELPERS =================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ================= UPDATE CART COUNT =================
function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (!cartCount) return;

  const cart = getCart();
  cartCount.textContent = cart.length;
}

// ================= ADD TO CART =================
document.addEventListener("click", function (e) {
  const addBtn = e.target.closest(".btn_add_cart");
  if (!addBtn) return;

  const productCard = addBtn.closest(".product");
  if (!productCard) return;

  const productName = productCard.querySelector(".name_product")?.textContent;
  const productPrice = productCard.querySelector(".price p")?.textContent;
  const productImg = productCard.querySelector(".img_product img")?.getAttribute("src");

  let cart = getCart();

  const alreadyInCart = cart.find(item => item.name === productName);
  if (alreadyInCart) return;

 cart.push({
  id: Date.now(),
  name: productName,
  price: productPrice,
  image: productImg,
  quantity: 1,
  status: ""  
});


  setCart(cart);
  updateCartCount();
  renderCart();
});

// ================= CART DATA =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ================= RENDER CART =================
function renderCart() {
  const cart = getCart();
  const cartContainer = document.getElementById("cartContainer");
  if (!cartContainer) return;
  if (cart.length === 0) {
    cartContainer.innerHTML = `

     <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; width: 100%;">
        <h2 style="color: #090909; margin: 0; font-size: 24px;">Your cart is empty</h2>
      </div>
       
     
    `;

    const confirmBtn = document.getElementById("confirmOrderBtn");
    if (confirmBtn) confirmBtn.style.display = "none";
    return;
  }

  cartContainer.innerHTML = "";
  cart.forEach(item => {
    const isLocked = item.status === "waiting";
    const cartItem = document.createElement("div");
    cartItem.className = `cart-item ${isLocked ? "is-pending" : ""}`;
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="80">
      <span class="name">${item.name}</span>
      <span class="price">${item.price}</span>
      <div class="quantity-controls">
        ${isLocked ? 
          `<span class="badge" style="background: orange; color: white; padding: 5px; border-radius: 5px;">جاري المراجعة...</span>` : 
          `
          <button class="decrease" data-id="${item.id}">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="increase" data-id="${item.id}">+</button>
          <button class="remove-item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
          `
        }
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  const hasNewItems = cart.some(item => item.status !== "waiting");
  const confirmBtn = document.getElementById("confirmOrderBtn");
  if (confirmBtn) confirmBtn.style.display = (hasNewItems && cart.length > 0) ? "block" : "none";
}
// ================= REMOVE ITEM =================
document.getElementById("cartContainer")?.addEventListener("click", function (e) {
  const removeBtn = e.target.closest(".remove-item");
  if (!removeBtn) return;

  const id = removeBtn.dataset.id;
  cart = cart.filter(item => item.id != id);

  setCart(cart);
  updateCartCount();
  renderCart();
});


// ================= INIT =================
renderCart();
document.getElementById("cartContainer")?.addEventListener("click", function (e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  let cart = getCart();
  const item = cart.find(item => String(item.id) === String(id));

  if (!item || item.status === "waiting") return;

  if (btn.classList.contains("increase")) {
    item.quantity += 1;
  } else if (btn.classList.contains("decrease")) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
  } else if (btn.classList.contains("remove-item")) {
    cart = cart.filter(i => String(i.id) !== String(id));
  }

  setCart(cart);
  renderCart();
  updateCartCount();
});

// ================= SEND ORDER TO ADMIN =================
async function sendCartToAdmin() {
    const cartData = getCart();
    const userName = localStorage.getItem("userName") || "Guest_User"; 

    const itemsToSend = cartData.filter(item => item.status !== "waiting");

    if (itemsToSend.length === 0) {
      alert("There are no new products to send!");
      return;
    }

    try {
     
      const newTotal = itemsToSend.reduce((sum, item) => {

          const priceValue = Number(String(item.price).replace(/[^0-9.-]+/g, "")) || 0;
          return sum + (priceValue * item.quantity);
      }, 0);

      const orderPayload = {
        id: Date.now().toString(),
        customerName: userName,
        orderDate: new Date().toLocaleString(),
        status: "pending",
        totalPrice: newTotal, 
        items: itemsToSend.map(item => ({
          productId: item.id,
          name: item.name,

          price: Number(String(item.price).replace(/[^0-9.-]+/g, "")) || 0,
          quantity: item.quantity,
          image: item.image
        }))
      };

      await fetch("http://localhost:3000/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });


      setCart([]); 
      renderCart();     
      updateCartCount(); 

    } catch (err) {
      console.error("Error connecting to the server:", err);
      alert("An error occurred while sending the order.");
    }

}



/* ========= PAGE LOADING (ADD ONLY – NO CODE CHANGES) ========= */

(function () {
  // لو عنصر اللودنج مش موجود، اعمل Exit
  var loader = document.getElementById("pageLoader");
  if (!loader) return;

  // يظهر فور فتح الصفحة
  loader.classList.remove("hide");

  // يختفي بعد تحميل الصفحة + أي JS شغال
  window.addEventListener("load", function () {
    setTimeout(function () {
      loader.classList.add("hide");
    }, 300); // تأخير بسيط عشان الشكل
  });
})();













// ================= USER POPUP =================
document.addEventListener("DOMContentLoaded", function () {
  const userIcon = document.getElementById("userIcon");
  const userPopup = document.getElementById("userPopup");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!userIcon || !userPopup) return;

  // toggle popup
  userIcon.addEventListener("click", function (e) {
    e.stopPropagation();
    userPopup.style.display =
      userPopup.style.display === "block" ? "none" : "block";
  });

  // close popup if clicked outside
  document.addEventListener("click", function () {
    userPopup.style.display = "none";
  });

  // logout button
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userName"); // لو انت مخزن الاسم
    window.location.href = "login.html";
  });

  // show user info from localStorage
  const userData = JSON.parse(localStorage.getItem("currentUser"));
  if (userData) {
    document.getElementById("popupUserName").textContent = userData.name || "Guest";
    document.getElementById("popupUserEmail").textContent = userData.email || "guest@email.com";
  }
});
