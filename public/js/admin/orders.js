    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.save-status').forEach(btn => {
        btn.addEventListener('click', async () => {
          const row = btn.closest('tr');
          const id = row.getAttribute('data-id');
          const status = row.querySelector('.status-select').value;
          try {
            const res = await fetch(`/admin/orders/${id}/status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed');
            // Optional: visual cue
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-success');
            setTimeout(() => {
              btn.classList.remove('btn-success');
              btn.classList.add('btn-outline-primary');
            }, 800);
          } catch (e) {
            alert('Failed to update status: ' + (e.message || 'Unknown error'));
          }
        });
      });
    });
