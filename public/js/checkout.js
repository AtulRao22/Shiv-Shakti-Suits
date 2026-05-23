document.addEventListener('DOMContentLoaded', function() {
    const steps = {
        address: document.getElementById('address-step'),
        review: document.getElementById('review-step'),
        payment: document.getElementById('payment-step')
    };

    const progressSteps = document.querySelectorAll('.progress-steps .step');

    // Add New Address
    const addNewAddressBtn = document.getElementById('add-new-address-btn');
    const newAddressForm = document.getElementById('new-address-form');
    const cancelAddressBtn = document.getElementById('cancel-address-btn');

    addNewAddressBtn.addEventListener('click', function() {
        newAddressForm.style.display = 'block';
        addNewAddressBtn.style.display = 'none';
    });

    cancelAddressBtn.addEventListener('click', function() {
        newAddressForm.style.display = 'none';
        addNewAddressBtn.style.display = 'block';
    });

    // Continue to Review
    document.getElementById('continue-to-review').addEventListener('click', function() {
        updateSelectedDeliveryInfo();
        showStep(1);
        updateProgressSteps(1);
    });

    // Continue to Payment
    document.getElementById('continue-to-payment').addEventListener('click', function() {
        showStep(2);
        updateProgressSteps(2);
    });

    // Change Address
    document.getElementById('change-address').addEventListener('click', function() {
        showStep(0);
        updateProgressSteps(0);
    });

    function showStep(stepIndex) {
        Object.values(steps).forEach(step => step.style.display = 'none');
        
        if (stepIndex === 0) steps.address.style.display = 'block';
        else if (stepIndex === 1) steps.review.style.display = 'block';
        else if (stepIndex === 2) steps.payment.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateProgressSteps(activeIndex) {
        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            
            if (index < activeIndex) {
                step.classList.add('completed');
            } else if (index === activeIndex) {
                step.classList.add('active');
            }
        });
    }

    // Address Selection + set hidden input
    const addressIdInput = document.getElementById('addressId');
    const preselected = document.querySelector('.address-card.selected input[type="radio"]');
    if (preselected) addressIdInput.value = preselected.value;

    document.querySelectorAll('.address-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!(e.target && (e.target.closest('.edit-addr-btn') || e.target.closest('.delete-addr-btn')))) {
                document.querySelectorAll('.address-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                const radio = this.querySelector('input[type="radio"]');
                radio.checked = true;
                addressIdInput.value = radio.value;
                if (steps.review.style.display !== 'none') {
                    updateSelectedDeliveryInfo();
                }
            }
        });
    });

    function updateSelectedDeliveryInfo() {
        const card = document.querySelector('.address-card.selected');
        if (!card) return;
        const name = card.dataset.fullname || '';
        const street = card.dataset.street || '';
        const landmark = card.dataset.landmark ? ', ' + card.dataset.landmark : '';
        const city = card.dataset.city || '';
        const state = card.dataset.state || '';
        const pincode = card.dataset.pincode || '';
        const phone = card.dataset.phone || '';
        const text = `${name}, ${street}${landmark}, ${city}, ${state} ${pincode} — Phone: ${phone}`;
        const target = document.getElementById('selected-delivery-address');
        if (target) target.textContent = text;
    }

// Save / Update Address
let editingAddressId = null;
document.getElementById('save-address-btn').addEventListener('click', async () => {
  const data = {
    fullName: document.getElementById('addr-name').value,
    phone: document.getElementById('addr-phone').value,
    street: document.getElementById('addr-street').value,
    landmark: document.getElementById('addr-landmark').value,
    city: document.getElementById('addr-city').value,
    state: document.getElementById('addr-state').value,
    pincode: document.getElementById('addr-pincode').value,
    type: document.getElementById('addr-type').value
  };

  const url = editingAddressId ? `/addresses/${editingAddressId}` : '/addresses/add';
  const method = editingAddressId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();

  if (result.success) {
    alert(editingAddressId ? '✏️ Address updated!' : '✅ Address saved!');
    location.reload();
  }
});

// Edit Address (prefill)
document.querySelectorAll('.edit-addr-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const card = this.closest('.address-card');
    editingAddressId = this.dataset.id;
    document.getElementById('addr-name').value = card.dataset.fullname || '';
    document.getElementById('addr-phone').value = card.dataset.phone || '';
    document.getElementById('addr-street').value = card.dataset.street || '';
    document.getElementById('addr-landmark').value = card.dataset.landmark || '';
    document.getElementById('addr-city').value = card.dataset.city || '';
    document.getElementById('addr-state').value = card.dataset.state || '';
    document.getElementById('addr-pincode').value = card.dataset.pincode || '';
    document.getElementById('addr-type').value = card.dataset.type || 'Home';
    newAddressForm.style.display = 'block';
    addNewAddressBtn.style.display = 'none';
  });
});

// Delete Address
document.querySelectorAll('.delete-addr-btn').forEach(btn => {
  btn.addEventListener('click', async function (e) {
    e.stopPropagation();
    const addressId = this.dataset.id;
    if (!confirm('Delete this address?')) return;

    const res = await fetch(`/addresses/${addressId}`, { method: 'DELETE' });
    const result = await res.json();

    if (result.success) {
      alert('🗑️ Address deleted');
      location.reload();
    }
  });
});

// Payment handling (Razorpay for Online)
const paymentForm = document.getElementById('payment-form');
paymentForm.addEventListener('submit', async function (e) {
  const isOnline = document.getElementById('online').checked;
  if (!isOnline) return; // COD - allow default submit

  e.preventDefault();
  if (!addressIdInput.value) {
    alert('Please select a delivery address.');
    return;
  }

  try {
    const orderRes = await fetch('/payment/razorpay/create-order', { method: 'POST' });
    const data = await orderRes.json();
    if (!data.success) {
      alert('Failed to initiate payment');
      return;
    }

    const selectedCard = document.querySelector('.address-card.selected');
    const prefillName = selectedCard?.dataset.fullname || '';
    const prefillPhone = selectedCard?.dataset.phone || '';

    // Resolve theme color from Buy button style (supports gradient by using first stop)
    function rgbToHex(rgb) {
      const m = rgb && rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!m) return '#667eea';
      const r = (+m[1]).toString(16).padStart(2,'0');
      const g = (+m[2]).toString(16).padStart(2,'0');
      const b = (+m[3]).toString(16).padStart(2,'0');
      return `#${r}${g}${b}`;
    }
    let themeColor = '#667eea';
    const buyBtn = document.querySelector('.btn-primary');
    if (buyBtn) {
      const cs = getComputedStyle(buyBtn);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        const firstColor = cs.backgroundImage.match(/rgba?\([^\)]+\)/);
        if (firstColor) themeColor = rgbToHex(firstColor[0]);
      } else if (cs.backgroundColor) {
        themeColor = rgbToHex(cs.backgroundColor);
      }
    }

    // Use user info for prefill fallback
    const userMeta = document.getElementById('rzp-user');
    const userEmail = userMeta ? userMeta.getAttribute('data-email') : '';
    const effectiveName = (prefillName && prefillName.trim()) ? prefillName : (userMeta ? userMeta.getAttribute('data-name') : '');

    const rzp = new Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'Shiv Shakti Suits',
      description: effectiveName || 'Order Payment',
      order_id: data.orderId,
      handler: async function (response) {
        const verifyRes = await fetch('/payment/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...response,
            addressId: addressIdInput.value
          })
        });
        const vr = await verifyRes.json();
        if (vr.success) {
          window.location.href = vr.redirect || '/checkout/success';
        } else {
          alert('Payment verification failed');
        }
      },
      prefill: { name: effectiveName, email: userEmail, contact: prefillPhone },
      notes: { customer_name: effectiveName || '', address_id: addressIdInput.value || '' },
      theme: { color: themeColor }
    });
    rzp.open();
  } catch (err) {
    alert('Payment error');
  }
});

});
