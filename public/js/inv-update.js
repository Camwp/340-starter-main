// /public/js/inv-update.js
'use strict';

const form = document.querySelector('#updateForm');
if (form) {
    form.addEventListener('change', () => {
        const updateBtn = form.querySelector('button, input[type="submit"]');
        if (updateBtn) updateBtn.removeAttribute('disabled');
    });
}
