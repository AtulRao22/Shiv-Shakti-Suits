document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const tabs = document.querySelectorAll(".profile-sidebar .tab");
  const panes = document.querySelectorAll(".profile-content .tab-pane");

  function activateTab(tabName) {
    if (!tabName) return;

    // Deactivate all
    tabs.forEach(t => t.classList.remove("active"));
    panes.forEach(p => p.classList.remove("active"));

    // Activate selected
    const activeTab = document.querySelector(`.profile-sidebar .tab[data-tab="${tabName}"]`);
    const activePane = document.getElementById(tabName);

    if (activeTab && activePane) {
      activeTab.classList.add("active");
      activePane.classList.add("active");
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      activateTab(tabName);

      // Update URL query parameter without reloading
      const newUrl = `${window.location.pathname}?tab=${tabName}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    });
  });

  // Handle URL query parameter on load
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab");
  if (initialTab) {
    activateTab(initialTab);
  }

  // Logout Profile Sidebar Handler
  const logoutBtnProfile = document.getElementById("logoutBtnProfile");
  logoutBtnProfile?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to logout?")) return;

    try {
      const response = await fetch("/api/users/logout");
      const data = await response.json();

      if (data.success) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/";
      } else {
        alert("Logout failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging out.");
    }
  });

  // Profile Update Form (Update Name)
  const profileForm = document.getElementById("profile-update-form");
  profileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("profile-name");
    const name = nameInput.value.trim();

    if (!name) return alert("Please enter a valid display name.");

    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      const data = await res.json();

      if (data.success) {
        alert("✏️ Profile name updated successfully!");

        // Live update UI elements
        const nameHeading = document.getElementById("sidebar-display-name");
        if (nameHeading) nameHeading.textContent = data.name;

        // Update user initial in avatar
        const avatarInitial = document.querySelector(".avatar-initial");
        if (avatarInitial) avatarInitial.textContent = data.name.charAt(0).toUpperCase();

        // Update local storage user if exists
        const userObjStr = localStorage.getItem("user");
        if (userObjStr) {
          const userObj = JSON.parse(userObjStr);
          userObj.name = data.name;
          localStorage.setItem("user", JSON.stringify(userObj));
        }
      } else {
        alert(data.message || "Failed to update profile name.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update profile name.");
    }
  });

  // Address Section Elements
  const btnShowAddForm = document.getElementById("btn-show-add-form");
  const addressFormCard = document.getElementById("address-form-card");
  const btnCancelAddress = document.getElementById("btn-cancel-address");
  const addressEditorForm = document.getElementById("address-editor-form");
  const formCardTitle = document.getElementById("form-card-title");
  const editAddressId = document.getElementById("edit-address-id");

  // Address Form inputs
  const inFullName = document.getElementById("addr-fullname");
  const inPhone = document.getElementById("addr-phone");
  const inStreet = document.getElementById("addr-street");
  const inLandmark = document.getElementById("addr-landmark");
  const inCity = document.getElementById("addr-city");
  const inState = document.getElementById("addr-state");
  const inPincode = document.getElementById("addr-pincode");
  const inType = document.getElementById("addr-type");

  // Reset form fields
  function resetAddressForm() {
    editAddressId.value = "";
    inFullName.value = "";
    inPhone.value = "";
    inStreet.value = "";
    inLandmark.value = "";
    inCity.value = "";
    inState.value = "";
    inPincode.value = "";
    inType.value = "Home";
    formCardTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add New Address`;
  }

  // Show new address form
  btnShowAddForm?.addEventListener("click", () => {
    resetAddressForm();
    addressFormCard.style.display = "block";
    addressFormCard.scrollIntoView({ behavior: "smooth" });
  });

  // Cancel / Close address form
  btnCancelAddress?.addEventListener("click", () => {
    addressFormCard.style.display = "none";
    resetAddressForm();
  });

  // Edit Address (Prefill & Scroll)
  document.querySelectorAll(".edit-addr-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".address-card");
      if (!card) return;

      const id = card.dataset.id;
      editAddressId.value = id;

      inFullName.value = card.dataset.fullname || "";
      inPhone.value = card.dataset.phone || "";
      inStreet.value = card.dataset.street || "";
      inLandmark.value = card.dataset.landmark || "";
      inCity.value = card.dataset.city || "";
      inState.value = card.dataset.state || "";
      inPincode.value = card.dataset.pincode || "";
      inType.value = card.dataset.type || "Home";

      formCardTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Address`;
      addressFormCard.style.display = "block";
      addressFormCard.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Submit Address Form (Add / Edit via AJAX)
  addressEditorForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      fullName: inFullName.value.trim(),
      phone: inPhone.value.trim(),
      street: inStreet.value.trim(),
      landmark: inLandmark.value.trim(),
      city: inCity.value.trim(),
      state: inState.value.trim(),
      pincode: inPincode.value.trim(),
      type: inType.value
    };

    const id = editAddressId.value;
    const url = id ? `/addresses/${id}` : "/addresses/add";
    const method = id ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (result.success) {
        alert(id ? "✏️ Address updated successfully!" : "✅ Address added successfully!");
        window.location.reload();
      } else {
        alert(result.message || "Failed to save address.");
      }
    } catch (err) {
      console.error("Address save error:", err);
      alert("Failed to save address.");
    }
  });

  // Delete Address
  document.querySelectorAll(".delete-addr-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!id) return;

      if (!confirm("🗑️ Are you sure you want to delete this address?")) return;

      try {
        const res = await fetch(`/addresses/${id}`, {
          method: "DELETE"
        });
        const result = await res.json();

        if (result.success) {
          // Remove card from DOM smoothly
          const card = document.getElementById(`address-card-${id}`);
          if (card) {
            card.style.opacity = "0";
            card.style.transform = "scale(0.8)";
            setTimeout(() => {
              card.remove();
              // If no cards left, show empty state
              const container = document.getElementById("addresses-container");
              if (container && container.querySelectorAll(".address-card").length === 0) {
                container.innerHTML = `
                  <div class="empty-state" style="grid-column: 1/-1; width:100%" id="address-empty-state">
                    <i class="fa-solid fa-map-location-dot"></i>
                    <p>No shipping addresses saved yet. Add an address to make your next checkout even faster!</p>
                  </div>
                `;
              }
            }, 300);
          }
          alert("Address deleted.");
        } else {
          alert(result.message || "Failed to delete address.");
        }
      } catch (err) {
        console.error("Address delete error:", err);
        alert("Failed to delete address.");
      }
    });
  });
});
