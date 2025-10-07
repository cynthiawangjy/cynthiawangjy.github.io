// Loading Screen Functionality
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    let loadedAssets = 0;
    let totalAssets = 0;
    let allAssetsLoaded = false;
    
    // Function to hide loading screen with stage curtain effect
    function hideLoadingScreen() {
        if (allAssetsLoaded) return; // Prevent multiple calls
        allAssetsLoaded = true;
        
        loadingScreen.classList.add('fade-out');
        
        // Remove loading screen from DOM after animation
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }
    
    // Function to check if all assets are loaded
    function checkAllAssetsLoaded() {
        loadedAssets++;
        console.log(`Asset loaded: ${loadedAssets}/${totalAssets}`);
        
        if (loadedAssets >= totalAssets) {
            // Add a small delay to ensure smooth transition
            setTimeout(hideLoadingScreen, 500);
        }
    }
    
    // Function to handle urgent message video with pause at end
    function setupUrgentMessageVideo() {
        const urgentVideo = document.querySelector('video[src*="send-urgent-msg"]');
        if (urgentVideo) {
            urgentVideo.loop = false; // Disable default looping
            urgentVideo.muted = true;
            urgentVideo.playsInline = true;
            
            urgentVideo.addEventListener('ended', function() {
                // Pause for 1 second before restarting
                setTimeout(() => {
                    this.currentTime = 0;
                    this.play();
                }, 1000);
            });
        }
    }

    // Function to wait for all assets to load
    async function waitForAllAssets() {
        const videos = document.querySelectorAll('video');
        const images = document.querySelectorAll('img');
        
        // Count total assets
        totalAssets = videos.length + images.length;
        console.log(`Waiting for ${totalAssets} assets to load...`);
        
        if (totalAssets === 0) {
            // No assets, hide loading screen after a short delay
            setTimeout(hideLoadingScreen, 1500);
            return;
        }
        
        // Wait for all images to load
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                if (img.complete && img.naturalHeight !== 0) {
                    // Image already loaded
                    checkAllAssetsLoaded();
                    resolve();
                } else {
                    img.addEventListener('load', () => {
                        checkAllAssetsLoaded();
                        resolve();
                    });
                    img.addEventListener('error', () => {
                        checkAllAssetsLoaded();
                        resolve();
                    });
                }
            });
        });
        
        // Wait for all videos to be ready
        const videoPromises = Array.from(videos).map(video => {
            return new Promise((resolve) => {
                // Set up video properties
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.preload = 'metadata';
                
                const handleVideoReady = () => {
                    checkAllAssetsLoaded();
                    resolve();
                };
                
                if (video.readyState >= 3) { // HAVE_FUTURE_DATA or higher
                    // Video is already ready
                    handleVideoReady();
                } else {
                    video.addEventListener('loadedmetadata', handleVideoReady);
                    video.addEventListener('error', handleVideoReady);
                    
                    // Fallback timeout for videos that don't fire events
                    setTimeout(handleVideoReady, 3000);
                }
            });
        });
        
        // Wait for all assets
        try {
            await Promise.all([...imagePromises, ...videoPromises]);
        } catch (error) {
            console.log('Some assets failed to load, but continuing...');
        }
        
        // Setup urgent message video with pause
        setupUrgentMessageVideo();
        
        // Fallback timeout - force hide after 8 seconds
        setTimeout(() => {
            if (!allAssetsLoaded) {
                console.log('Forcing loading screen to hide after timeout');
                hideLoadingScreen();
            }
        }, 8000);
    }
    
    // Start waiting for all assets
    waitForAllAssets();
});

// Carousel functionality with gradient backgrounds
const carouselImages = [
    { src: 'images/home/musinsa.png', gradient: 'musinsa' },
    { src: 'images/home/china.png', gradient: 'china' },
    { src: 'images/home/gu.png', gradient: 'gu' },
    { src: 'images/home/pride.png', gradient: 'pride' },
    { src: 'images/home/taiwan.png', gradient: 'taiwan' }
];

let currentSlide = 0;

function changeSlide(direction) {
    currentSlide += direction;
    
    // Loop around
    if (currentSlide >= carouselImages.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = carouselImages.length - 1;
    }
    
    const carouselImg = document.getElementById('carousel-img');
    const heroSection = document.querySelector('.hero');
    const envelopeFooter = document.querySelector('.envelope-footer');
    
    if (carouselImg) {
        carouselImg.src = carouselImages[currentSlide].src;
    }
    
    if (heroSection) {
        // Remove all gradient classes
        heroSection.classList.remove('musinsa', 'china', 'gu', 'pride', 'taiwan');
        // Add the new gradient class
        heroSection.classList.add(carouselImages[currentSlide].gradient);
    }
    
    if (envelopeFooter) {
        // Remove all gradient classes from footer
        envelopeFooter.classList.remove('musinsa', 'china', 'gu', 'pride', 'taiwan');
        // Add the new gradient class to footer
        envelopeFooter.classList.add(carouselImages[currentSlide].gradient);
    }
    
    // Also update the new homepage footer
    const homepageFooter = document.querySelector('.homepage-footer');
    if (homepageFooter) {
        // Remove all gradient classes from footer
        homepageFooter.classList.remove('musinsa', 'china', 'gu', 'pride', 'taiwan');
        // Add the new gradient class to footer
        homepageFooter.classList.add(carouselImages[currentSlide].gradient);
    }
}

// Custom smooth scroll function with 80px offset
function smoothScrollToElement(element) {
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 80; // 80px offset
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        smoothScrollToElement(target);
    });
});

// Footer scroll animation (for both envelope and homepage footer)
function initEnvelopeAnimation() {
    const envelopeFooter = document.querySelector('.envelope-footer');
    const homepageFooter = document.querySelector('.homepage-footer');
    
    // Handle envelope footer if it exists
    if (envelopeFooter) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add a small delay before opening the envelope
                    setTimeout(() => {
                        envelopeFooter.classList.add('scrolled');
                    }, 200);
                }
            });
        }, {
            threshold: 0.3, // Trigger when 30% of the envelope is visible
            rootMargin: '0px 0px -100px 0px' // Start animation slightly before it's fully in view
        });
        
        observer.observe(envelopeFooter);
    }
    
    // Handle homepage footer if it exists
    if (homepageFooter) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add a small delay before any footer animation
                    setTimeout(() => {
                        homepageFooter.classList.add('scrolled');
                    }, 200);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });
        
        observer.observe(homepageFooter);
    }
}

// Initialize envelope animation when DOM is loaded
document.addEventListener('DOMContentLoaded', initEnvelopeAnimation);

// Copy email functionality
function copyEmail(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const email = 'cynthiawangjy123@gmail.com';
    // Try to find case study footer copy button first, then fallback to homepage
    const copyButton = document.querySelector('.case-study-footer-copy-button') || document.querySelector('.copy-button');
    const copyIcon = document.querySelector('.case-study-footer-copy-icon') || document.querySelector('.copy-icon');
    
    navigator.clipboard.writeText(email).then(function() {
        // Success feedback
        copyButton.classList.add('copied');
        copyIcon.textContent = 'check';
        
        // Reset after 2 seconds
        setTimeout(function() {
            copyButton.classList.remove('copied');
            copyIcon.textContent = 'content_copy';
        }, 2000);
    }).catch(function(err) {
        console.error('Could not copy text: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Still show success feedback
        copyButton.classList.add('copied');
        copyIcon.textContent = 'check';
        
        setTimeout(function() {
            copyButton.classList.remove('copied');
            copyIcon.textContent = 'content_copy';
        }, 2000);
    });
}


// Dark mode toggle functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button icon
    const toggleButton = document.querySelector('.theme-toggle');
    if (toggleButton) {
        const icon = toggleButton.querySelector('span');
        if (icon) {
            icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Update toggle button icon
    const toggleButton = document.querySelector('.theme-toggle');
    if (toggleButton) {
        const icon = toggleButton.querySelector('span');
        if (icon) {
            icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTheme);

// Case study navigation handling
function initCaseStudyNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const navContainer = document.querySelector('.nav-items');
    const indicator = document.querySelector('.nav-indicator');
    
    function moveIndicator(activeItem) {
        if (indicator && activeItem) {
            const itemRect = activeItem.getBoundingClientRect();
            const containerRect = navContainer.getBoundingClientRect();
            const itemCenter = itemRect.top + (itemRect.height / 2) - containerRect.top;
            const indicatorHeight = 14; // 14px
            const offsetTop = itemCenter - (indicatorHeight / 2);
            
            indicator.style.top = `${offsetTop}px`;
        }
    }
    
    // Make moveIndicator available globally
    window.moveIndicator = moveIndicator;
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Move the indicator to the active item
            moveIndicator(this);
            
            // If it's a hash link, let the default behavior handle scrolling
            if (this.getAttribute('href').startsWith('#')) {
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    smoothScrollToElement(targetElement);
                }
            }
        });
    });
    
    // Initialize indicator position on first active item
    const firstActive = document.querySelector('.nav-item.active');
    if (firstActive && indicator) {
        // Position indicator immediately
        moveIndicator(firstActive);
        
        // Also set up scroll-based indicator movement
        setupScrollIndicator();
    }
    
    function setupScrollIndicator() {
        const sections = document.querySelectorAll('.content-container[id]');
        
        function updateIndicatorOnScroll() {
            let currentSection = null;
            let currentDistance = Infinity;
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const distance = Math.abs(rect.top);
                
                if (rect.top <= 200 && distance < currentDistance) {
                    currentSection = section;
                    currentDistance = distance;
                }
            });
            
            if (currentSection) {
                const correspondingNavItem = document.querySelector(`a[href="#${currentSection.id}"]`);
                if (correspondingNavItem) {
                    // Remove active from all nav items
                    navItems.forEach(nav => nav.classList.remove('active'));
                    
                    // Add active to current section's nav item
                    correspondingNavItem.classList.add('active');
                    
                    // Move indicator
                    moveIndicator(correspondingNavItem);
                }
            }
        }
        
        // Listen for scroll events
        window.addEventListener('scroll', updateIndicatorOnScroll, { passive: true });
        
        // Initial check
        updateIndicatorOnScroll();
    }
}

// Initialize case study navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initCaseStudyNavigation);

// Main navigation indicator handling
function initMainNavigation() {
    const mainNavItems = document.querySelectorAll('.main-nav-item');
    const mainNavContainer = document.querySelector('.nav-links');
    const mainIndicator = document.querySelector('.main-nav-indicator');
    
    function moveMainIndicator(activeItem) {
        if (mainIndicator && activeItem) {
            const itemRect = activeItem.getBoundingClientRect();
            const containerRect = mainNavContainer.getBoundingClientRect();
            const itemCenter = itemRect.left + (itemRect.width / 2) - containerRect.left;
            const indicatorWidth = 16; // 16px
            const offsetLeft = itemCenter - (indicatorWidth / 2);
            
            mainIndicator.style.left = `${offsetLeft}px`;
        }
    }
    
    mainNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle external links (like resume) immediately without animation
            if (href.startsWith('http') || href.includes('drive.google.com')) {
                // Let the default behavior handle external links
                return;
            }
            
            e.preventDefault(); // Prevent immediate navigation for internal links
            
            // Allow navigation to other pages (like going back to homepage) after animation
            if (href.includes('../') || href.includes('index.html')) {
                // Do the animation first, then navigate
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
                return;
            }
            
            // Remove active and transitioning classes from all main nav items
            mainNavItems.forEach(nav => {
                nav.classList.remove('active', 'transitioning');
            });
            
            // Add transitioning class to clicked item
            this.classList.add('transitioning');
            
            // Move the indicator to the active item
            moveMainIndicator(this);
            
            // Navigate after the animation completes (300ms)
            setTimeout(() => {
                // Remove transitioning class and add active
                this.classList.remove('transitioning');
                this.classList.add('active');
                
                if (href === '#work') {
                    // Scroll to work section (no offset)
                    const workSection = document.getElementById('work');
                    if (workSection) {
                        workSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } else if (href === 'play/') {
                    window.location.href = 'play/';
                } else if (href === 'about/') {
                    window.location.href = 'about/';
                }
            }, 300);
        });
    });
    
    // Initialize indicator position on first active item
    const firstActive = document.querySelector('.main-nav-item.active');
    if (firstActive && mainIndicator) {
        moveMainIndicator(firstActive);
    }
    
}

// Function to go to home
function goToHome() {
    const homeSection = document.getElementById('home');
    smoothScrollToElement(homeSection);
}

// Initialize main navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', initMainNavigation);

// Add active class to navigation links based on scroll position and rotate logo
let lastScrollY = window.scrollY;
let rotation = 0;

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const logo = document.querySelector('.logo svg');
    
    // Handle logo rotation
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    
    if (logo) {
        // Rotate clockwise when scrolling down, counter-clockwise when scrolling up
        rotation += scrollDelta * 0.1; // Adjust multiplier for rotation speed
        logo.style.transform = `rotate(${rotation}deg)`;
        logo.style.transition = 'transform 0.1s ease-out';
    }
    
    lastScrollY = currentScrollY;
    
    // Handle navigation active states
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// View toggle functionality
function initViewToggle() {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const projects = document.getElementById('projects');
    
    if (gridView && listView && projects) {
        // Set default to grid view
        gridView.classList.add('active');
        
        gridView.addEventListener('click', () => {
            gridView.classList.add('active');
            listView.classList.remove('active');
            projects.classList.remove('list');
            projects.classList.add('grid');
        });
        
        listView.addEventListener('click', () => {
            listView.classList.add('active');
            gridView.classList.remove('active');
            projects.classList.remove('grid');
            projects.classList.add('list');
            // Reinitialize draggable labels for list view
            setTimeout(initDraggableLabels, 100);
        });
    }
}

// Draggable labels functionality - only for list view
function initDraggableLabels() {
    // Only initialize if we're in list view
    const projects = document.getElementById('projects');
    if (!projects || !projects.classList.contains('list')) {
        return;
    }

    const labels = document.querySelectorAll('.label');
    let droppedLabels = [];
    let returnTimeout = null;
    const WAIT_TIME = 2000;
    const ANIMATION_DURATION = 500;

    labels.forEach(label => {
        let offsetX, offsetY;
        let originalX, originalY;

        label.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            const rect = label.getBoundingClientRect();
            originalX = rect.left + window.scrollX;
            originalY = rect.top + window.scrollY;

            // Calculate offset from cursor to top-left of label
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            // Set up for dragging
            label.style.position = 'fixed';
            label.style.zIndex = 1000;
            label.style.left = (originalX - window.scrollX) + 'px';
            label.style.top = (originalY - window.scrollY) + 'px';
            label.classList.add('dragging');

            function moveLabel(e) {
                e.preventDefault();
                e.stopPropagation();
                // Use fixed positioning for stable movement
                label.style.left = (e.clientX - offsetX) + 'px';
                label.style.top = (e.clientY - offsetY) + 'px';
            }

            function dropLabel(e) {
                // Don't prevent default or stop propagation for mouseup
                document.removeEventListener('mousemove', moveLabel);
                document.removeEventListener('mouseup', dropLabel);
                
                label.classList.remove('dragging');

                droppedLabels.push({ element: label, x: originalX, y: originalY });

                if (returnTimeout) clearTimeout(returnTimeout);
                returnTimeout = setTimeout(() => {
                    droppedLabels.forEach(item => {
                        moveBack(item.element, item.x, item.y, ANIMATION_DURATION);
                    });
                    droppedLabels = [];
                    returnTimeout = null;
                }, WAIT_TIME);
            }

            document.addEventListener('mousemove', moveLabel, { passive: false });
            document.addEventListener('mouseup', dropLabel, { passive: false });
            
            // Hide labels when scrolling
            function hideOnScroll() {
                if (label.classList.contains('dragging')) {
                    label.style.display = 'none';
                }
            }
            
            // Show labels again when scroll stops
            let scrollTimeout;
            function showOnScrollStop() {
                if (label.classList.contains('dragging')) {
                    label.style.display = 'block';
                }
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (label.classList.contains('dragging')) {
                        label.style.display = 'block';
                    }
                }, 150);
            }
            
            window.addEventListener('scroll', hideOnScroll, { passive: true });
            window.addEventListener('scroll', showOnScrollStop, { passive: true });
        });

        // Completely prevent all click events
        label.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        });
    });

    function moveBack(element, targetX, targetY, duration) {
        const startX = parseFloat(element.style.left);
        const startY = parseFloat(element.style.top);
        const startTime = performance.now();

        // Convert target coordinates to fixed positioning
        const targetFixedX = targetX - window.scrollX;
        const targetFixedY = targetY - window.scrollY;

        function animate(time) {
            let progress = (time - startTime) / duration;
            if (progress > 1) progress = 1;

            element.style.left = startX + (targetFixedX - startX) * progress + 'px';
            element.style.top = startY + (targetFixedY - startY) * progress + 'px';

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Reset to original position
                element.style.position = '';
                element.style.left = '';
                element.style.top = '';
                element.style.zIndex = '';
                element.classList.remove('dragging');
            }
        }

        requestAnimationFrame(animate);
    }
}

// Initialize video looping for all project videos (called after loader)
function initVideoLooping() {
    const videos = document.querySelectorAll('.work-content video');
    
    videos.forEach(video => {
        // Ensure looping is enabled
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        
        // Handle video events for continuous playback
        video.addEventListener('ended', () => {
            video.currentTime = 0;
            video.play().catch(e => {
                console.log('Video replay failed:', e);
            });
        });
        
        video.addEventListener('error', (e) => {
            console.log('Video error:', e);
        });
    });
}

// Zocdoc Password Protection
let isZocdocUnlocked = false;
let currentZocdocSection = null;

function checkZocdocPassword(event) {
    event.preventDefault();
    const passwordInput = event.target.querySelector('.zocdoc-password-input');
    const password = passwordInput.value;
    const errorMessage = document.getElementById('zocdocErrorMessage');

    if (password === 'mollytea') {
        isZocdocUnlocked = true;
        
        // GSAP success animation
        if (typeof gsap !== 'undefined') {
            gsap.to('.zocdoc-password-section', {
                scale: 0.95,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    unlockZocdocSections();
                    hideZocdocPasswordPage();
                    passwordInput.value = '';
                    errorMessage.style.display = 'none';
                    
                    // Animate in the unlocked content
                    gsap.from('#custom-messaging', {
                        y: 50,
                        opacity: 0,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            });
        } else {
            unlockZocdocSections();
            hideZocdocPasswordPage();
            passwordInput.value = '';
            errorMessage.style.display = 'none';
        }
    } else {
        // GSAP error animation
        if (typeof gsap !== 'undefined') {
            gsap.to(passwordInput, {
                x: -10,
                duration: 0.1,
                yoyo: true,
                repeat: 3,
                ease: "power2.inOut"
            });
        }
        
        errorMessage.style.display = 'block';
        passwordInput.value = '';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
}

function unlockZocdocSections() {
    // Unlock the locked navigation items
    const modifyFlowItem = document.querySelector('a[href="#modify-flow"]');
    const customMessagingItem = document.querySelector('a[href="#custom-messaging"]');
    
    if (modifyFlowItem) {
        modifyFlowItem.classList.remove('locked');
    }
    if (customMessagingItem) {
        customMessagingItem.classList.remove('locked');
    }
    
    // Show the locked sections
    const modifyFlowSection = document.getElementById('modify-flow');
    const customMessagingSection = document.getElementById('custom-messaging');
    
    if (modifyFlowSection) {
        modifyFlowSection.classList.remove('locked');
    }
    
    // Move indicator to custom-messaging and make it active
    if (customMessagingItem) {
        // Remove active from introduction
        const introItem = document.querySelector('a[href="#zocdoc-introduction"]');
        if (introItem) {
            introItem.classList.remove('active');
            const introIndicator = introItem.querySelector('.nav-indicator');
            if (introIndicator) {
                introIndicator.remove();
            }
        }
        
        // Add active to custom-messaging
        customMessagingItem.classList.add('active');
        
        // Move indicator after a short delay to ensure DOM is updated
        setTimeout(() => {
            if (window.moveIndicator) {
                window.moveIndicator(customMessagingItem);
            }
            
            // Scroll to the custom-messaging section (down to reveal the content)
            const customMessagingSection = document.getElementById('custom-messaging');
            smoothScrollToElement(customMessagingSection);
        }, 100);
    }
    if (customMessagingSection) {
        customMessagingSection.classList.remove('locked');
    }
}

// showZocdocSection function removed - both sections are now always visible

function hideZocdocPasswordPage() {
    const passwordPage = document.getElementById('zocdocPasswordSection');
    if (passwordPage) {
        passwordPage.classList.add('hidden');
        // Also hide the wrapper container
        const wrapper = passwordPage.closest('.content-container.full-width');
        if (wrapper) {
            wrapper.classList.add('hidden');
        }
    }
}

function showZocdocPasswordPage() {
    const passwordPage = document.getElementById('zocdocPasswordSection');
    if (passwordPage) {
        passwordPage.classList.remove('hidden');
        // Also show the wrapper container
        const wrapper = passwordPage.closest('.content-container.full-width');
        if (wrapper) {
            wrapper.classList.remove('hidden');
        }
    }
}

function hideZocdocPages() {
    // Reset the unlocked state
    isZocdocUnlocked = false;
    currentZocdocSection = null;
}

// MyFreelance Password Protection
let isMyfreelanceUnlocked = false;

function checkMyfreelancePassword(event) {
    event.preventDefault();
    const passwordInput = event.target.querySelector('.zocdoc-password-input');
    const password = passwordInput.value;
    const errorMessage = document.getElementById('myfreelanceErrorMessage');

    if (password === 'mollytea') {
        isMyfreelanceUnlocked = true;
        
        // GSAP success animation
        if (typeof gsap !== 'undefined') {
            gsap.to('.zocdoc-password-container', {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: "power2.inOut",
                onComplete: () => {
                    hideMyfreelancePasswordPage();
                    showMyfreelanceContent();
                }
            });
        } else {
            showMyfreelanceContent();
        }
        
        // Clear the password input
        passwordInput.value = '';
        
        // Hide error message if it was showing
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    } else {
        if (errorMessage) {
            errorMessage.style.display = 'block';
        }
        
        // Clear the password input
        passwordInput.value = '';
        
        // Shake animation for wrong password
        if (typeof gsap !== 'undefined') {
            gsap.to('.zocdoc-password-container', {
                x: -10,
                duration: 0.1,
                yoyo: true,
                repeat: 5,
                ease: "power2.inOut"
            });
        }
    }
}

function hideMyfreelancePasswordPage() {
    const passwordPage = document.getElementById('myfreelancePasswordPage');
    if (passwordPage) {
        passwordPage.style.display = 'none';
    }
}

function showMyfreelancePasswordPage() {
    const passwordPage = document.getElementById('myfreelancePasswordPage');
    if (passwordPage) {
        passwordPage.style.display = 'block';
    }
}

function showMyfreelanceContent() {
    const content = document.getElementById('myfreelanceContent');
    if (content) {
        content.style.display = 'flex';
        
        // Force the nav to be fixed after showing content
        setTimeout(() => {
            const nav = content.querySelector('.case-study-nav');
            if (nav) {
                console.log('MyFreelance nav found, should be fixed by CSS');
                console.log('Nav computed styles:', {
                    position: window.getComputedStyle(nav).position,
                    width: window.getComputedStyle(nav).width,
                    height: window.getComputedStyle(nav).height,
                    left: window.getComputedStyle(nav).left,
                    top: window.getComputedStyle(nav).top
                });
            } else {
                console.log('MyFreelance nav not found!');
            }
        }, 100);
        
        // GSAP entrance animation
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(content, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
        }
    }
}

function hideMyfreelancePages() {
    // Reset the unlocked state
    isMyfreelanceUnlocked = false;
    
    // Hide content and show password page
    const content = document.getElementById('myfreelanceContent');
    const passwordPage = document.getElementById('myfreelancePasswordPage');
    
    if (content) {
        content.style.display = 'none';
    }
    
    if (passwordPage) {
        passwordPage.style.display = 'block';
    }
}

// Polaroid Drag and Drop Functionality - Lele Zhang inspired
function initPolaroidDragDrop() {
    const polaroids = document.querySelectorAll('.polaroid');

    polaroids.forEach((polaroid, index) => {
        let isDragging = false;
        let startX, startY, currentX, currentY;
        let animationFrame;

        // Set initial random position for each polaroid
        const container = polaroid.closest('.polaroid-container');
        const containerRect = container.getBoundingClientRect();
        
        // Random initial positions
        const randomX = Math.random() * (containerRect.width - 140);
        const randomY = Math.random() * (containerRect.height - 182.86);
        const randomRotation = (Math.random() - 0.5) * 30; // -15 to 15 degrees
        
        polaroid.style.position = 'absolute';
        polaroid.style.left = randomX + 'px';
        polaroid.style.top = randomY + 'px';
        polaroid.style.transform = `rotate(${randomRotation}deg)`;
        polaroid.style.cursor = 'grab';
        polaroid.style.transition = 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';

        // Smooth hover effect
        polaroid.addEventListener('mouseenter', () => {
            if (!isDragging) {
                polaroid.style.transform = `rotate(${randomRotation}deg) scale(1.02)`;
            }
        });

        polaroid.addEventListener('mouseleave', () => {
            if (!isDragging) {
                polaroid.style.transform = `rotate(${randomRotation}deg) scale(1)`;
            }
        });

        polaroid.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            // Get current position
            currentX = parseInt(polaroid.style.left) || 0;
            currentY = parseInt(polaroid.style.top) || 0;

            polaroid.style.zIndex = '1000';
            polaroid.style.cursor = 'grabbing';
            polaroid.style.transition = 'none'; // Disable transition during drag
            polaroid.style.transform = `rotate(${randomRotation}deg) scale(1.08)`;

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Cancel previous animation frame for smooth 60fps movement
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            animationFrame = requestAnimationFrame(() => {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                const newX = currentX + deltaX;
                const newY = currentY + deltaY;

                // Keep polaroids within the container bounds
                const containerRect = container.getBoundingClientRect();
                const maxX = containerRect.width - 140;
                const maxY = containerRect.height - 182.86;

                const constrainedX = Math.max(0, Math.min(newX, maxX));
                const constrainedY = Math.max(0, Math.min(newY, maxY));

                // Smooth positioning with slight easing
                polaroid.style.left = constrainedX + 'px';
                polaroid.style.top = constrainedY + 'px';
            });
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                polaroid.style.cursor = 'grab';
                polaroid.style.zIndex = '';
                polaroid.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                polaroid.style.transform = `rotate(${randomRotation}deg) scale(1)`;
                
                // Update current position for next drag
                currentX = parseInt(polaroid.style.left) || 0;
                currentY = parseInt(polaroid.style.top) || 0;
            }
        });

        // Touch events for mobile
        polaroid.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;

            currentX = parseInt(polaroid.style.left) || 0;
            currentY = parseInt(polaroid.style.top) || 0;

            polaroid.style.zIndex = '1000';
            polaroid.style.transition = 'none';
            polaroid.style.transform = `rotate(${randomRotation}deg) scale(1.08)`;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }

            animationFrame = requestAnimationFrame(() => {
                const touch = e.touches[0];
                const deltaX = touch.clientX - startX;
                const deltaY = touch.clientY - startY;

                const newX = currentX + deltaX;
                const newY = currentY + deltaY;

                const containerRect = container.getBoundingClientRect();
                const maxX = containerRect.width - 140;
                const maxY = containerRect.height - 182.86;

                const constrainedX = Math.max(0, Math.min(newX, maxX));
                const constrainedY = Math.max(0, Math.min(newY, maxY));

                polaroid.style.left = constrainedX + 'px';
                polaroid.style.top = constrainedY + 'px';
            });

            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                polaroid.style.zIndex = '';
                polaroid.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                polaroid.style.transform = `rotate(${randomRotation}deg) scale(1)`;
                
                currentX = parseInt(polaroid.style.left) || 0;
                currentY = parseInt(polaroid.style.top) || 0;
            }
        });
    });
}

// Organize Polaroids Functionality
function initPolaroidOrganize() {
    const organizeBtn = document.getElementById('organizePolaroids');
    const polaroids = document.querySelectorAll('.polaroid');
    const container = document.querySelector('.polaroid-container');
    let isOrganized = false;

    if (!organizeBtn || !container) return;

    organizeBtn.addEventListener('click', () => {
        if (!isOrganized) {
            // Organize polaroids in 2 rows of 5
            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width - 40; // Account for padding
            const containerHeight = containerRect.height - 40;
            
            // Calculate spacing for 2 rows of 5 layout
            const polaroidWidth = 160;
            const polaroidHeight = 190;
            const rows = 2;
            const cols = 5;
            const spacing = 40; // Much more spacing for clear text visibility
            
            // Calculate starting position to center the grid
            const totalWidth = cols * polaroidWidth + (cols - 1) * spacing;
            const totalHeight = rows * polaroidHeight + (rows - 1) * spacing;
            const startX = (containerWidth - totalWidth) / 2 ; // Move left by 40px
            const startY = (containerHeight - totalHeight) / 2 - 16; // Move up by 30px

            polaroids.forEach((polaroid, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                const x = startX + col * (polaroidWidth + spacing);
                const y = startY + row * (polaroidHeight + spacing);
                const rotation = 0; // No rotation for organized layout

                if (typeof gsap !== 'undefined') {
                    gsap.to(polaroid, {
                        left: x + 'px',
                        top: y + 'px',
                        rotation: rotation,
                        duration: 0.8,
                        ease: "power2.out",
                        delay: index * 0.1
                    });
                } else {
                    polaroid.style.left = x + 'px';
                    polaroid.style.top = y + 'px';
                    polaroid.style.transform = `rotate(${rotation}deg)`;
                }
            });

            organizeBtn.innerHTML = '<span class="material-icons-round">shuffle</span>Scatter';
            isOrganized = true;
        } else {
            // Scatter polaroids randomly
            const containerRect = container.getBoundingClientRect();
            const randomX = () => Math.random() * (containerRect.width - 160);
            const randomY = () => Math.random() * (containerRect.height - 190);
            const randomRotation = () => (Math.random() - 0.5) * 30;

            polaroids.forEach((polaroid, index) => {
                const x = randomX();
                const y = randomY();
                const rotation = randomRotation();

                if (typeof gsap !== 'undefined') {
                    gsap.to(polaroid, {
                        left: x + 'px',
                        top: y + 'px',
                        rotation: rotation,
                        duration: 0.6,
                        ease: "power2.out",
                        delay: index * 0.05
                    });
                } else {
                    polaroid.style.left = x + 'px';
                    polaroid.style.top = y + 'px';
                    polaroid.style.transform = `rotate(${rotation}deg)`;
                }
            });

            organizeBtn.innerHTML = '<span class="material-icons-round">view_module</span>Organize';
            isOrganized = false;
        }
    });
}

// Initialize polaroid drag and drop when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Page load animations removed - ready for custom implementation
});

// Initialize polaroid drag and drop when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Page load animations removed - ready for custom implementation
    
    initPolaroidDragDrop();
    initPolaroidOrganize();
});

// Project image interactions
function initProjectInteractions() {
    document.querySelectorAll('.project .image-container').forEach(container => {
        let isClicked = false;
        
        container.addEventListener('click', function(e) {
            // Skip if this is an external project
            const project = this.closest('.project');
            if (project.classList.contains('external-project')) {
                return; // Let the link handle navigation
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            // Check if this is the Zocdoc project
            const projectTitle = this.closest('.project').querySelector('h3');
            if (projectTitle && projectTitle.textContent.includes('Zocdoc')) {
                // Navigate to Zocdoc project page
                window.location.href = 'work/zocdoc/';
                return;
            }
            
            // Check if this is the MyFreelance project
            if (projectTitle && projectTitle.textContent.includes('MyFreelance')) {
                // Navigate to MyFreelance project page
                window.location.href = 'work/myfreelance/';
                return;
            }
            
            // Check if this is the Do Not Disturb project
            if (projectTitle && projectTitle.textContent.trim() === 'Focus Enhancements') {
                window.location.href = 'work/do-not-disturb/';
                return;
            }
            
            // Check if this is the Immuta Copilot project
            if (projectTitle && projectTitle.textContent.trim() === 'Immuta Copilot') {
                window.location.href = 'work/copilot/';
                return;
            }
            
            // Check if this is the Policies Overview project
            if (projectTitle && projectTitle.textContent.trim() === 'Policies Overview') {
                window.location.href = 'work/policies-overview/';
                return;
            }
            
            // Check if this is the CozyLink project
            if (projectTitle && projectTitle.textContent.includes('CozyLink')) {
                window.location.href = 'work/cozylink/';
                return;
            }
            
            // Check if this is the Zest project
            if (projectTitle && projectTitle.textContent.trim() === 'Zest Bulk Shipping') {
                window.location.href = 'work/zest/';
                return;
            }
            
            // Check if this is the Edelweiss project
            if (projectTitle && projectTitle.textContent.trim() === 'Website Redesign') {
                window.location.href = 'work/edelweiss/';
                return;
            }
            
            isClicked = !isClicked;
            this.classList.toggle('clicked');
            console.log('Image clicked, isClicked:', isClicked);
        });
        
        // Add smooth cursor following functionality
        let animationId;
        container.addEventListener('mousemove', function(e) {
            const circle = this.querySelector('.view-circle');
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Cancel previous animation for smooth movement
            if (animationId) cancelAnimationFrame(animationId);
            
            animationId = requestAnimationFrame(() => {
                circle.style.left = x - 36 + 'px'; // 36 = half of 72px circle width
                circle.style.top = y - 36 + 'px';
            });
        });
        
        // Show circle on mouseenter with growing animation
        container.addEventListener('mouseenter', function() {
            const circle = this.querySelector('.view-circle');
            circle.style.opacity = '1';
            circle.style.transform = 'scale(1)'; // Grow from 0 to 1
            this.style.cursor = 'none'; // Hide default cursor
        });
        
        // Show circle on mousedown (press) as well and trigger selected state
        container.addEventListener('mousedown', function() {
            const circle = this.querySelector('.view-circle');
            circle.style.opacity = '1';
            circle.style.transform = 'scale(1)'; // Grow from 0 to 1
            this.style.cursor = 'none'; // Hide default cursor
            
            // Trigger selected state immediately on press
            isClicked = true;
            this.classList.add('clicked');
        });
        
        // Hide circle on mouseleave
        container.addEventListener('mouseleave', function() {
            const circle = this.querySelector('.view-circle');
            circle.style.opacity = '0';
            circle.style.transform = 'scale(0)'; // Shrink back to 0
            this.style.cursor = 'pointer'; // Restore default cursor
            isClicked = false; // Reset clicked state
            this.classList.remove('clicked');
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully!');
    
    // Initialize carousel with musinsa.png and its gradient
    const carouselImg = document.getElementById('carousel-img');
    const heroSection = document.querySelector('.hero');
    
    if (carouselImg) {
        carouselImg.src = carouselImages[0].src; // musinsa.png
    }
    
    if (heroSection) {
        heroSection.classList.add(carouselImages[0].gradient); // musinsa gradient
    }
    
    // Initialize all functionality
    initViewToggle();
    initDraggableLabels();
    initVideoLooping();
    initProjectInteractions();
    initSpeechBubbleAnimation();
    
});

// Speech bubble animation for about page
function initSpeechBubbleAnimation() {
    const speechBubble = document.getElementById('speechBubble');
    
    if (!speechBubble) return;
    
    const messages = [
        "Thanks for stopping by ദ്ദി ˉ͈̀꒳ˉ͈́ )✧",
        "Lovely meeting you ٩(^ᗜ^ )و ´-"
    ];
    
    let messageIndex = 0;
    
    // Show the speech bubble and content immediately
    speechBubble.classList.add('show');
    const speechBubbleContent = document.getElementById('speechBubbleContent');
    if (speechBubbleContent) {
        speechBubbleContent.classList.add('show');
    }
    
    function showMessage() {
        const speechBubbleContent = document.getElementById('speechBubbleContent');
        
        // Replace content with message text
        if (speechBubbleContent) {
            speechBubbleContent.innerHTML = `<span class="message-text">${messages[messageIndex]}</span>`;
            speechBubbleContent.classList.add('show');
        }
        
        // Show message for 5 seconds, then start fading back to typing
        setTimeout(() => {
            // Start fading out the content
            if (speechBubbleContent) {
                speechBubbleContent.classList.remove('show');
            }
            
            // Wait for content fade out, then show typing indicator
            setTimeout(() => {
                // Go back to typing indicator
                if (speechBubbleContent) {
                    speechBubbleContent.innerHTML = `
                        <div class="typing-dots">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </div>
                    `;
                    speechBubbleContent.classList.add('show');
                }
                
                // Move to next message
                messageIndex = (messageIndex + 1) % messages.length;
                
                // Different typing durations based on message
                let typingDuration;
                if (messageIndex === 0) {
                    // "Thanks for stopping by!" -> typing -> "Lovely meeting you!" (longer typing)
                    typingDuration = 5000;
                } else {
                    // "Lovely meeting you!" -> typing -> "Thanks for stopping by!" (shorter typing)
                    typingDuration = 2000;
                }
                
                // Show next message after delay
                setTimeout(() => {
                    showMessage();
                }, typingDuration);
            }, 300); // Wait for content fade out
        }, 2000); // Show message for 2 seconds
    }
    
    // Start showing messages after initial delay
    setTimeout(showMessage, 2000);
}
