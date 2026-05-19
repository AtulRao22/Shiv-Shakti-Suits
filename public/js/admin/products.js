document.addEventListener("DOMContentLoaded", () => {

  // DELETE with SweetAlert2
  document.querySelectorAll('.btn-danger').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest("tr");
      const id = btn.dataset.id;

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          row.remove();
          Swal.fire('Deleted!', 'Product has been deleted.', 'success');
        } else {
          const data = await res.json();
          Swal.fire('Error', data.error || 'Failed to delete product', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Something went wrong.', 'error');
      }
    });
  });

  // EDIT with SweetAlert2
  document.querySelectorAll('.btn-warning').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest("tr");
      const id = btn.dataset.id;
      const nameCell = row.children[2];
      const priceCell = row.children[4];
      const tagsCell = row.children[5];
      const stockCell = row.children[6];
      const currentTags = row.dataset.tags || "";

      const { value: formValues } = await Swal.fire({
        title: 'Edit Product',
        html:
          `<div class="text-start">` +
            `<div class="mb-3">` +
              `<label class="form-label fw-bold small text-muted">Product Name</label>` +
              `<input id="swal-name" class="form-control" placeholder="Product Name" value="${nameCell.textContent.trim()}">` +
            `</div>` +
            `<div class="mb-3">` +
              `<label class="form-label fw-bold small text-muted">Price (₹)</label>` +
              `<input id="swal-price" type="number" class="form-control" placeholder="Price" value="${priceCell.textContent.replace("₹","").trim()}">` +
            `</div>` +
            `<div class="mb-3">` +
              `<label class="form-label fw-bold small text-muted">Stock</label>` +
              `<input id="swal-stock" type="number" class="form-control" placeholder="Stock" value="${stockCell.textContent.trim()}">` +
            `</div>` +
            `<div class="mb-3">` +
              `<label class="form-label fw-bold small text-muted">Tags (comma separated)</label>` +
              `<input id="swal-tags" class="form-control" placeholder="Tags" value="${currentTags.trim()}">` +
            `</div>` +
            `<div class="mb-3">` +
              `<label class="form-label fw-bold small text-danger">Replace Images (Optional)</label>` +
              `<input id="swal-images" type="file" class="form-control" multiple accept="image/*">` +
              `<small class="text-muted mt-1 d-block">Select new images to replace the current ones, or leave empty to keep existing images.</small>` +
            `</div>` +
          `</div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        cancelButtonText: 'Cancel',
        preConfirm: () => ({
          name: document.getElementById('swal-name').value,
          price: document.getElementById('swal-price').value,
          stock: document.getElementById('swal-stock').value,
          tags: document.getElementById('swal-tags').value,
          images: document.getElementById('swal-images').files
        })
      });

      if (!formValues) return;

      try {
        // Show loading spinner
        Swal.fire({
          title: 'Saving changes...',
          text: 'Please wait while product details and images are being uploaded.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const formData = new FormData();
        formData.append("name", formValues.name);
        formData.append("salePrice", Number(formValues.price));
        formData.append("stock", Number(formValues.stock));
        formData.append("tags", formValues.tags);

        if (formValues.images && formValues.images.length > 0) {
          for (let i = 0; i < formValues.images.length; i++) {
            formData.append("images", formValues.images[i]);
          }
        }

        const res = await fetch(`/api/products/${id}`, {
          method: "PUT",
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          nameCell.innerHTML = `<strong>${formValues.name}</strong>`;
          priceCell.textContent = "₹" + formValues.price;
          tagsCell.textContent = formValues.tags.split(",").map(t => t.trim()).join(", ");

          // Update stock color and value
          let stockClass = "stock-ok";
          if (Number(formValues.stock) === 0) stockClass = "stock-out";
          else if (Number(formValues.stock) < 2) stockClass = "stock-low";
          stockCell.innerHTML = `<span class="${stockClass}">${formValues.stock}</span>`;

          row.dataset.tags = formValues.tags;

          // Update the table thumbnail image instantly if new images were uploaded
          if (data.product && data.product.imageUrls && data.product.imageUrls.length > 0) {
            const imgEl = row.querySelector("td img");
            if (imgEl) {
              imgEl.src = data.product.imageUrls[0];
            }
          }

          Swal.fire('Updated!', 'Product has been updated successfully.', 'success');
        } else {
          const data = await res.json();
          Swal.fire('Error', data.error || 'Failed to update product', 'error');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Something went wrong.', 'error');
      }
    });
  });

});
