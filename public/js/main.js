
window.addEventListener("pageshow", async () => {
  try {
    const res = await fetch("/wishlist/json");
    const { wishlist } = await res.json();



    document.querySelectorAll(".wishlist-btn, .wishlist-btn-ps").forEach(btn => {
      const icon = btn.querySelector("i");
      if (wishlist.includes(btn.dataset.id)) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid", "text-danger");
      } else {
        icon.classList.remove("fa-solid", "text-danger");
        icon.classList.add("fa-regular");
      }
    });
  } catch (err) {
    console.error("Wishlist sync error:", err);
  }
});


// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.querySelector('.close-menu');
    const slidingBar = document.querySelector('.slidingNavbar');
    const mainNavbar = document.querySelector('.mainNavbar');
    
    // Open mobile menu
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.add('active');
        });
    }
    
    // Close mobile menu
    if (closeMenu) {
        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            mobileMenu.classList.remove('active');
        }
    });

    // Ensure main navbar sits flush under sliding navbar (no gap on mobile)
    function updateNavbarOffset() {
        if (!slidingBar || !mainNavbar) return;
        const height = slidingBar.getBoundingClientRect().height;
        // Set the offset to match sliding bar current height
        mainNavbar.style.top = height + 'px';
    }

    // Dynamic sticky navbar behavior
    let lastScrollTop = 0;
    const scrollThreshold = 100; // Scroll distance before hiding navbars
    
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Determine scroll direction
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            // Scrolling down & past threshold - hide navbars
            slidingBar.style.transform = 'translateY(-220%)';
            mainNavbar.style.transform = 'translateY(-150%)';
        } else {
            // Scrolling up or at top - show navbars
            slidingBar.style.transform = 'translateY(0)';
            mainNavbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    }

    updateNavbarOffset();
    window.addEventListener('resize', updateNavbarOffset, { passive: true });
    window.addEventListener('orientationchange', updateNavbarOffset, { passive: true });
    window.addEventListener('scroll', function() {
        updateNavbarOffset();
        handleScroll();
    }, { passive: true });
});

// Photo Carousel Functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
const totalSlides = slides.length;

// Function to show a specific slide
function showSlide(index) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current slide and dot
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }
}

// Function to change slide (next/previous)
function changeSlide(direction) {
    currentSlideIndex += direction;
    
    // Loop back to first slide if at the end
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    }
    // Loop to last slide if at the beginning
    else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    }
    
    showSlide(currentSlideIndex);
}

// Function to go to a specific slide (for dots)
function currentSlide(index) {
    currentSlideIndex = index - 1; // Convert to 0-based index
    showSlide(currentSlideIndex);
}

// Function to navigate to product section pages
function openProductSection(section) {
    // Map sections to their corresponding HTML files
    const sectionMap = {
        'bestseller': 'bestseller.html',
        'newarrival': 'newarrival.html',
        'festival': 'festival.html',
        'wedding': 'wedding.html'
    };
    
    // Navigate to the appropriate page if it exists in the map
    if (sectionMap[section]) {
        window.location.href = sectionMap[section];
    }
}

// Auto-slide functionality
function autoSlide() {
    currentSlideIndex++;
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    }
    showSlide(currentSlideIndex);
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show first slide initially
    if (totalSlides > 0) {
        showSlide(0);
        
        // Start auto-slide every 5 seconds
        setInterval(autoSlide, 5000);
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            changeSlide(-1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
        }
    });
    
    // Add touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    const carousel = document.querySelector('.photo-carousel');
    if (carousel) {
        carousel.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        carousel.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swiped left - next slide
                    changeSlide(1);
                } else {
                    // Swiped right - previous slide
                    changeSlide(-1);
                }
            }
        }
    }
});

// Product Filtering (no automatic tag changes)
document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('productsGrid');
    const filterGroup = document.getElementById('productFilters');
    if (!grid || !filterGroup) return;

    const productCards = Array.from(grid.querySelectorAll('.product-card'));

    // Helper: get tag from card
    function getCardTag(card) {
        const tagEl = card.querySelector('.product-tag');
        if (!tagEl) return 'all';
        if (tagEl.classList.contains('top-rated')) return 'top-rated';
        if (tagEl.classList.contains('trending')) return 'trending';
        if (tagEl.classList.contains('diwali')) return 'diwali';
        return 'all';
    }

    // Filtering
    function applyFilter(filter) {
        productCards.forEach(card => {
            const tag = getCardTag(card);
            const col = card.closest('[class*="col-"]');
            const show = filter === 'all' ? true : tag === filter;
            if (col) {
                col.style.display = show ? '' : 'none';
            }
        });
    }

    // Wire up buttons
    filterGroup.addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-filter]');
        if (!btn) return;
        const filter = btn.getAttribute('data-filter');
        Array.from(filterGroup.querySelectorAll('button')).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(filter);
    });

    // Default to showing all products initially
    applyFilter('all');

   
});

// Auto-slide feature icons one by one on mobile
document.addEventListener('DOMContentLoaded', function() {
    const featuresRow = document.querySelector('.features-row');
    if (!featuresRow) return;
    const items = Array.from(featuresRow.querySelectorAll('.feature-item'));
    if (items.length === 0) return;

    function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }
    let index = 0;
    const dotsContainer = document.querySelector('.features-dots');
    let dots = [];

    // Build dots for mobile
    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        dots = items.map((_, i) => {
            const d = document.createElement('span');
            d.className = 'dot' + (i === index ? ' active' : '');
            d.addEventListener('click', function() {
                if (!isMobile()) return;
                index = i;
                showOnly(index);
                updateDots();
            });
            dotsContainer.appendChild(d);
            return d;
        });
    }

    function updateDots() {
        if (!dotsContainer) return;
        dots.forEach((d, i) => {
            if (!d) return;
            d.classList.toggle('active', i === index);
        });
        // Hide dots on desktop
        dotsContainer.style.display = isMobile() ? 'flex' : 'none';
    }

    function showOnly(i) {
        items.forEach((it, idx) => {
            const col = it.closest('[class^="col-"]');
            if (!col) return;
            if (isMobile()) {
                const offset = (idx - i) * 100;
                col.style.transform = `translateX(${offset}%)`;
            } else {
                col.style.transform = '';
            }
        });
    }

    function cycle() {
        if (!isMobile()) {
            showOnly(-1);
            return;
        }

        // Show the current slide
        showOnly(index);
        updateDots();

        // Prepare for the next cycle
        index = (index + 1) % items.length;
    }

    buildDots();
    cycle();
    let timer = setInterval(cycle, 2500);
    window.addEventListener('resize', function() {
        clearInterval(timer);
        buildDots();
        cycle();
        timer = setInterval(cycle, 2500);
    }, { passive: true });
});
// Login Modal with OTP (no auto-open, token-based profile access)
    document.addEventListener('DOMContentLoaded', function () {
    const profileIcon = document.querySelector('.nav-icon.profile');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const modalRight = document.querySelector('.modal-right');
    const emailInput = modalRight.querySelector('.email-input input');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpStep = document.getElementById('otpStep');
    // const otpInput = document.getElementById('otp');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const profileMenu = document.getElementById("profileMenu");

    // Show modal or go to profile page if already logged in
    profileIcon?.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent closing immediately
    const token = localStorage.getItem("authToken");
 

    if (!token) {
    // No token → show login modal
    loginModal.classList.add("active");
    return;
    }
    

    // ✅ Only toggle dropdown, no fetch to backend
    profileMenu.classList.toggle("active");
    function openModal() {
  document.getElementById("loginModal").classList.add("active");
  document.body.style.overflow = "hidden";  // stop background scroll
}

function closeModal() {
  document.getElementById("loginModal").classList.remove("active");
  document.body.style.overflow = "";        // restore scroll
}
openModal();
closeModal();


    });

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/users/logout"); // call backend logout
    const data = await response.json();

    if (data.success) {
      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      alert("Logged out!");
      window.location.href = "/"; // redirect to homepage
    } else {
      alert("Logout failed!");
    }
  } catch (err) {
    console.error(err);
    alert("Logout error!");
  }
});




    // Close modal
    closeModal?.addEventListener('click', closeModalFunc);
    // loginModal?.addEventListener('click', (e) => {
    //     if (e.target === loginModal) closeModalFunc();
    // });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModal.classList.contains('active')) closeModalFunc();
    });

    function closeModalFunc() {
        loginModal.classList.remove('active');
        document.body.style.overflow = '';
        resetForm();
    }

    function resetForm() {
        emailInput.value = '';
        document.querySelectorAll('.otp-container input[name="otp[]"]').forEach(input => input.value = '');
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send OTP';
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify OTP';
        otpStep.style.display = 'none';
        modalRight.style.display = 'flex';
    }

    // OTP send & verify logic remains mostly same
    sendOtpBtn?.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim(); // get email input value
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic email validation regex

    if (!emailRegex.test(email)) {
    return alert('Please enter a valid email address');
    }

    sendOtpBtn.textContent = 'Sending...';
    sendOtpBtn.disabled = true;

        try {
            const res = await fetch('/api/users/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error sending OTP');

            modalRight.style.display = 'none';
            otpStep.style.display = 'block';
            console.log('OTP sent! Check console for demo OTP.');
        } catch (err) {
            alert(err.message);
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = 'Send OTP';
        }
    });

    verifyOtpBtn?.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  // Collect all 6 OTP inputs
  const otpInputs = document.querySelectorAll('.otp-container input[name="otp[]"]');
  let otp = '';
  otpInputs.forEach(input => otp += input.value.trim());

  // Validate
  if (otp.length !== 6) {
    alert('Please enter a valid 6-digit OTP');
    return;
  }

  verifyOtpBtn.textContent = 'Verifying...';
  verifyOtpBtn.disabled = true;

  try {
    const res = await fetch('/api/users/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'OTP verification failed');

    //  Save login details
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    //  Close modal (optional)
    if (typeof closeModalFunc === 'function') {
      closeModalFunc();
    }

    alert('Login successful!');
    updateProfileMenu(data.user);

    //  Reload after short delay (for smooth UX)
    setTimeout(() => {
      window.location.reload();
    }, 500);

  } catch (err) {
    alert(err.message || 'Verification failed. Please try again.');
    //  Go back to email login step
    verifyOtpBtn.disabled = false;
    verifyOtpBtn.textContent = 'Verify OTP';
  }
});


    document.querySelectorAll('.otp-container input[name="otp[]"]').forEach((input, index, inputs) => {
  input.addEventListener("input", () => {
    if (input.value && index < inputs.length - 1) {
      inputs[index + 1].focus(); // move to next box
    }
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && index > 0) {
      inputs[index - 1].focus(); // move back
    }
  });
});
});


function updateProfileMenu(user) {
    const profileMenu = document.getElementById("profileMenu");
    if (!profileMenu) return;

    let menuHtml = `
        <ul>
            <li><a href="/orders">My Orders</a></li>
            <li><a href="/profile">Account Details</a></li>
            <li><a href="/shipping">Shipping Address</a></li>
    `;

    if (user.isAdmin) {
        menuHtml += `
            <li><a href="/admin/dashboard" class="fw-bold text-danger">⚡ Admin Dashboard</a></li>
        `;
    }

    menuHtml += `
            <li><a href="#" id="logoutBtn">Logout</a></li>
        </ul>
    `;

    profileMenu.innerHTML = menuHtml;

}


// 🧠 Global function to update cart & wishlist counts
window.updateCounts = async function() {
  try {
    const [cartRes, wishRes] = await Promise.all([
      fetch('/cart/count'),
      fetch('/wishlist/count')
    ]);

    const cartData = await cartRes.json();
    const wishData = await wishRes.json();

    const cartBadge = document.getElementById('cartCount');
    const wishBadge = document.getElementById('wishlistCount');

    if (cartBadge) cartBadge.textContent = cartData.count > 0 ? cartData.count : '0';
    if (wishBadge) wishBadge.textContent = wishData.count > 0 ? wishData.count : '0';
  } catch (err) {
    console.error('Error updating counts:', err);
  }
};

// Run once on page load
document.addEventListener('DOMContentLoaded', window.updateCounts);

window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    // If page loaded from cache, re-fetch counts
    if (window.updateCounts) {
      window.updateCounts();
    }
  }
});

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container"); // match your HTML
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Small delay to allow transition
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => container.removeChild(toast), 300); // wait for animation to finish
  }, 3000);
}



