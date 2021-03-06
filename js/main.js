var ShoppingCart = (function() {
  "use strict";
  
  var productsEl = document.querySelector(".products"),
      cartEl =     document.querySelector(".shopping-cart-list"),
      productQuantityEl = document.querySelector(".product-quantity"),
      productQuantityHeadEl = document.querySelector(".product-quantity-head"),
      cartCheckoutEl = document.querySelector(".cart-checkout"),
      totalPriceEl = document.querySelector(".total-price"),
      totalPriceHeadEl = document.querySelector(".total-price-head"),
      sortEl = document.querySelector(".sorts"),
      sortDropDownEl = document.querySelector("#sortsDropdown");

  var products = [],
      productsInCart = [];

  var getProducts = function() {
    const url = 'https://j-parre.myshopify.com/products.json';
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        products = data.products;
        generateProductList();
        setupListeners();
      })
      .catch((error) => {
        productsEl.innerHTML = error;
      });
  }
  
  var generateProductList = function() {
    products.forEach(function(item) {
      let productEl = document.createElement("div");
      productEl.className = "product col-md-4 col-sm-6 col-xs-12 p-2";
      productEl.innerHTML = `<div class="product-image">
                                <img src="${item.images[0].src}" alt="${item.title}" class="img-fluid">
                             </div>
                             <div class="product-name-price">
                               <span class="product-name">${item.title}</span>
                               <span class="product-price">&pound;${item.variants[0].price} </span>
                             </div>
                             <div class="product-add-to-cart">
                               <a href="#0" class="button add-to-cart" data-id=${item.id}>Add to Cart</a>
                               <a href="#0" class="button see-more">Quick View</a>
                             </div>
                          </div>`;
                             
      productsEl.appendChild(productEl);
    });
  }

  var plusItemInCart = function(id) {
    productsInCart.forEach(function(item) {
      if(item.product.id === id) {
        item.quantity++;
      }
    });
  }

  var minusItemInCart = function(id) {
    productsInCart.forEach(function(item) {
      if(item.product.id === id) {
        item.quantity--;
      }
    });
  }

  var removeItemFromCart = function(id) {
    productsInCart = productsInCart.filter((item) => item.product.id != id);
  }
  
  var generateCartList = function() {
    let totalProductsInCart = 0;
    cartEl.innerHTML = "";
    
    productsInCart.forEach(function(item) {
      let li = document.createElement("li");
      let minusItemEl = (item.quantity > 1 ? '<a class="item-icon minus-item" title="Remove Item">Minus</a>' : '');

      li.className = "hide-icon";
      li.innerHTML = `<h6 class="product-name">
                        ${item.product.title} 
                        <small class="extra-info">${item.product.variants[0].title} (${item.quantity})</small> 
                        ${minusItemEl}
                        <a class="item-icon plus-item" title="Add More">Add</a>
                        <a class="item-icon remove-item" title="Remove Items">Bin</a>
                        </h6>
                        <span class="product-price">£${item.product.variants[0].price * item.quantity}</span>
                      `;
      cartEl.appendChild(li);

      let removeItem = li.querySelector(".remove-item");
      let plusItem = li.querySelector(".plus-item");
      let minusItem = li.querySelector(".minus-item");

      removeItem.addEventListener("click", function(event) {
        removeItemFromCart(item.product.id);
        li.remove();
        generateCartList();
        return false;
      });

      plusItem.addEventListener("click", function(event) {
        plusItemInCart(item.product.id);
        generateCartList();
        return false;
      });
      if (minusItem) {
        minusItem.addEventListener("click", function(event) {
          minusItemInCart(item.product.id);
          generateCartList();
          return false;
        });
      }


      li.addEventListener("mouseover", function(event) {
        li.className = "show-icon";
      });

      li.addEventListener("mouseout", function(event) {
        li.className = "hide-icon";
      });

    });

    totalProductsInCart = productsInCart.length;
    productQuantityEl.innerHTML = totalProductsInCart;
    productQuantityHeadEl.innerHTML = totalProductsInCart;
    generateCartButtons();
  }


  
  
  // Function that generates Checkout buttons based on condition that checks if productsInCart array is empty
  var generateCartButtons = function() {
    if(productsInCart.length > 0) {
      let totalPrice = GBPFormatter.format(calculateTotalPrice());
      cartCheckoutEl.style.display = "block";
      totalPriceEl.innerHTML =  totalPrice;
      totalPriceHeadEl.innerHTML =  totalPrice;
    } else {
      cartCheckoutEl.style.display = "none";
    }
  }
  
  // Setting up listeners for click event on all products
  var setupListeners = function() {
    productsEl.addEventListener("click", function(event) {
      let el = event.target;
      if(el.classList.contains("add-to-cart")) {
       let elId = el.dataset.id;
       addToCart(elId);
      }
    });

    addEventHandler(sortDropDownEl, 'change', regenerateProductList);
  }

  // Function that will make sure only one listener bind to element
  var addEventHandler = function(el, eventName, handler) {
    el.addEventListener(eventName, function(e) {
      e.target.removeEventListener(eventName, handler);
      return handler(e);
    })
  }

  var sortProducts = function() {
    products.sort(function(a, b){
      return a.variants[0].price > b.variants[0].price;
    });
  }

  var sortProductsByPriceAsc = function() {
    products.sort(function(a, b){
      return a.variants[0].price > b.variants[0].price;
    });
  }

  var sortProductsByPriceDesc = function() {
    products.sort(function(a, b){
      return b.variants[0].price > a.variants[0].price;
    });
  }

  var sortProductsByNameAsc = function() {
    products.sort(function(a, b){
      return a.title > b.title;
    });
  }

  var sortProductsByNameDesc = function() {
    products.sort(function(a, b){
      return b.title > a.title;
    });
  }

  // Currency formatter
  var GBPFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });


  var regenerateProductList = function() {
      var elValue = sortsDropdown.value;
      productsEl.innerHTML = "";
      switch (elValue) {
        case 'price-asc':
          sortProductsByPriceAsc();
          break;
        case 'price-desc':
          sortProductsByPriceDesc();
          break;
        case 'name-asc':
          sortProductsByNameAsc();
          break;
        case 'name-desc':
          sortProductsByNameDesc();
          break;
      }
      generateProductList();
  }

  var removeEventHandler = function(el, eventName, handler) {
    if (el.detachEvent) el.detachEvent('on'+eventName, handler); else el.addEventListener(eventName, handler);
  }
  
  // Adds new items or updates existing one in productsInCart array
  var addToCart = function(id) {
    let obj = products.find((product)=> product.id == id);
    if(productsInCart.length === 0 || productFound(obj.id) === undefined) {
      productsInCart.push({product: obj, quantity: 1});
    } else {
      plusItemInCart(obj.id);
    }
    generateCartList();
  }
  
  // This function checks if product is already in productsInCart array
  var productFound = function(productId) {
    return productsInCart.find(function(item) {
      return item.product.id === productId;
    });
  }

  var calculateTotalPrice = function() {
    return productsInCart.reduce(function(total, item) {
      return total + (item.product.variants[0].price *  item.quantity);
    }, 0);
  }
  
  // This functon starts the whole application
  var init = function() {
    getProducts();
    
  }
  
  // Exposes just init function to public, everything else is private
  return {
    init: init
  };

})();

ShoppingCart.init();
