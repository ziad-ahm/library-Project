/*
 * Book Haven Dashboard
 * Assumed API contract from the existing project context:
 *   GET    http://localhost:8080/books
 *   POST   http://localhost:8080/books
 *   PUT    http://localhost:8080/books/{id}
 *   DELETE http://localhost:8080/books/{id}  (verify this route exists in your controller)
 *
 * If your backend uses a different port or route, change API_BASE / endpoint constants below.
 */
const API_BASE = "http://localhost:8080";
const BOOKS_ENDPOINT = `${API_BASE}/books`;

const elements = {
  apiStatus: document.getElementById("apiStatus"),
  statusDot: document.querySelector(".status-dot"),
  totalBooks: document.getElementById("totalBooks"),
  availableBooks: document.getElementById("availableBooks"),
  unavailableBooks: document.getElementById("unavailableBooks"),
  collectionValue: document.getElementById("collectionValue"),
  tableBody: document.getElementById("booksTableBody"),
  tableSearch: document.getElementById("tableSearch"),
  availabilityFilter: document.getElementById("availabilityFilter"),
  resultsCount: document.getElementById("resultsCount"),
  refreshBtn: document.getElementById("refreshBtn"),
  addBookBtn: document.getElementById("addBookBtn"),
  bookModal: document.getElementById("bookModal"),
  deleteModal: document.getElementById("deleteModal"),
  bookForm: document.getElementById("bookForm"),
  modalTitle: document.getElementById("modalTitle"),
  formError: document.getElementById("formError"),
  saveBookBtn: document.getElementById("saveBookBtn"),
  deleteMessage: document.getElementById("deleteMessage"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  toastRegion: document.getElementById("toastRegion"),
  sidebar: document.getElementById("sidebar")
};

let books = [];
let deleteTarget = null;
let busy = false;

const money = new Intl.NumberFormat("en-EG", {
  style: "currency", currency: "EGP", maximumFractionDigits: 2
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function setApiStatus(online, message) {
  elements.apiStatus.textContent = message;
  elements.statusDot.classList.toggle("online", online);
  elements.statusDot.classList.toggle("offline", !online);
}

function toast(message, type = "success") {
  const item = document.createElement("div");
  item.className = `toast${type === "error" ? " error" : ""}`;
  item.textContent = message;
  elements.toastRegion.appendChild(item);
  window.setTimeout(() => item.remove(), 3800);
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error("Can't reach the API. Check that Spring Boot is running and CORS allows this page's origin.");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.message || body.error || "";
    } catch {
      try { detail = await response.text(); } catch {}
    }
    throw new Error(detail || `Request failed (${response.status} ${response.statusText}).`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function normalizeBooks(data) {
  // Supports the usual Spring Boot List<Book> response and common wrapped responses.
  const list = Array.isArray(data) ? data
    : Array.isArray(data?.content) ? data.content
    : Array.isArray(data?.books) ? data.books
    : null;
  if (!list) throw new Error("The GET /books response wasn't a book array. Check the controller response shape.");
  return list;
}

function getImageMarkup(book) {
  const imageUrl = String(book.imageUrl ?? "").trim();
  if (!imageUrl) return `<span class="cover-placeholder"><i data-lucide="book-open"></i></span>`;
  // Keep relative image filenames as provided by the API; URL resolution depends on the project's image setup.
  const safeSrc = escapeHtml(imageUrl);
  return `<img class="book-cover" src="${safeSrc}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'cover-placeholder',innerHTML:'<i data-lucide=&quot;book-open&quot;></i>'})); if(window.lucide) lucide.createIcons()">`;
}

function filteredBooks() {
  const query = elements.tableSearch.value.trim().toLowerCase();
  const filter = elements.availabilityFilter.value;
  return books.filter(book => {
    const searchable = [book.id, book.title, book.author].some(value =>
      String(value ?? "").toLowerCase().includes(query));
    const isAvailable = Boolean(book.available);
    const statusMatches = filter === "all" ||
      (filter === "available" && isAvailable) ||
      (filter === "unavailable" && !isAvailable);
    return searchable && statusMatches;
  });
}

function renderStats() {
  const available = books.filter(book => Boolean(book.available)).length;
  const value = books.reduce((sum, book) => {
    const price = Number(book.price);
    return sum + (Number.isFinite(price) ? price : 0);
  }, 0);
  elements.totalBooks.textContent = books.length.toLocaleString("en");
  elements.availableBooks.textContent = available.toLocaleString("en");
  elements.unavailableBooks.textContent = (books.length - available).toLocaleString("en");
  elements.collectionValue.textContent = money.format(value);
}

function renderBooks() {
  const shown = filteredBooks();
  elements.resultsCount.textContent = `Showing ${shown.length} of ${books.length} ${books.length === 1 ? "book" : "books"}`;

  if (!shown.length) {
    const hasFilters = elements.tableSearch.value.trim() || elements.availabilityFilter.value !== "all";
    elements.tableBody.innerHTML = `<tr><td colspan="5" class="table-message"><div class="empty-state"><strong>${hasFilters ? "No matching books" : "Your collection is empty"}</strong><p>${hasFilters ? "Try changing your search or filter." : "Add your first book to get started."}</p>${hasFilters ? "" : '<button class="primary-button" data-action="add"><i data-lucide="plus"></i><span>Add a book</span></button>'}</div></td></tr>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  elements.tableBody.innerHTML = shown.map(book => {
    const available = Boolean(book.available);
    const title = escapeHtml(book.title || "Untitled book");
    const author = escapeHtml(book.author || "Unknown author");
    const id = escapeHtml(book.id ?? "—");
    const price = Number(book.price);
    const priceText = Number.isFinite(price) ? money.format(price) : "—";
    return `<tr>
      <td><div class="book-cell">${getImageMarkup(book)}<div><div class="book-name" title="${title}">${title}</div><div class="book-id">ID: ${id}</div></div></div></td>
      <td class="author-cell" title="${author}">${author}</td>
      <td class="price-cell">${escapeHtml(priceText)}</td>
      <td><span class="status-pill ${available ? "available" : "unavailable"}">${available ? "Available" : "Unavailable"}</span></td>
      <td class="actions-cell"><div class="row-actions">
        <button class="action-button" data-action="edit" data-id="${id}" aria-label="Edit ${title}" title="Edit book"><i data-lucide="pencil"></i></button>
        <button class="action-button delete" data-action="delete" data-id="${id}" aria-label="Delete ${title}" title="Delete book"><i data-lucide="trash-2"></i></button>
      </div></td>
    </tr>`;
  }).join("");
  if (window.lucide) lucide.createIcons();
}

async function loadBooks({ quiet = false } = {}) {
  if (busy) return;
  elements.tableBody.innerHTML = '<tr><td colspan="5" class="table-message"><span class="loader"></span>Loading books from the API…</td></tr>';
  try {
    const data = await request(BOOKS_ENDPOINT);
    books = normalizeBooks(data);
    renderStats();
    renderBooks();
    setApiStatus(true, "API connected");
    if (!quiet) toast("Collection refreshed.");
  } catch (error) {
    elements.tableBody.innerHTML = `<tr><td colspan="5" class="table-message"><div class="empty-state"><strong>Couldn't load the collection</strong><p>${escapeHtml(error.message)}</p><button class="secondary-button" data-action="refresh"><i data-lucide="refresh-cw"></i><span>Try again</span></button></div></td></tr>`;
    setApiStatus(false, "API unavailable");
    elements.resultsCount.textContent = "Collection couldn't be loaded";
    if (window.lucide) lucide.createIcons();
    if (!quiet) toast(error.message, "error");
  }
}

function openBookModal(book = null) {
  elements.bookForm.reset();
  elements.formError.textContent = "";
  document.getElementById("bookId").value = book?.id ?? "";
  document.getElementById("bookTitle").value = book?.title ?? "";
  document.getElementById("bookAuthor").value = book?.author ?? "";
  document.getElementById("bookPrice").value = book?.price ?? "";
  document.getElementById("bookImageUrl").value = book?.imageUrl ?? "";
  document.getElementById("bookAvailable").checked = book ? Boolean(book.available) : true;
  elements.modalTitle.textContent = book ? "Edit book" : "Add a book";
  elements.saveBookBtn.querySelector("span").textContent = book ? "Save changes" : "Save book";
  elements.bookModal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => document.getElementById("bookTitle").focus(), 30);
}

function closeModal(modal) {
  modal.hidden = true;
  if (elements.bookModal.hidden && elements.deleteModal.hidden) document.body.style.overflow = "";
}

function showDeleteModal(book) {
  deleteTarget = book;
  elements.deleteMessage.textContent = `“${book.title || "Untitled book"}” will be permanently removed if the API supports deletion. This action cannot be undone.`;
  elements.deleteModal.hidden = false;
  document.body.style.overflow = "hidden";
}

async function saveBook(event) {
  event.preventDefault();
  if (busy) return;
  elements.formError.textContent = "";

  const idValue = document.getElementById("bookId").value;
  const payload = {
    title: document.getElementById("bookTitle").value.trim(),
    author: document.getElementById("bookAuthor").value.trim(),
    price: Number(document.getElementById("bookPrice").value),
    imageUrl: document.getElementById("bookImageUrl").value.trim(),
    available: document.getElementById("bookAvailable").checked
  };

  if (!payload.title || !payload.author) {
    elements.formError.textContent = "Title and author are required.";
    return;
  }
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    elements.formError.textContent = "Enter a price greater than zero.";
    return;
  }
  if (!payload.imageUrl) delete payload.imageUrl;

  const isEdit = idValue !== "";
  const url = isEdit ? `${BOOKS_ENDPOINT}/${encodeURIComponent(idValue)}` : BOOKS_ENDPOINT;
  busy = true;
  elements.saveBookBtn.disabled = true;
  elements.saveBookBtn.querySelector("span").textContent = isEdit ? "Saving…" : "Adding…";
  try {
    await request(url, { method: isEdit ? "PUT" : "POST", body: JSON.stringify(payload) });
    closeModal(elements.bookModal);
    toast(isEdit ? "Book updated successfully." : "Book added successfully.");
    await loadBooks({ quiet: true });
  } catch (error) {
    elements.formError.textContent = error.message;
  } finally {
    busy = false;
    elements.saveBookBtn.disabled = false;
    elements.saveBookBtn.querySelector("span").textContent = isEdit ? "Save changes" : "Save book";
  }
}

async function deleteBook() {
  if (!deleteTarget || busy) return;
  busy = true;
  elements.confirmDeleteBtn.disabled = true;
  elements.confirmDeleteBtn.textContent = "Deleting…";
  try {
    // This assumes DELETE /books/{id}; confirm the route exists in your BookController.
    await request(`${BOOKS_ENDPOINT}/${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
    closeModal(elements.deleteModal);
    toast("Book deleted successfully.");
    deleteTarget = null;
    await loadBooks({ quiet: true });
  } catch (error) {
    closeModal(elements.deleteModal);
    toast(`Delete failed: ${error.message}`, "error");
  } finally {
    busy = false;
    elements.confirmDeleteBtn.disabled = false;
    elements.confirmDeleteBtn.textContent = "Delete book";
  }
}

elements.addBookBtn.addEventListener("click", () => openBookModal());
elements.refreshBtn.addEventListener("click", () => loadBooks());
elements.tableSearch.addEventListener("input", renderBooks);
elements.availabilityFilter.addEventListener("change", renderBooks);
elements.bookForm.addEventListener("submit", saveBook);
elements.confirmDeleteBtn.addEventListener("click", deleteBook);
document.getElementById("closeModalBtn").addEventListener("click", () => closeModal(elements.bookModal));
document.getElementById("cancelModalBtn").addEventListener("click", () => closeModal(elements.bookModal));
document.getElementById("cancelDeleteBtn").addEventListener("click", () => closeModal(elements.deleteModal));
document.getElementById("mobileMenuBtn").addEventListener("click", () => elements.sidebar.classList.toggle("open"));

document.addEventListener("click", event => {
  const actionButton = event.target.closest("[data-action]");
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === "add") openBookModal();
    if (action === "refresh") loadBooks();
    if (action === "edit" || action === "delete") {
      const book = books.find(item => String(item.id) === actionButton.dataset.id);
      if (!book) return;
      if (action === "edit") openBookModal(book);
      if (action === "delete") showDeleteModal(book);
    }
    return;
  }
  if (event.target === elements.bookModal) closeModal(elements.bookModal);
  if (event.target === elements.deleteModal) closeModal(elements.deleteModal);
  if (window.innerWidth <= 700 && elements.sidebar.classList.contains("open") &&
      !event.target.closest("#sidebar") && !event.target.closest("#mobileMenuBtn")) {
    elements.sidebar.classList.remove("open");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal(elements.bookModal);
    closeModal(elements.deleteModal);
    elements.sidebar.classList.remove("open");
  }
});

if (window.lucide) lucide.createIcons();
loadBooks({ quiet: true });
