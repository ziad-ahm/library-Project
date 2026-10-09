// =========================
// CART
// =========================

let cartCount = 0;

const cartCountElement = document.getElementById("cartCount");


// Update cart number
function updateCartCount() {

    cartCountElement.textContent = cartCount;

}


// Add item to cart
function addToCart() {

    cartCount++;

    updateCartCount();

}


// Remove item from cart
function removeFromCart() {

    if (cartCount > 0) {

        cartCount--;

        updateCartCount();

    }

}


// Cart button
document.getElementById("cartBtn").addEventListener("click", function () {

    console.log("Cart clicked");

});


// Wishlist
document.getElementById("wishlistBtn").addEventListener("click", function () {

    console.log("Wishlist clicked");

});


// Activate Lucide icons
lucide.createIcons();