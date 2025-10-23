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
        
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }
        
        // Remove loading screen from DOM after animation
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 1000);
    }
    
    // Function to check if all assets are loaded
    function checkAllAssetsLoaded() {
        loadedAssets++;
        
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
        }
        
        // Setup urgent message video with pause
        setupUrgentMessageVideo();
        
        // Fallback timeout - force hide after 8 seconds
        setTimeout(() => {
            if (!allAssetsLoaded) {
                hideLoadingScreen();
            }
        }, 8000);
    }
    
    // Start waiting for all assets
    waitForAllAssets();
});

// Carousel functionality removed

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
    const homepageFooter = document.querySelector('.footer');
    
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
    if (homepageFooter && document.body.classList.contains('homepage')) {
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
    // Try to find footer copy button first, then fallback to homepage
    const copyButton = document.querySelector('.footer-copy-button') || document.querySelector('.copy-button');
    const copyIcon = document.querySelector('.footer-copy-icon') || document.querySelector('.copy-icon');
    
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
    
    // Update highlight colors for about page
    if (body.classList.contains('about-page')) {
        addCustomHighlightColors();
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
    console.log('Setting up video looping...');
    console.log('Page type:', document.body.className);
    const workContentVideos = document.querySelectorAll('.work-content video');
    const caseStudyVideos = document.querySelectorAll('.case-study-content video');
    console.log('Work content videos:', workContentVideos.length);
    console.log('Case study videos:', caseStudyVideos.length);
    const videos = document.querySelectorAll('.work-content video, .case-study-content video');
    console.log('Total videos found:', videos.length);
    
    videos.forEach(video => {
        // Ensure looping is enabled
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        
        // Check if this video needs a pause before looping
        const sourceElement = video.querySelector('source');
        const videoSrc = sourceElement ? sourceElement.src : video.src;
        const needsPause = video.classList.contains('solution-video') || 
                          videoSrc.includes('copilot/cover.mp4') ||
                          videoSrc.includes('cozylink/cover.mp4') ||
                          videoSrc.includes('policies-overview/cover.mp4');
        
        console.log('Video src:', videoSrc, 'has solution-video class:', video.classList.contains('solution-video'), 'needsPause:', needsPause);
        
        if (needsPause) {
            // Disable native loop and handle manually with pause
            video.loop = false;
            console.log('Setting up pause for video:', videoSrc);
            video.addEventListener('ended', () => {
                console.log('Video ended, starting 5-second pause');
                video.pause();
                setTimeout(() => {
                    console.log('Resuming video after pause');
                    video.currentTime = 0;
                    video.play().catch(e => {
                        console.log('Video play error:', e);
                    });
                }, 1200); // 1.2 second pause
            });
        } else {
            // Keep native loop for other videos
            video.loop = true;
        }
        
        video.addEventListener('error', (e) => {
            console.log('Video error:', e);
        });
    });
}

// Initialize video looping for homepage cover videos
function initHomepageVideoLooping() {
    // Only run on homepage
    if (!document.body.classList.contains('homepage')) {
        console.log('Not homepage, skipping homepage video setup');
        return;
    }
    
    console.log('Setting up homepage videos...');
    const videos = document.querySelectorAll('.work-content video');
    console.log('Found videos:', videos.length);
    
    videos.forEach(video => {
        // Check if this is a cover video that needs pause
        const sourceElement = video.querySelector('source');
        const videoSrc = sourceElement ? sourceElement.src : video.src;
        const isCoverVideo = videoSrc.includes('copilot/cover.mp4') ||
                           videoSrc.includes('cozylink/cover.mp4') ||
                           videoSrc.includes('policies-overview/cover.mp4');
        
        console.log('Video src:', videoSrc, 'isCoverVideo:', isCoverVideo);
        
        if (isCoverVideo) {
            // Disable native loop and handle manually with pause
            video.loop = false;
            console.log('Setting up pause for homepage video:', videoSrc);
            video.addEventListener('ended', () => {
                console.log('Homepage video ended, starting 5-second pause');
                video.pause();
                setTimeout(() => {
                    console.log('Resuming homepage video after pause');
                    video.currentTime = 0;
                    video.play().catch(e => {
                        console.log('Homepage video play error:', e);
                    });
                }, 1200); // 1.2 second pause
            });
        } else {
            // Keep native loop for other videos
            video.loop = true;
        }
    });
}


// Zocdoc Password Protection - Server-side authentication
let isZocdocUnlocked = false;
let currentZocdocSection = null;

function checkZocdocPassword(event) {
    event.preventDefault();
    const passwordInput = event.target.querySelector('.password-input');
    const password = passwordInput.value;
    const errorMessage = document.getElementById('zocdocErrorMessage');

    if (password === 'mollytea') {
        // Store authentication token
        window.portfolioAuth.login(password).then(() => {
            // GSAP success animation
            if (typeof gsap !== 'undefined') {
                gsap.to('.zocdoc-password-container', {
                    scale: 0.95,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        // Navigate to secure page
                        window.location.href = 'secure.html';
                    }
                });
            } else {
                // Navigate to secure page
                window.location.href = 'secure.html';
            }
        });
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
        
        passwordInput.value = '';
    }
}

function showZocdocError(errorMessage) {
    if (errorMessage) {
        errorMessage.textContent = 'Incorrect password. Please try again.';
        errorMessage.style.display = 'block';
    }
}

// Zocdoc functions removed - now using separate secure page approach

// MyFreelance Password Protection
function checkMyfreelancePassword(event) {
    event.preventDefault();
    const passwordInput = event.target.querySelector('.password-input');
    const password = passwordInput.value;
    const errorMessage = document.getElementById('myfreelanceErrorMessage');

    if (password === 'mollytea') {
        // Store authentication token
        window.portfolioAuth.login(password).then(() => {
            // GSAP success animation
            if (typeof gsap !== 'undefined') {
                gsap.to('.myfreelance-password-container', {
                    scale: 0.95,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        // Navigate to secure page
                        window.location.href = 'secure.html';
                    }
                });
            } else {
                // Navigate to secure page
                window.location.href = 'secure.html';
            }
        });
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
        
        showMyfreelanceError(errorMessage);
        passwordInput.value = '';
    }
}

function showMyfreelanceError(errorMessage) {
    if (errorMessage) {
        errorMessage.textContent = 'Incorrect password. Please try again.';
        errorMessage.style.display = 'block';
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

// Custom highlight colors function removed

// Real-time Clock Functionality for TIME pill
function initRealTimeClock() {
    const timePillElement = document.getElementById('time-pill');
    
    if (!timePillElement) return;
    
    function updateTime() {
        const now = new Date();
        // Convert to PST (UTC-8) or PDT (UTC-7) - JavaScript handles DST automatically
        const pstTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
        
        const hours = pstTime.getHours().toString().padStart(2, '0');
        const minutes = pstTime.getMinutes().toString().padStart(2, '0');
        const seconds = pstTime.getSeconds().toString().padStart(2, '0');
        
        timePillElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Update immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);
}

// Draggable Pills Functionality for Hero Section with Placeholder System
function initDraggablePills() {
    const pills = document.querySelectorAll('.hero .pill');
    const paragraph = document.querySelector('.hero .container .hero-text p');
    
    // Store original positions and text content
    const pillData = new Map();
    const pillStates = new Map(); // Track if each pill has moved
    
    pills.forEach(pill => {
        const rect = pill.getBoundingClientRect();
        pillData.set(pill, {
            originalX: rect.left + window.scrollX,
            originalY: rect.top + window.scrollY,
            originalText: pill.textContent.trim(),
            originalRect: {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            },
            originalParent: pill.parentNode,
            originalNextSibling: pill.nextSibling,
            autoReturnTimer: null
        });
        pillStates.set(pill, { hasMoved: false });
        
        // Don't create placeholders from the start - pills should be in normal positions
    });
    
    function createPlaceholder(originalPill) {
        const placeholder = document.createElement('span');
        placeholder.className = 'pill placeholder';
        
        // Copy all the original pill's content but make pulse dot stagnant
        placeholder.innerHTML = originalPill.innerHTML;
        
        // Find and fix the pulse dot in the placeholder
        const pulseDot = placeholder.querySelector('.pulse-dot');
        if (pulseDot) {
            pulseDot.style.animation = 'none';
            pulseDot.style.backgroundColor = 'var(--text-muted)';
        }
        
        // Copy all the original pill's computed styles to match exactly
        const computedStyle = window.getComputedStyle(originalPill);
        placeholder.style.background = 'var(--bg-secondary)';
        placeholder.style.border = '1px dashed var(--text-muted)';
        placeholder.style.color = 'var(--text-muted)';
        // placeholder.style.opacity = '0.6';
        placeholder.style.pointerEvents = 'none';
        
        // Copy all the pill's styling properties to match exactly
        placeholder.style.borderRadius = computedStyle.borderRadius;
        placeholder.style.padding = computedStyle.padding;
        placeholder.style.fontSize = computedStyle.fontSize;
        placeholder.style.fontFamily = computedStyle.fontFamily;
        placeholder.style.fontWeight = computedStyle.fontWeight;
        placeholder.style.lineHeight = computedStyle.lineHeight;
        placeholder.style.display = computedStyle.display;
        placeholder.style.alignItems = computedStyle.alignItems;
        placeholder.style.gap = computedStyle.gap;
        placeholder.style.justifyContent = computedStyle.justifyContent;
        placeholder.style.margin = computedStyle.margin;
        placeholder.style.verticalAlign = computedStyle.verticalAlign;
        
        // Insert placeholder before the original pill in the text flow
        originalPill.parentNode.insertBefore(placeholder, originalPill);
        
        console.log('Created placeholder for:', originalPill.textContent);
        
        return placeholder;
    }
    
    function removePlaceholder(placeholder) {
        if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
    }
    
    function startAutoReturn(pill) {
        const data = pillData.get(pill);
        if (data.autoReturnTimer) {
            clearTimeout(data.autoReturnTimer);
        }
        
        data.autoReturnTimer = setTimeout(() => {
            // Find the placeholder and get its exact current position
            const placeholder = document.querySelector('.pill.placeholder');
            if (placeholder) {
                const placeholderRect = placeholder.getBoundingClientRect();
                
                // Animate pill directly on top of the placeholder
                pill.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                pill.style.left = placeholderRect.left + 'px';
                pill.style.top = placeholderRect.top + 'px';
                
                // After animation, replace placeholder with pill
                setTimeout(() => {
                    placeholder.parentNode.replaceChild(pill, placeholder);
                    pill.style.position = '';
                    pill.style.transition = '';
                    pill.style.left = '';
                    pill.style.top = '';
                    pill.style.zIndex = '';
                    pill.style.transform = '';
                }, 300);
            }
            
            // Reset pill state
            const state = pillStates.get(pill);
            state.hasMoved = false;
        }, 3000); // Auto-return after 3 seconds
    }
    
    function updatePlaceholders() {
        console.log('Updating placeholders...');
        // Remove all existing placeholders
        document.querySelectorAll('.pill.placeholder').forEach(removePlaceholder);
        
        // Create placeholders for pills that have moved
        pills.forEach(pill => {
            const state = pillStates.get(pill);
            console.log('Pill:', pill.textContent, 'hasMoved:', state.hasMoved);
            if (state.hasMoved) {
                createPlaceholder(pill);
            }
        });
    }
    
    pills.forEach(pill => {
        let isDragging = false;
        let hasMoved = false;
        let startX, startY, currentX, currentY;
        let originalX, originalY;
        let animationFrame;

        // All pills are now regular pills - no external link handling needed

        pill.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            
            // Clear any existing auto-return timer
            const data = pillData.get(pill);
            if (data.autoReturnTimer) {
                clearTimeout(data.autoReturnTimer);
                data.autoReturnTimer = null;
            }
            
            // console.log('Mouse down on pill:', pill.textContent);
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            
            // Get current position (where the pill actually is now)
            const rect = pill.getBoundingClientRect();
            currentX = rect.left;
            currentY = rect.top;
            
            // Store the current position as the new "original" for this drag session
            originalX = rect.left + window.scrollX;
            originalY = rect.top + window.scrollY;
            
            // Set up for dragging - use fixed positioning to avoid transform issues
            pill.style.position = 'fixed';
            pill.style.zIndex = '1000';
            pill.style.cursor = 'grabbing';
            pill.style.transition = 'none';
            pill.style.left = rect.left + 'px';
            pill.style.top = rect.top + 'px';
            pill.style.transform = 'none';
            
            function movePill(e) {
                if (!isDragging) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                // Check if we've moved enough to consider it a drag
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (distance > 1 && !hasMoved) {
                    hasMoved = true;
                    // Update the pill state
                    const state = pillStates.get(pill);
                    state.hasMoved = true;
                    console.log('Pill moved, creating placeholder for:', pill.textContent);
                }
                
                // Cancel previous animation frame for smooth movement
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                
                animationFrame = requestAnimationFrame(() => {
                    const newX = rect.left + (e.clientX - startX);
                    const newY = rect.top + (e.clientY - startY);
                    
                    // Move the pill using fixed positioning
                    pill.style.left = newX + 'px';
                    pill.style.top = newY + 'px';
                    
                    // Create placeholder when dragging starts
                    if (hasMoved && !pill.previousElementSibling?.classList.contains('placeholder')) {
                        createPlaceholder(pill);
                    }
                });
            }
            
            function dropPill(e) {
                if (!isDragging) return;
                
                isDragging = false;
                pill.style.cursor = 'grab';
                pill.style.zIndex = '';
                
                // Check if pill is close to its original position (snap zone)
                const data = pillData.get(pill);
                const currentRect = pill.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(currentRect.left + window.scrollX - data.originalX, 2) + 
                    Math.pow(currentRect.top + window.scrollY - data.originalY, 2)
                );
                
                if (distance < 50 && hasMoved) {
                    // Close to original position AND we actually dragged - snap back to placeholder position
                    const data = pillData.get(pill);
                    
                    // Find the placeholder and get its exact current position
                    const placeholder = document.querySelector('.pill.placeholder');
                    if (placeholder) {
                        const placeholderRect = placeholder.getBoundingClientRect();
                        
                        // Animate pill directly on top of the placeholder
                        pill.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        pill.style.left = placeholderRect.left + 'px';
                        pill.style.top = placeholderRect.top + 'px';
                        
                        // After animation, replace placeholder with pill
                        setTimeout(() => {
                            placeholder.parentNode.replaceChild(pill, placeholder);
                            pill.style.position = '';
                            pill.style.transition = '';
                            pill.style.left = '';
                            pill.style.top = '';
                            pill.style.zIndex = '';
                            pill.style.transform = '';
                        }, 300);
                    }
                    
                    // Reset pill state
                    const state = pillStates.get(pill);
                    state.hasMoved = false;
                    hasMoved = false;
                } else {
                    // Far from original position OR just clicked without dragging - stay where dropped
                    pill.style.transition = 'left 0.2s ease, top 0.2s ease';
                    
                    // Only start auto-return timer if we actually dragged (not just clicked)
                    if (hasMoved) {
                        startAutoReturn(pill);
                    }
                }
                
                document.removeEventListener('mousemove', movePill);
                document.removeEventListener('mouseup', dropPill);
            }
            
            document.addEventListener('mousemove', movePill, { passive: false });
            document.addEventListener('mouseup', dropPill, { passive: false });
        });
        
        // Touch events for mobile
        pill.addEventListener('touchstart', e => {
            e.preventDefault();
            e.stopPropagation();
            
            // Clear any existing auto-return timer
            const data = pillData.get(pill);
            if (data.autoReturnTimer) {
                clearTimeout(data.autoReturnTimer);
                data.autoReturnTimer = null;
            }
            
            isDragging = true;
            hasMoved = false;
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = pill.getBoundingClientRect();
            currentX = rect.left;
            currentY = rect.top;
            
            // Store the current position as the new "original" for this drag session
            originalX = rect.left + window.scrollX;
            originalY = rect.top + window.scrollY;
            
            pill.style.position = 'fixed';
            pill.style.zIndex = '1000';
            pill.style.cursor = 'grabbing';
            pill.style.transition = 'none';
            pill.style.left = rect.left + 'px';
            pill.style.top = rect.top + 'px';
            pill.style.transform = 'none';
            
            function movePillTouch(e) {
                if (!isDragging) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const touch = e.touches[0];
                const deltaX = touch.clientX - startX;
                const deltaY = touch.clientY - startY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                if (distance > 1) {
                    hasMoved = true;
                    // Update the pill state
                    const state = pillStates.get(pill);
                    state.hasMoved = true;
                }
                
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                
                animationFrame = requestAnimationFrame(() => {
                    const newX = rect.left + (touch.clientX - startX);
                    const newY = rect.top + (touch.clientY - startY);
                    
                    // Move the pill using fixed positioning
                    pill.style.left = newX + 'px';
                    pill.style.top = newY + 'px';
                    
                    // Create placeholder when dragging starts
                    if (hasMoved && !pill.previousElementSibling?.classList.contains('placeholder')) {
                        createPlaceholder(pill);
                    }
                });
            }
            
            function dropPillTouch(e) {
                if (!isDragging) return;
                
                isDragging = false;
                pill.style.cursor = 'grab';
                pill.style.zIndex = '';
                
                // Check if pill is close to its original position (snap zone)
                const data = pillData.get(pill);
                const currentRect = pill.getBoundingClientRect();
                const distance = Math.sqrt(
                    Math.pow(currentRect.left + window.scrollX - data.originalX, 2) + 
                    Math.pow(currentRect.top + window.scrollY - data.originalY, 2)
                );
                
                if (distance < 50 && hasMoved) {
                    // Close to original position AND we actually dragged - snap back to placeholder position
                    const data = pillData.get(pill);
                    
                    // Find the placeholder and get its exact current position
                    const placeholder = document.querySelector('.pill.placeholder');
                    if (placeholder) {
                        const placeholderRect = placeholder.getBoundingClientRect();
                        
                        // Animate pill directly on top of the placeholder
                        pill.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                        pill.style.left = placeholderRect.left + 'px';
                        pill.style.top = placeholderRect.top + 'px';
                        
                        // After animation, replace placeholder with pill
                        setTimeout(() => {
                            placeholder.parentNode.replaceChild(pill, placeholder);
                            pill.style.position = '';
                            pill.style.transition = '';
                            pill.style.left = '';
                            pill.style.top = '';
                            pill.style.zIndex = '';
                            pill.style.transform = '';
                        }, 300);
                    }
                    
                    // Reset pill state
                    const state = pillStates.get(pill);
                    state.hasMoved = false;
                    hasMoved = false;
                } else {
                    // Far from original position OR just clicked without dragging - stay where dropped
                    pill.style.transition = 'left 0.2s ease, top 0.2s ease';
                    
                    // Only start auto-return timer if we actually dragged (not just clicked)
                    if (hasMoved) {
                        startAutoReturn(pill);
                    }
                }
                
                document.removeEventListener('touchmove', movePillTouch);
                document.removeEventListener('touchend', dropPillTouch);
            }
            
            document.addEventListener('touchmove', movePillTouch, { passive: false });
            document.addEventListener('touchend', dropPillTouch, { passive: false });
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    
    // Check authentication for password-protected pages
    await checkPageAuthentication();
    
    // Carousel logic removed - no longer needed
    
    // Initialize all functionality
    initViewToggle();
    initDraggableLabels();
    initDraggablePills();
    initRealTimeClock();
    initVideoLooping();
    initHomepageVideoLooping();
    initProjectInteractions();
    initSpeechBubbleAnimation();
    
    // About page highlight colors removed
    
});

// Check if current page requires authentication
async function checkPageAuthentication() {
    // Only run authentication check on pages that actually need it
    // Skip MyFreelance password page - let it handle its own authentication
    const isMyfreelancePasswordPage = document.querySelector('.myfreelance-password-page');
    if (isMyfreelancePasswordPage) {
        return; // Don't interfere with MyFreelance password page
    }
    
    // Check if we're on a password-protected page
    const isPasswordProtected = document.querySelector('.myfreelance-password-container');
    
    if (!isPasswordProtected) return;
    
    // Check if user is already authenticated
    const isAuthenticated = await window.portfolioAuth.verifyAuth();
    
    if (isAuthenticated) {
        // User is authenticated, show content directly
        if (document.querySelector('.myfreelance-password-container')) {
            hideMyfreelancePasswordPage();
            showMyfreelanceContent();
        }
    }
}

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