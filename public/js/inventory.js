'use strict';

const classificationList = document.querySelector('#classificationList');
const inventoryDisplay = document.querySelector('#inventoryDisplay');

if (classificationList) {
    classificationList.addEventListener('change', () => {
        const id = classificationList.value;
        if (!id) { inventoryDisplay.innerHTML = ''; return; }

        fetch(`/inv/getInventory/${id}`)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => buildInventoryList(data))
            .catch(err => {
                console.error('Fetch error:', err.message);
                inventoryDisplay.innerHTML = `<p class="error">Unable to load inventory.</p>`;
            });
    });
}

function buildInventoryList(data) {
    let html = '<thead><tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr></thead><tbody>';
    data.forEach(v => {
        html += `<tr>
      <td>${v.inv_make} ${v.inv_model}</td>
      <td><a href="/inv/edit/${v.inv_id}" title="Click to update">Modify</a></td>
      <td><a href="/inv/delete/${v.inv_id}" title="Click to delete">Delete</a></td>
    </tr>`;
    });
    html += '</tbody>';
    inventoryDisplay.innerHTML = html;
}
