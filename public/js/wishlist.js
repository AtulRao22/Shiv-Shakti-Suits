let selectedProductId = null;
let selectedSize = null;

// 🧠 Show size popup (just like product page)
async function addToCartFromWishlist(id) {
  try {
    // ✅ Fetch product variants to show available sizes
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();

    if (!data || !data.variants || data.variants.length === 0) {
      // If no sizes, directly add to cart
      await addToCartRequest(id, null);
      return;
    }

    // Save selected product ID
    selectedProductId = id;

    // Clear and show popup
    const popup = document.getElementById("sizePopup");
    const sizeContainer = document.getElementById("popupSizes");
    sizeContainer.innerHTML = "";

    data.variants.forEach(v => {
      if (v.stock > 0) {
        const btn = document.createElement("button");
        btn.className = "chip";
        btn.textContent = v.size;
        btn.dataset.size = v.size;
        btn.addEventListener("click", () => {
          document.querySelectorAll("#popupSizes .chip").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectedSize = v.size;
          document.getElementById("popupContinue").disabled = false;
        });
        sizeContainer.appendChild(btn);
      }
    });

    popup.style.display = "flex";
  } catch (err) {
    console.error("Error loading product sizes:", err);
    await addToCartRequest(id, null);
  }
}

// ✅ When Continue button clicked
const popupContinueBtn = document.getElementById("popupContinue");
if (popupContinueBtn) {
  popupContinueBtn.addEventListener("click", async () => {
    if (!selectedProductId || !selectedSize) return;
    await addToCartRequest(selectedProductId, selectedSize);
    closePopup();
  });
}

// ✅ Close popup button
const popupCloseBtn = document.getElementById("popupClose");
if (popupCloseBtn) {
  popupCloseBtn.addEventListener("click", closePopup);
}

function closePopup() {
  const sizePopup = document.getElementById("sizePopup");
  if (sizePopup) sizePopup.style.display = "none";
  selectedProductId = null;
  selectedSize = null;
  const popupCont = document.getElementById("popupContinue");
  if (popupCont) popupCont.disabled = true;
}

// ✅ Add product to cart API
async function addToCartRequest(id, size) {
  try {
    const res = await fetch(`/cart/add/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size, quantity: 1 })
    });
    const data = await res.json();

    if (data.success) {
      // Optionally remove from wishlist
      await fetch(`/wishlist/remove/${id}`, { method: "POST" });
      showToast("Added to cart");
      location.reload();
    } else {
      showToast(data.message || "Failed to add to cart");
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
  }
}

// ✅ Remove from wishlist (no change)
async function removeFromWishlist(id) {
  const res = await fetch(`/wishlist/remove/${id}`, { method: 'POST' });
  const data = await res.json();
 if (data.success) {
  showToast("Removed from wishlist");
  setTimeout(() => {
    location.reload();
  }, 500); // .5 seconds delay
} else {
    showToast(data.message || "Failed to remove from wishlist");
  }
}
