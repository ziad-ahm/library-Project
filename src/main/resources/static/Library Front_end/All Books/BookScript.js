// =========================
// CART
// =========================

let cartCount = 0;

const cartCountElement =
    document.getElementById("cartCount");


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


// =========================
// CART BUTTON
// =========================

document.getElementById("cartBtn").addEventListener("click", function () {

    console.log("Cart clicked");

});


// =========================
// WISHLIST
// =========================

document.getElementById("wishlistBtn").addEventListener("click", function () {

    console.log("Wishlist clicked");

});


// =========================
// DISPLAY BOOKS
// =========================

function displayBooks(books) {

    const booksContainer =
        document.getElementById("books-container");


    booksContainer.innerHTML = "";


    books.forEach(book => {

        const availabilityClass =
            book.available
                ? "available"
                : "unavailable";


        const availabilityText =
            book.available
                ? "Available"
                : "Out of Stock";


        booksContainer.innerHTML += `

            <article class="book-card">

                <!-- Book Image -->

            <div class="book-image">
                <img
                    src="./images/${book.imageUrl}"
                    alt="${book.title}"
                >

                <button
                    class="wishlist-book-btn"
                    type="button"
                >
                    <i data-lucide="heart"></i>
                </button>
            </div>


                <!-- Book Information -->

                <div class="book-info">

                    <p class="book-author">

                        ${book.author}

                    </p>


                    <h2 class="book-title">

                        ${book.title}

                    </h2>


                    <!-- Price + Availability -->

                    <div class="book-bottom">

                        <span class="book-price">

                            ${book.price} EGP

                        </span>


                        <span
                            class="book-status ${availabilityClass}"
                        >

                            ${availabilityText}

                        </span>

                    </div>


                    <!-- Add To Cart -->

                    <button
                        class="add-cart-btn"
                        ${!book.available ? "disabled" : ""}
                        onclick="addToCart()"
                    >

                        <i data-lucide="shopping-bag"></i>

                        ${
                            book.available
                                ? "Add to Cart"
                                : "Unavailable"
                        }

                    </button>

                </div>

            </article>

        `;

    });


    // Activate Lucide icons
    lucide.createIcons();

}


// =========================
// NO BOOKS FOUND
// =========================

function displayNoBooks() {

    const booksContainer =
        document.getElementById("books-container");


    booksContainer.innerHTML = `

        <div class="books-error">

            <i data-lucide="search-x"></i>

            <p>
                No books found.
            </p>

        </div>

    `;


    lucide.createIcons();

}


// =========================
// GET ALL BOOKS
// =========================

async function getAllBooks() {

    try {

        const response =
            await fetch("http://localhost:8080/books");


        if (!response.ok) {

            throw new Error(
                "Failed to fetch books"
            );

        }


        const books =
            await response.json();


        console.log(
            "Books from API:",
            books
        );


        displayBooks(books);

    }


    catch (error) {

        console.error(
            "Error:",
            error
        );


        displayNoBooks();

    }

}


// =========================
// SEARCH
// =========================

const searchInput =
    document.getElementById("searchInput");


let searchTimeout;


// Search when user types

searchInput.addEventListener(
    "input",
    function () {

        const searchValue =
            searchInput.value.trim();


        // Cancel previous search

        clearTimeout(searchTimeout);


        // Empty search
        // Show all books again

        if (searchValue === "") {

            getAllBooks();

            return;

        }


        // Wait 400ms

        searchTimeout =
            setTimeout(
                () => {

                    searchBooks(
                        searchValue
                    );

                },
                400
            );

    }
);


// =========================
// SEARCH BOOKS
// =========================

async function searchBooks(searchValue) {

    try {

        // =========================
        // SEARCH BY TITLE
        // =========================

        const titleResponse =
            await fetch(
                `http://localhost:8080/books/booktitle/${encodeURIComponent(searchValue)}`
            );


        if (titleResponse.ok) {

            const book =
                await titleResponse.json();


            displayBooks([book]);


            return;

        }


        // =========================
        // SEARCH BY AUTHOR
        // =========================

        const authorResponse =
            await fetch(
                `http://localhost:8080/books/bookauthor/${encodeURIComponent(searchValue)}`
            );


        if (authorResponse.ok) {

            const book =
                await authorResponse.json();


            displayBooks([book]);


            return;

        }


        // =========================
        // NOTHING FOUND
        // =========================

        displayNoBooks();

    }


    catch (error) {

        console.error(
            "Search Error:",
            error
        );


        displayNoBooks();

    }

}


// =========================
// LOAD BOOKS
// =========================

getAllBooks();


// =========================
// INITIALIZE LUCIDE
// =========================

lucide.createIcons();

