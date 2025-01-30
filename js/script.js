// Add scrolled class to navbar when scrolling
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle menu
    hamburgerMenu.addEventListener('click', function() {
        toggleMenu();
    });

    // Close menu when clicking overlay
    mobileOverlay.addEventListener('click', function() {
        toggleMenu();
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            toggleMenu();
        });
    });

    // Toggle menu function
    function toggleMenu() {
        hamburgerMenu.classList.toggle('active');
        navbarCollapse.classList.toggle('show');
        mobileOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = navbarCollapse.contains(event.target) || 
                            hamburgerMenu.contains(event.target);
        
        if (!isClickInside && navbarCollapse.classList.contains('show')) {
            toggleMenu();
        }
    });

    // Prevent menu from closing when clicking inside
    navbarCollapse.addEventListener('click', function(event) {
        event.stopPropagation();
    });

    // Close menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 991 && navbarCollapse.classList.contains('show')) {
            toggleMenu();
        }
    });
});

// Enhanced scroll reveal animation with intersection observer
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            if (entry.target.classList.contains('skills-list')) {
                animateSkills(entry.target);
            }
        }
    });
}, observerOptions);

// Observe all scroll-reveal elements
document.querySelectorAll('.scroll-reveal').forEach(element => {
    observer.observe(element);
});

// Animate skills list items
function animateSkills(skillsList) {
    const items = skillsList.querySelectorAll('li');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 200);
    });
}

// 3D tilt effect for projects
document.querySelectorAll('.project').forEach(project => {
    project.addEventListener('mousemove', (e) => {
        const rect = project.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        project.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    project.addEventListener('mouseleave', () => {
        project.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
});

// Smooth parallax scrolling effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.profile-container');
    
    parallaxElements.forEach(element => {
        const speed = 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Contact Form Validation and Animation
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset form states
            const formGroups = this.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                group.classList.remove('error', 'success');
            });
            
            // Validate form
            let isValid = true;
            
            // Name validation
            const name = this.querySelector('#name');
            if (!name.value.trim()) {
                setError(name, 'Please enter your name');
                isValid = false;
            } else {
                setSuccess(name);
            }
            
            // Email validation
            const email = this.querySelector('#email');
            if (!isValidEmail(email.value)) {
                setError(email, 'Please enter a valid email');
                isValid = false;
            } else {
                setSuccess(email);
            }
            
            // Subject validation
            const subject = this.querySelector('#subject');
            if (!subject.value.trim()) {
                setError(subject, 'Please enter a subject');
                isValid = false;
            } else {
                setSuccess(subject);
            }
            
            // Message validation
            const message = this.querySelector('#message');
            if (!message.value.trim()) {
                setError(message, 'Please enter your message');
                isValid = false;
            } else {
                setSuccess(message);
            }
            
            if (isValid) {
                // Animate submit button
                const submitBtn = this.querySelector('.submit-btn');
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                // Simulate form submission (replace with actual form submission)
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
                    submitBtn.style.background = '#2ecc71';
                    
                    // Reset form after 2 seconds
                    setTimeout(() => {
                        this.reset();
                        submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                        submitBtn.style.background = '';
                    }, 2000);
                }, 2000);
            }
        });
    }
    
    // Helper functions
    function setError(input, message) {
        const formGroup = input.parentElement;
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
    
    function setSuccess(input) {
        const formGroup = input.parentElement;
        formGroup.classList.add('success');
        formGroup.classList.remove('error');
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});
