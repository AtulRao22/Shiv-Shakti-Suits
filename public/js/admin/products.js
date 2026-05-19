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
      const stockCell = row.children[5];
      const currentTags = row.dataset.tags || "";

      const { value: formValues } = await Swal.fire({
        title: 'Edit Product',
        html:
          `<input id="swal-name" class="swal2-input" placeholder="Product Name" value="${nameCell.textContent}">` +
          `<input id="swal-price" type="number" class="swal2-input" placeholder="Price" value="${priceCell.textContent.replace("₹","")}">` +
          `<input id="swal-stock" type="number" class="swal2-input" placeholder="Stock" value="${stockCell.textContent}">` +
          `<input id="swal-tags" class="swal2-input" placeholder="Tags (comma separated)" value="${currentTags}">`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        preConfirm: () => ({
          name: document.getElementById('swal-name').value,
          price: document.getElementById('swal-price').value,
          stock: document.getElementById('swal-stock').value,
          tags: document.getElementById('swal-tags').value
        })
      });

      if (!formValues) return;

      try {
        const res = await fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formValues.name,
            salePrice: Number(formValues.price),
            stock: Number(formValues.stock),
            tags: formValues.tags.split(",").map(t => t.trim())
          })
        });

        if (res.ok) {
          nameCell.textContent = formValues.name;
          priceCell.textContent = "₹" + formValues.price;

          // Update stock color
          let stockClass = "stock-ok";
          if (Number(formValues.stock) === 0) stockClass = "stock-out";
          else if (Number(formValues.stock) < 2) stockClass = "stock-low";
          stockCell.innerHTML = `<span class="${stockClass}">${formValues.stock}</span>`;

          row.dataset.tags = formValues.tags;

          Swal.fire('Updated!', 'Product updated successfully.', 'success');
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
