// Wishlist Button Functionality
(function () {
  document.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
       e.preventDefault();    // stop <a href> navigation
      e.stopPropagation();   // stop bubbling to parent <a>
      const productId = btn.dataset.id;
      try {
        const res = await fetch(`/wishlist/toggle/${productId}`, { method: "POST" });
        const data = await res.json();

        if (data.success) {
          const icon = btn.querySelector("i");
          if (data.inWishlist) {
            icon.classList.remove("fa-regular");
            icon.classList.add("fa-solid", "text-danger"); // filled red
          } else {
            icon.classList.remove("fa-solid", "text-danger");
            icon.classList.add("fa-regular"); // empty
          }
        }
      } catch (err) {
        console.error("Wishlist error:", err);
      }
    });
  });
})();
