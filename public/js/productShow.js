// Wishlist toggle
(function () {
  document.querySelectorAll(".wishlist-btn-ps, .wishlist-btn").forEach(btn => {
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
            if (window.updateCounts) window.updateCounts(); // ✅ instant update
          } else {
            icon.classList.remove("fa-solid", "text-danger");
            icon.classList.add("fa-regular"); // empty
            if (window.updateCounts) window.updateCounts(); // ✅ instant update
          }
        }
      } catch (err) {
        console.error("Wishlist error:", err);
      }
    });
  });
})();




// Product page size selection
(function() {
  const pageSizeButtons = document.querySelectorAll(".chip.page"); 
  const addToBag = document.querySelector(".btnPrimary");

  pageSizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      pageSizeButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      addToBag.classList.add("active"); // activate button

      // ✅ Update selectedSize for product page
      window.selectedSize = btn.dataset.size; 
    });
  });
})();


// === Popup Size Selection & Add to Cart ===
(function() {
  const popupSizeButtons = document.querySelectorAll(".chip.popup"); // popup chips
  const pageSizeButtons = document.querySelectorAll(".chip.page");   // product page chips
  const addToBag = document.querySelector(".btnPrimary");
  const buyNow = document.getElementById("btnBuy");
  const popup = document.getElementById("sizePopup");
  const popupClose = document.getElementById("popupClose");
  const popupContinue = document.getElementById("popupContinue");

  let tempSelectedSize = null;  // temporary selection in popup
  window.selectedSize = window.selectedSize || null;

  // Select size inside popup
  popupSizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      popupSizeButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      tempSelectedSize = btn.dataset.size; // temporary
    });
  });

  // Show popup if Add to Bag clicked without selection
  function handleAddClick(productId) {
    if (!selectedSize) {
      popup.classList.add("active");
    } else {
      addProductToCart(productId, selectedSize);
    }
  }

  if (addToBag) {
    addToBag.addEventListener("click", () => handleAddClick(addToBag.dataset.id));
  }
  // buyNow.addEventListener("click", () => handleAddClick(buyNow.dataset.id));

  // Close popup (without confirming)
  if (popupClose) {
    popupClose.addEventListener("click", () => {
      popup.classList.remove("active");
      tempSelectedSize = null;
    });
  }

  // Confirm selection from popup
  if (popupContinue) {
    popupContinue.addEventListener("click", () => {
      if (!tempSelectedSize) {
        alert("Please select a size!");
        return;
      }

      selectedSize = tempSelectedSize;
      tempSelectedSize = null;

      popup.classList.remove("active");

      // Activate Add to Bag
      if (addToBag) addToBag.classList.add("active");

      // Mark the selected chip in popup
      popupSizeButtons.forEach(b => b.classList.remove("selected"));
      const selectedPopupBtn = Array.from(popupSizeButtons).find(b => b.dataset.size === selectedSize);
      if (selectedPopupBtn) selectedPopupBtn.classList.add("selected");

      // ALSO mark the corresponding product page chip
      pageSizeButtons.forEach(b => b.classList.remove("selected"));
      const selectedPageBtn = Array.from(pageSizeButtons).find(b => b.dataset.size === selectedSize);
      if (selectedPageBtn) selectedPageBtn.classList.add("selected");

      // Branch: if Buy flow is active, proceed to checkout; else add to cart
      if (window.buyFlowActive) {
        window.buyFlowActive = false;
        // Use global function defined in buy-now IIFE
        if (window.buyNow) {
          window.buyNow(addToBag.dataset.id, selectedSize);
        }
      } else {
        if (addToBag) addProductToCart(addToBag.dataset.id, selectedSize);
      }
    });
  }

  // Add product to cart
  async function addProductToCart(productId, size) {
    sessionStorage.setItem(`lastSelectedSize_${productId}`, size);
    await addToCart(productId, size);
  }

  // Shared addToCart function
 async function addToCart(productId, size) {
  if (!productId) {
    showToast("⚠️ Product ID missing!", "error");
    return;
  }

  try {
    const res = await fetch(`/cart/add/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size })
    });

    // Check if fetch response is OK
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await res.json();

    if (data.success) {
      showToast("Product added to cart" , "success");
      if (window.updateCounts) window.updateCounts(); // update navbar counts
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Something went wrong while adding to cart!", "error");
  }
}

  // Restore last confirmed size on page load
  if (addToBag) {
    const lastSize = sessionStorage.getItem(`lastSelectedSize_${addToBag.dataset.id}`);
    if (lastSize) {
      // Update popup chips
      const lastPopupBtn = Array.from(popupSizeButtons).find(b => b.dataset.size === lastSize);
      if (lastPopupBtn) lastPopupBtn.classList.add("selected");

      // Update product page chips
      const lastPageBtn = Array.from(pageSizeButtons).find(b => b.dataset.size === lastSize);
      if (lastPageBtn) lastPageBtn.classList.add("selected");

      selectedSize = lastSize;
      addToBag.classList.add("active");
    }
  }
})();

// Mobile accordion
document.querySelectorAll(".prodHeader").forEach(header => {
  header.addEventListener("click", () => {
    header.parentElement.classList.toggle("active");
  });
});

// Mobile Carousel
(function(){
  const slides = document.querySelectorAll('.mobile-carousel .carousel-slide');
  const dots = document.querySelectorAll('.mobile-carousel .dot');
  let currentIndex = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      if(dots[i]) dots[i].classList.toggle('active', i === index);
    });
  }

  // Dot click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentIndex = i;
      showSlide(currentIndex);
    });
  });

  // Swipe support
  let startX = 0;
  const carousel = document.querySelector('.mobile-carousel');
  if(carousel) {
    carousel.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    carousel.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 50) { // swipe right
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else if (startX - endX > 50) { // swipe left
        currentIndex = (currentIndex + 1) % slides.length;
      }
      showSlide(currentIndex);
    });
  }

  // ✅ Initialize first slide visible
  if (slides.length > 0) showSlide(currentIndex);
})();

// Buy Now button with login + size gating
(function(){
  const buyBtn = document.getElementById("btnBuy");
  if (!buyBtn) return;

  async function buyNow(productId, size) {
    try {
      const res = await fetch(`/buy/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.redirect || "/checkout";
      } else {
        alert(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      alert("Error in Buy Now.");
    }
  }
  window.buyNow = buyNow; // make available to popupContinue branch

  function openSizePopup() {
    const popup = document.getElementById('sizePopup');
    if (popup) popup.classList.add('active');
  }

  buyBtn.addEventListener("click", function() {
    const productId = this.getAttribute("data-id");
    const token = localStorage.getItem('authToken');

    // Determine if a size is already chosen on page
    const selectedPageBtn = document.querySelector('.chip.page.selected');
    const chosenSize = selectedPageBtn ? selectedPageBtn.dataset.size : (window.selectedSize || null);

    if (!token) {
      // Not logged in: store pending buy and show login modal
      localStorage.setItem('pendingBuy', JSON.stringify({ productId, size: chosenSize || null }));
      if (window.showLoginModal) {
        window.showLoginModal();
      } else {
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.add('active');
      }
      return;
    }

    // Logged in: ensure we have a size
    if (!chosenSize) {
      window.buyFlowActive = true; // tell popupContinue we're in Buy path
      openSizePopup();
      return;
    }

    // Proceed directly if size already selected
    buyNow(productId, chosenSize);
  });

  // Resume pending buy after login + reload
  document.addEventListener('DOMContentLoaded', function(){
    const token = localStorage.getItem('authToken');
    const pending = localStorage.getItem('pendingBuy');
    if (!token || !pending) return;
    try {
      const payload = JSON.parse(pending);
      // Only resume if this page's product matches
      const currentId = buyBtn.getAttribute('data-id');
      if (!payload || payload.productId !== currentId) return;

      if (payload.size) {
        localStorage.removeItem('pendingBuy');
        buyNow(payload.productId, payload.size);
      } else {
        // Need size: open popup and set flag; on Continue it will call buyNow
        window.buyFlowActive = true;
        openSizePopup();
        // keep pendingBuy; it will be cleared after successful redirect
      }
    } catch(_) {}
  });
})();

// Desktop thumbnail click to update main image and highlight
(function() {
  const mainImage = document.getElementById('mainImage');
  const thumbButtons = document.querySelectorAll('.thumbBtn');

  thumbButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.src; // get image URL from data-src
      if (mainImage && src) {
        mainImage.src = src; // change main image
        
        // Highlight selected thumbnail
        thumbButtons.forEach(b => b.querySelector('img').classList.remove('active'));
        btn.querySelector('img').classList.add('active');
      }
    });
  });

  // Optional: make first thumbnail active on load
  if (thumbButtons.length > 0) {
    thumbButtons[0].querySelector('img').classList.add('active');
  }
})();

// Pincode checker
const checkPincodeBtn = document.getElementById("checkPincode");
if (checkPincodeBtn) {
  checkPincodeBtn.addEventListener("click", async () => {
    const pincode = document.getElementById("pincode").value.trim();
    const pinMessage = document.getElementById("pinMessage");
    const loader = document.getElementById("loader");

    // Reset previous messages
    pinMessage.textContent = "";
    pinMessage.style.color = "black";

    // Show loader
    loader.classList.remove("hidden");

    // Validate pincode
    if (!pincode || pincode.length !== 6) {
      loader.classList.add("hidden");
      pinMessage.textContent = "⚠️ Please enter a valid 6-digit pincode.";
      pinMessage.style.color = "red";
      return;
    }

    try {
      // Send request to backend
      const res = await fetch("/api/pincode/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode }),
      });

      const data = await res.json();

      // Hide loader after response
      loader.classList.add("hidden");

      // Show message
      pinMessage.textContent = data.message;
      pinMessage.style.color = data.success ? "green" : "red";

    } catch (err) {
      loader.classList.add("hidden");
      pinMessage.textContent = "⚠️ Something went wrong. Please try again.";
      pinMessage.style.color = "red";
      console.error("Error:", err);
    }
  });
}


// Review Modal & Rating JavaScript
(function() {
  const reviewModal = document.getElementById('reviewModal');
  const openReviewBtn = document.getElementById('openReviewModal');
  const closeReviewBtn = document.getElementById('closeReviewModal');
  const reviewForm = document.getElementById('reviewForm');
  const starInputs = document.querySelectorAll('.star-rating-input i');
  const ratingValue = document.getElementById('ratingValue');
  
  let selectedRating = 0;
  
  // Open modal
  if (openReviewBtn && reviewModal) {
    openReviewBtn.addEventListener('click', () => {
      reviewModal.classList.add('active');
    });
  }
  
  // Close modal
  if (closeReviewBtn && reviewModal) {
    closeReviewBtn.addEventListener('click', () => {
      reviewModal.classList.remove('active');
      resetForm();
    });
  }
  
  // Close on overlay click
  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) {
        reviewModal.classList.remove('active');
        resetForm();
      }
    });
  }
  
  // Star rating interaction
  starInputs.forEach((star, index) => {
    // Hover effect
    star.addEventListener('mouseenter', () => {
      highlightStars(index + 1);
    });
    
    // Click to select
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      if(ratingValue) ratingValue.value = selectedRating;
      selectStars(selectedRating);
    });
  });
  
  // Reset hover when mouse leaves star container
  const starContainer = document.querySelector('.star-rating-input');
  if (starContainer) {
    starContainer.addEventListener('mouseleave', () => {
      if (selectedRating > 0) {
        selectStars(selectedRating);
      } else {
        resetStars();
      }
    });
  }
  
  function highlightStars(rating) {
    starInputs.forEach((star, index) => {
      if (index < rating) {
        star.classList.remove('fa-regular');
        star.classList.add('fa-solid', 'hovered');
      } else {
        star.classList.remove('fa-solid', 'hovered');
        star.classList.add('fa-regular');
      }
    });
  }
  
  function selectStars(rating) {
    starInputs.forEach((star, index) => {
      star.classList.remove('hovered');
      if (index < rating) {
        star.classList.remove('fa-regular');
        star.classList.add('fa-solid', 'selected');
      } else {
        star.classList.remove('fa-solid', 'selected');
        star.classList.add('fa-regular');
      }
    });
  }
  
  function resetStars() {
    starInputs.forEach(star => {
      star.classList.remove('fa-solid', 'hovered', 'selected');
      star.classList.add('fa-regular');
    });
  }
  
  function resetForm() {
    selectedRating = 0;
    if(ratingValue) ratingValue.value = 0;
    const rc = document.getElementById('reviewComment');
    if(rc) rc.value = '';
    resetStars();
  }
  
  // Handle form submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const rating = parseInt(ratingValue.value);
      const comment = document.getElementById('reviewComment').value.trim();
      
      // Validation
      if (rating === 0) {
        showToast('Please select a rating', 'error');
        return;
      }
      
      // Using global PRODUCT_ID set in the template
      const productId = window.PRODUCT_ID;
      if (!productId) {
        showToast('Product ID is missing', 'error');
        return;
      }
      
      try {
        const response = await fetch(`/reviews/products/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rating, comment })
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToast('Review submitted successfully!', 'success');
          reviewModal.classList.remove('active');
          resetForm();
          
          // Reload page after 1.5 seconds to show new review
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showToast(data.message || 'Failed to submit review', 'error');
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        showToast('Something went wrong. Please try again.', 'error');
      }
    });
  }
  
  // Delete Review Functionality
  const deleteButtons = document.querySelectorAll('.btn-delete-review');
  
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.stopPropagation();
      
      const reviewId = this.getAttribute('data-review-id');
      const reviewCard = this.closest('.review-card');
      
      // Confirmation dialog
      if (!confirm('Are you sure you want to delete this review?')) {
        return;
      }
      
      try {
        const response = await fetch(`/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToast('Review deleted successfully!', 'success');
          
          // Fade out and remove the review card
          reviewCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          reviewCard.style.opacity = '0';
          reviewCard.style.transform = 'translateX(-20px)';
          
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          showToast(data.message || 'Failed to delete review', 'error');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        showToast('Something went wrong. Please try again.', 'error');
      }
    });
  });
})();
