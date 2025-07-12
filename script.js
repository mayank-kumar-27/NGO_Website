// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initNavigation();
    initGalleryFilter();
    initDonationForm();
    initContactForm();
    initScrollAnimations();
    initModalFunctionality();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle mobile menu
    hamburger.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
        }
    });
}

// Gallery filter functionality
function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Donation form functionality
function initDonationForm() {
    const donationForm = document.getElementById('donationForm');
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    let selectedAmount = 0;

    // Amount button selection
    amountButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all buttons
            amountButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            selectedAmount = parseInt(this.getAttribute('data-amount'));
            customAmountInput.value = '';
        });
    });

    // Custom amount input
    customAmountInput.addEventListener('input', function () {
        // Remove active class from all amount buttons
        amountButtons.forEach(btn => btn.classList.remove('active'));
        selectedAmount = parseInt(this.value) || 0;
    });

    // Form submission
    donationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const donationData = {
            amount: selectedAmount || parseInt(customAmountInput.value),
            name: formData.get('donorName'),
            email: formData.get('donorEmail'),
            phone: formData.get('donorPhone'),
            purpose: formData.get('donationPurpose'),
            message: formData.get('donorMessage')
        };

        // Validate amount
        if (!donationData.amount || donationData.amount < 1) {
            showModal('Error', 'Please select or enter a valid donation amount.');
            return;
        }

        // Validate required fields
        if (!donationData.name || !donationData.email) {
            showModal('Error', 'Please fill in all required fields.');
            return;
        }

        // Validate email format
        if (!isValidEmail(donationData.email)) {
            showModal('Error', 'Please enter a valid email address.');
            return;
        }

        // Process payment with Razorpay
        processPayment(donationData);
    });
}

// Payment processing with Razorpay
function processPayment(donationData) {
    // Razorpay configuration
    const options = {
        key: 'rzp_test_1234567890', // Replace with your Razorpay key
        amount: donationData.amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Virangana Club',
        description: `Donation for ${donationData.purpose}`,
        image: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=VC',
        handler: function (response) {
            // Payment successful
            handlePaymentSuccess(response, donationData);
        },
        prefill: {
            name: donationData.name,
            email: donationData.email,
            contact: donationData.phone
        },
        notes: {
            purpose: donationData.purpose,
            message: donationData.message
        },
        theme: {
            color: '#8B5CF6'
        },
        modal: {
            ondismiss: function () {
                showModal('Payment Cancelled', 'Your payment was cancelled. Please try again if you wish to donate.');
            }
        }
    };

    // Create Razorpay instance and open checkout
    const rzp = new Razorpay(options);
    rzp.open();
}

// Handle successful payment
function handlePaymentSuccess(response, donationData) {
    // Here you would typically send the payment details to your server
    console.log('Payment successful:', response);

    // Show success message
    const successMessage = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 4rem; color: #10b981; margin-bottom: 20px;">✓</div>
            <h3 style="color: #1a202c; margin-bottom: 15px;">Thank You for Your Donation!</h3>
            <p style="color: #4a5568; margin-bottom: 10px;">Payment ID: ${response.razorpay_payment_id}</p>
            <p style="color: #4a5568; margin-bottom: 10px;">Amount: ₹${donationData.amount}</p>
            <p style="color: #4a5568;">Your generous contribution will help us empower more women and create lasting change.</p>
        </div>
    `;

    showModal('Donation Successful', successMessage);

    // Reset form
    document.getElementById('donationForm').reset();
    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
}

// Contact form functionality
emailjs.init("7hRbe8T_u3NvIbgee");
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const form = this;

        const formData = new FormData(form);
        const contactData = {
            name: formData.get('contactName'),
            email: formData.get('contactEmail'),
            subject: formData.get('contactSubject'),
            message: formData.get('contactMessage')
        };

        // Validate required fields
        if (!contactData.name || !contactData.email || !contactData.message) {
            showModal('Error', 'Please fill in all required fields.');
            return;
        }

        // Validate email format
        if (!isValidEmail(contactData.email)) {
            showModal('Error', 'Please enter a valid email address.');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Send the form using EmailJS
        emailjs.sendForm('service_qx24xh3', 'template_hfsi4xp', form)
            .then(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                form.reset();

                const successMessage = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="font-size: 4rem; color: #10b981; margin-bottom: 20px;">✓</div>
                        <h3 style="color: #1a202c; margin-bottom: 15px;">Message Sent Successfully!</h3>
                        <p style="color: #4a5568;">Thank you for reaching out to us. We'll get back to you within 24 hours.</p>
                    </div>
                `;
                showModal('Message Sent', successMessage);
            })
            .catch((error) => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showModal('Error', 'Failed to send message. Please try again later.');
                console.error('EmailJS Error:', error);
            });
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.team-card, .gallery-item, .stat-item, .contact-item');
    animateElements.forEach(el => observer.observe(el));
}

// Modal functionality
function initModalFunctionality() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');

    // Close modal when clicking close button
    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Show modal with custom content
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <h2 style="color: #1a202c; margin-bottom: 20px; text-align: center;">${title}</h2>
        ${content}
    `;

    modal.style.display = 'block';
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Handle window resize
window.addEventListener('resize', function () {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');

    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Loading state management
function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

// Form validation helpers
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#e2e8f0';
        }
    });

    return isValid;
}

// Auto-hide alerts
function showAlert(message, type = 'success', duration = 5000) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
    `;
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, duration);
}

// Add CSS for slide animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize page
console.log('Virangana Club website initialized successfully!');

// Error handling
window.addEventListener('error', function (e) {
    console.error('An error occurred:', e.error);
    showAlert('An error occurred. Please refresh the page and try again.', 'error');
});

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function (error) {
                console.log('ServiceWorker registration failed');
            });
    });
}
