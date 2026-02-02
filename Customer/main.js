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

  // ---------- Load Navbar ----------
  fetch("navbar.html")
    .then(res => res.text())
    .then(data => {
      document.body.insertAdjacentHTML("afterbegin", data);
      initSearch();
      initNavbarActive();
    })
    .catch(err => console.error(err));

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
      .catch(err => console.error(err));
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

});
