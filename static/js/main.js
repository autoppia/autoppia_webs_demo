// Initialize all date pickers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize flatpickr for date inputs
    flatpickr(".datepicker", {
        enableTime: false,
        dateFormat: "Y-m-d",
    });
    
    flatpickr(".datetimepicker", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
    });
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Initialize sortable lists
    var sortableLists = document.querySelectorAll('.sortable-list');
    sortableLists.forEach(function(list) {
        new Sortable(list, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function(evt) {
                // Get the new order
                var items = Array.from(evt.to.children).map(function(item) {
                    return item.dataset.id;
                });
                
                // Send the new order to the server
                if (list.dataset.updateUrl) {
                    fetch(list.dataset.updateUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify({items: items})
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showToast('Order updated successfully', 'success');
                        } else {
                            showToast('Failed to update order', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showToast('An error occurred', 'error');
                    });
                }
            }
        });
    });
    
    // Initialize right-click context menus
    document.addEventListener('contextmenu', function(e) {
        var contextElement = e.target.closest('[data-context-menu]');
        if (contextElement) {
            e.preventDefault();
            var menuId = contextElement.dataset.contextMenu;
            var menu = document.getElementById(menuId);
            if (menu) {
                // Hide all other context menus
                document.querySelectorAll('.context-menu').forEach(function(m) {
                    m.style.display = 'none';
                });
                
                // Position and show this menu
                menu.style.left = e.pageX + 'px';
                menu.style.top = e.pageY + 'px';
                menu.style.display = 'block';
                
                // Store the element ID in the menu for reference
                menu.dataset.targetId = contextElement.dataset.id;
            }
        }
    });
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', function() {
        document.querySelectorAll('.context-menu').forEach(function(menu) {
            menu.style.display = 'none';
        });
    });
    
    // Initialize custom input masks
    var phoneInputs = document.querySelectorAll('.phone-mask');
    phoneInputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    });
    
    var currencyInputs = document.querySelectorAll('.currency-mask');
    currencyInputs.forEach(function(input) {
        input.addEventListener('input', function(e) {
            var value
        input.addEventListener('input', function(e) {
            var value = e.target.value.replace(/\D/g, '');
            e.target.value = (value === '' ? '' : '$' + parseFloat(value/100).toFixed(2));
        });
    });
    
    // Initialize autocomplete
    var autocompleteInputs = document.querySelectorAll('.autocomplete');
    autocompleteInputs.forEach(function(input) {
        var container = document.createElement('div');
        container.className = 'autocomplete-container';
        input.parentNode.insertBefore(container, input);
        container.appendChild(input);
        
        var resultsDiv = document.createElement('div');
        resultsDiv.className = 'autocomplete-results';
        container.appendChild(resultsDiv);
        
        input.addEventListener('input', function() {
            if (input.value.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }
            
            fetch(input.dataset.url + '?q=' + input.value)
                .then(response => response.json())
                .then(data => {
                    resultsDiv.innerHTML = '';
                    if (data.results.length > 0) {
                        data.results.forEach(function(item) {
                            var div = document.createElement('div');
                            div.className = 'autocomplete-result';
                            div.textContent = item.text;
                            div.addEventListener('click', function() {
                                input.value = item.text;
                                if (input.dataset.valueField) {
                                    document.getElementById(input.dataset.valueField).value = item.id;
                                }
                                resultsDiv.style.display = 'none';
                            });
                            resultsDiv.appendChild(div);
                        });
                        resultsDiv.style.display = 'block';
                    } else {
                        resultsDiv.style.display = 'none';
                    }
                });
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', function(e) {
            if (!container.contains(e.target)) {
                resultsDiv.style.display = 'none';
            }
        });
    });
    
    // File upload with drag and drop
    var dropzones = document.querySelectorAll('.dropzone');
    dropzones.forEach(function(dropzone) {
        var fileInput = dropzone.querySelector('input[type="file"]');
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropzone.classList.add('dragover');
        }
        
        function unhighlight() {
            dropzone.classList.remove('dragover');
        }
        
        // Handle dropped files
        dropzone.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            var dt = e.dataTransfer;
            var files = dt.files;
            
            if (fileInput) {
                fileInput.files = files;
                
                // Trigger change event
                var event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        }
        
        // Handle click to select files
        dropzone.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Display selected file name
        if (fileInput) {
            fileInput.addEventListener('change', function() {
                var fileNameElement = dropzone.querySelector('.file-name');
                if (fileNameElement && fileInput.files.length > 0) {
                    fileNameElement.textContent = Array.from(fileInput.files)
                        .map(file => file.name)
                        .join(', ');
                }
            });
        }
    });
    
    // Multi-step wizard
    var wizards = document.querySelectorAll('.wizard-container');
    wizards.forEach(function(wizard) {
        var steps = wizard.querySelectorAll('.wizard-step');
        var contents = wizard.querySelectorAll('.wizard-content');
        var prevBtn = wizard.querySelector('.wizard-prev');
        var nextBtn = wizard.querySelector('.wizard-next');
        var submitBtn = wizard.querySelector('.wizard-submit');
        var currentStep = 0;
        
        // Initialize
        showStep(currentStep);
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (validateStep(currentStep)) {
                    if (currentStep < steps.length - 1) {
                        currentStep++;
                        showStep(currentStep);
                    }
                }
            });
        }
        
        function showStep(stepIndex) {
            // Hide all steps
            contents.forEach(function(content) {
                content.style.display = 'none';
            });
            
            // Show current step
            contents[stepIndex].style.display = 'block';
            
            // Update step indicators
            steps.forEach(function(step, index) {
                if (index < stepIndex) {
                    step.classList.remove('active');
                    step.classList.add('completed');
                } else if (index === stepIndex) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active');
                    step.classList.remove('completed');
                }
            });
            
            // Update buttons
            if (prevBtn) {
                prevBtn.style.display = stepIndex === 0 ? 'none' : 'block';
            }
            
            if (nextBtn) {
                nextBtn.style.display = stepIndex === steps.length - 1 ? 'none' : 'block';
            }
            
            if (submitBtn) {
                submitBtn.style.display = stepIndex === steps.length - 1 ? 'block' : 'none';
            }
        }
        
        function validateStep(stepIndex) {
            var currentContent = contents[stepIndex];
            var requiredFields = currentContent.querySelectorAll('[required]');
            var valid = true;
            
            requiredFields.forEach(function(field) {
                if (!field.value) {
                    valid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            return valid;
        }
    });
});

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Toast notification
function showToast(message, type = 'info') {
    var toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    var toastId = 'toast-' + Date.now();
    var toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    var toastElement = document.getElementById(toastId);
    var toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();
    
    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}})