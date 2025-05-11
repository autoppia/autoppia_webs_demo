// Common JavaScript functions

// Function to handle quantity changes
function updateQuantity(productId, action) {
    const quantityElement = document.getElementById(`qty-${productId}`);
    let quantity = parseInt(quantityElement.innerText);
    
    if (action === 'increase') {
        quantity += 1;
    } else if (action === 'decrease' && quantity > 1) {
        quantity -= 1;
    }
    
    quantityElement.innerText = quantity;
}

// Function to show/hide password
function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});