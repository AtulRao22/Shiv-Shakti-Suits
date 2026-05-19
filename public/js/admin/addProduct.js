  // -------------------------------
  // ➕ Add Dynamic Variant Fields
  // -------------------------------
  const addVariantBtn = document.getElementById("addVariantBtn");
  const variantsContainer = document.getElementById("variantsContainer");

  addVariantBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("variant-group", "mb-2", "d-flex", "gap-2");

    div.innerHTML = `
      <input type="text" placeholder="Size (e.g. L)" class="form-control size" required>
      <input type="number" placeholder="Stock (e.g. 5)" class="form-control stock" min="0" required>
      <button type="button" class="btn btn-danger btn-sm remove-variant"><i class="fa fa-trash"></i></button>
    `;

    // Remove variant on clicking trash
    div.querySelector(".remove-variant").addEventListener("click", () => div.remove());

    variantsContainer.appendChild(div);
  });

  // -------------------------------
  // 📝 Handle Product Form Submission
  // -------------------------------
  const productForm = document.getElementById("productForm");

  productForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent default form submission

   const formData = new FormData();

// ✅ Manually add all form fields
const formElements = productForm.elements;
for (let i = 0; i < formElements.length; i++) {
  const el = formElements[i];
  if (el.name && el.type !== "file") {
    formData.append(el.name, el.value);
  }
}

// ✅ Add all selected images manually
const imageInput = document.getElementById("imageInput");
Array.from(imageInput.files).forEach(file => {
  formData.append("images", file);
});


    // -------------------------------
    // 1️⃣ Collect Variants
    // -------------------------------
    const variants = Array.from(variantsContainer.querySelectorAll(".variant-group"))
      .map(v => {
        const size = v.querySelector(".size").value.trim();
        const stock = parseInt(v.querySelector(".stock").value || 0);
        return size ? { size, stock } : null;
      })
      .filter(Boolean); // remove nulls
    formData.set("variants", JSON.stringify(variants));

    // -------------------------------
    // 2️⃣ Collect Tags
    // -------------------------------
    const tagsInput = document.getElementById("tagsInput").value;
    const tags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
    formData.set("tags", JSON.stringify(tags));

    // -------------------------------
    // 3️⃣ Collect Details (Optional)
    // -------------------------------
    const detailsInputs = document.querySelectorAll("#detailsContainer input, #detailsContainer select");
    const details = {};
    detailsInputs.forEach(input => {
      if (input.name && input.value.trim()) details[input.name] = input.value.trim();
    });
    formData.set("details", JSON.stringify(details));

    // -------------------------------
    // 4️⃣ Send FormData to Server
    // -------------------------------
    try {
      // Show loading spinner
      Swal.fire({
        title: 'Creating Product...',
        text: 'Please wait while product details and images are being uploaded.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch("/api/products/add", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Product has been created successfully.',
          icon: 'success',
          confirmButtonText: 'Great'
        });
        productForm.reset();
        variantsContainer.innerHTML = ""; // clear dynamic variants
      } else {
        Swal.fire('Error', data.error || 'Failed to create product', 'error');
      }
    } catch (err) {
      console.error("Error adding product:", err);
      Swal.fire('Error', 'Failed to add product. See console for details.', 'error');
    }
  });
