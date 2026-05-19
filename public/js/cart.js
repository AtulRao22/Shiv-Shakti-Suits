document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Decrease Quantity (–) FIX ---
    document.querySelectorAll(".qtyBtn.dec").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const size = btn.dataset.size; // <-- CRITICAL: Get size
        
        fetch(`/cart/update/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // CRITICAL: Send size in the request body
          body: JSON.stringify({ change: -1, size: size }) 
        }).then(res => location.reload());
        showToast("Qty decreased by 1" , "success");
      });
    });

    // --- 2. Increase Quantity (+) FIX ---
    document.querySelectorAll(".qtyBtn.inc").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const size = btn.dataset.size; // <-- CRITICAL: Get size
        
        fetch(`/cart/update/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // CRITICAL: Send size in the request body
          body: JSON.stringify({ change: 1, size: size })
        }).then(res => location.reload());
        showToast("Qty increased by 1" , "success");
      });
    });
    

    // --- 3. Remove Item (×) FIX ---
    document.querySelectorAll(".removeBtn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        
        const productId = btn.dataset.id;
        const size = btn.dataset.size; // <-- CRITICAL: Get size
        
        if (!productId || !size) {
            alert("⚠️ Cannot remove item: Product ID or Size is missing!");
            return;
        }

        try {
          const res = await fetch(`/cart/remove/${productId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // CRITICAL: Send size in the request body
            body: JSON.stringify({ size: size }) 
          });

          const data = await res.json();

          if (data.success) {
            showToast("Removed from cart" , "success");
            setTimeout(() => {
            location.reload();
            }, 500); // .5 seconds delay 
          } 
        } catch (err) {
          console.error("Remove from cart error:", err);
          showToast("Something went wrong during removal, please try again." , "error");
        }
      });
    });

    // --- Other Handlers (Keep as is) ---
    document.querySelectorAll(".editBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        alert("Edit product " + id + " (you can open a modal here)");
      });
    });

    // Checkout All (entire cart)
    document.querySelector(".checkoutBtn")?.addEventListener("click", async function() {
        try {
            const res = await fetch("/checkout/all", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (res.status === 401 && data.redirect) {
                // Not logged in -> go to login page
                window.location.href = data.redirect;
                return;
            }
            if (data.success) {
                window.location.href = data.redirect; 
            } else {
                alert(data.message || "Something went wrong!");
            }
        } catch (err) {
            console.error(err);
            alert("Error in Checkout All.");
        }
    });

    // Buy Now for a single cart item
    document.querySelectorAll(".btnBuy").forEach(btn => {
        btn.addEventListener("click", async function() {
            const productId = this.getAttribute("data-id");
            try {
                const res = await fetch(`/buy/cart/${productId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const data = await res.json();
                if (res.status === 401 && data.redirect) {
                    window.location.href = data.redirect;
                    return;
                }
                if (data.success) {
                    window.location.href = data.redirect; 
                } else {
                    alert(data.message || "Something went wrong!");
                }
            } catch (err) {
                console.error(err);
                alert("Error in Buy Now from cart.");
            }
        });
    });
});
