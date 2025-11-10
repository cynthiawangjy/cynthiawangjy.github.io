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
// function toggleTheme() {
//     const body = document.body;
//     const currentTheme = body.getAttribute('data-theme');
//     const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
//     
//     body.setAttribute('data-theme', newTheme);
//     localStorage.setItem('theme', newTheme);
//     
//     // Update toggle button icon
//     const toggleButtons = document.querySelectorAll('.theme-toggle .theme-icon');
//     toggleButtons.forEach(icon => {
//         icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
//     });
//     
//     // Update highlight colors for about page
//     if (body.classList.contains('about-page')) {
//         addCustomHighlightColors();
//     }
// }

// Initialize theme on page load
// function initializeTheme() {
//     const savedTheme = localStorage.getItem('theme') || 'light';
//     document.body.setAttribute('data-theme', savedTheme);
//     
//     // Update toggle button icons
//     const toggleIcons = document.querySelectorAll('.theme-toggle .theme-icon');
//     toggleIcons.forEach(icon => {
//         icon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
//     });
// }

// Initialize theme when DOM is loaded
// document.addEventListener('DOMContentLoaded', initializeTheme);

// Force light mode (disable dark mode)
document.addEventListener('DOMContentLoaded', function() {
    document.body.removeAttribute('data-theme');
    // Optionally clear saved theme preference
    // localStorage.removeItem('theme');
});

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
    
    // Determine which nav item should be active based on current page
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        
        // Remove active class from all items
        mainNavItems.forEach(item => item.classList.remove('active'));
        
        // Determine active item based on current path
        let activeItem = null;
        
        if (currentPath.includes('/play/')) {
            // On play pages, make Play active
            activeItem = document.querySelector('.main-nav-item[href="../"], .main-nav-item[href="play/"]');
        } else if (currentPath.includes('/about/')) {
            // On about page, make About active
            activeItem = document.querySelector('.main-nav-item[href="../../about/"], .main-nav-item[href="../about/"], .main-nav-item[href="about/"]');
        } else if (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '' || currentPath.endsWith('.github.io/')) {
            // On homepage, make Work active
            activeItem = document.querySelector('.main-nav-item[href="../../"], .main-nav-item[href="../"], .main-nav-item[href="/"]');
        }
        
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    
    // Don't override active classes - let HTML handle it
    
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
            
            // Only handle smooth indicator animation for same-page navigation (#work on homepage)
            if (href === '#work') {
                e.preventDefault(); // Only prevent default for same-page navigation
            
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
                
                    // Scroll to work section (no offset)
                    const workSection = document.getElementById('work');
                    if (workSection) {
                        workSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
            }
            // For all other navigation (to other pages), let default browser behavior handle it
            // No e.preventDefault() means it navigates immediately without any animation
        });
    });
    
    // Initialize indicator position on the active item
    const activeItem = document.querySelector('.main-nav-item.active');
    if (activeItem && mainIndicator) {
        moveMainIndicator(activeItem);
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
            if (projectTitle && projectTitle.textContent.trim() === 'iOS Focus Enhancements') {
                window.location.href = 'work/do-not-disturb/';
                return;
            }
            
            
            // Check if this is the Policies Overview project
            if (projectTitle && projectTitle.textContent.trim() === 'Immuta — Policies Overview') {
                window.location.href = 'work/policies-overview/';
                return;
            }
            
            // Check if this is the CozyLink project
            if (projectTitle && projectTitle.textContent.includes('CozyLink')) {
                window.location.href = 'work/cozylink/';
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
        
        const timeText = `${hours}:${minutes}:${seconds}`;
        
        // Update the main pill
        timePillElement.textContent = timeText;
        
        // Find the specific placeholder for the time pill by looking for the one that comes right before it
        const allPlaceholders = document.querySelectorAll('.pill.placeholder');
        allPlaceholders.forEach(placeholder => {
            // Check if this placeholder is the one for the time pill by looking at its position
            const nextSibling = placeholder.nextElementSibling;
            if (nextSibling && nextSibling.id === 'time-pill') {
                placeholder.textContent = timeText;
            }
        });
    }
    
    // Update immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);
}

// Draggable Pills Functionality for Hero Section with Placeholder System
function initDraggablePills() {
  const pills = document.querySelectorAll('.hero .pill');
  const pillData = new Map();
  let autoReturnTimer = null;

  // Helper function to calculate position relative to parent container
  function getRelativePosition(element) {
    const elementRect = element.getBoundingClientRect();
    const parentRect = element.parentNode.getBoundingClientRect();
    return {
      left: elementRect.left - parentRect.left,
      top: elementRect.top - parentRect.top
    };
  }

  // Create draggable clones for each pill
  pills.forEach(originalPill => {
    // Create placeholder (muted)
    const placeholder = originalPill.cloneNode(true);
    placeholder.classList.add('placeholder');
    // Remove any ID from placeholder to avoid conflicts
    placeholder.removeAttribute('id');
    
    // Ensure placeholder has the same dimensions as the original pill
    const originalRect = originalPill.getBoundingClientRect();
    placeholder.style.width = originalRect.width + 'px';
    placeholder.style.height = originalRect.height + 'px';
    placeholder.style.minWidth = originalRect.width + 'px';
    placeholder.style.minHeight = originalRect.height + 'px';
    
    // Special handling for time pill to ensure it maintains fixed width
    if (originalPill.id === 'time-pill') {
      placeholder.style.width = '77px';
      placeholder.style.minWidth = '77px';
      placeholder.style.display = 'inline-flex';
      placeholder.style.justifyContent = 'center';
      placeholder.style.alignItems = 'center';
    }

    // Insert placeholder behind original
    originalPill.parentNode.insertBefore(placeholder, originalPill);

    // Style original pill to be draggable and appear on top
    originalPill.style.position = 'absolute';
    originalPill.style.margin = '0';
    originalPill.style.zIndex = '1000';
    
    // Position the pill exactly on top of its placeholder
    const pos = getRelativePosition(placeholder);
    originalPill.style.left = pos.left + 'px';
    originalPill.style.top = pos.top + 'px';

    pillData.set(originalPill, { placeholder });

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let lastDistance = Infinity;
    let isMovingTowardsPlaceholder = false;

    function startDrag(x, y, preCalculatedOffsetX, preCalculatedOffsetY) {
      isDragging = true;
      
      // Disable CSS transitions during drag to prevent interference
      originalPill.style.transition = 'none';
      
      // Use the pre-calculated offset
      offsetX = preCalculatedOffsetX;
      offsetY = preCalculatedOffsetY;

      // Initialize distance tracking
      const pillRect = originalPill.getBoundingClientRect();
      const placeholderRect = pillData.get(originalPill).placeholder.getBoundingClientRect();
      const pillCenterX = pillRect.left + pillRect.width / 2;
      const pillCenterY = pillRect.top + pillRect.height / 2;
      const placeholderCenterX = placeholderRect.left + placeholderRect.width / 2;
      const placeholderCenterY = placeholderRect.top + placeholderRect.height / 2;
      
      lastDistance = Math.sqrt(
        Math.pow(pillCenterX - placeholderCenterX, 2) + 
        Math.pow(pillCenterY - placeholderCenterY, 2)
      );
      isMovingTowardsPlaceholder = false;

      // Cancel any pending auto-return
      if (autoReturnTimer) {
        clearTimeout(autoReturnTimer);
        autoReturnTimer = null;
      }

      originalPill.style.cursor = 'grabbing';
    }

    function moveDrag(x, y) {
      if (!isDragging) return;
      // Convert viewport coordinates to parent-relative coordinates
      const parentRect = originalPill.parentNode.getBoundingClientRect();
      originalPill.style.left = (x - parentRect.left - offsetX) + 'px';
      originalPill.style.top = (y - parentRect.top - offsetY) + 'px';
      
      // Track movement direction towards placeholder
      const pillRect = originalPill.getBoundingClientRect();
      const placeholderRect = pillData.get(originalPill).placeholder.getBoundingClientRect();
      const pillCenterX = pillRect.left + pillRect.width / 2;
      const pillCenterY = pillRect.top + pillRect.height / 2;
      const placeholderCenterX = placeholderRect.left + placeholderRect.width / 2;
      const placeholderCenterY = placeholderRect.top + placeholderRect.height / 2;
      
      const currentDistance = Math.sqrt(
        Math.pow(pillCenterX - placeholderCenterX, 2) + 
        Math.pow(pillCenterY - placeholderCenterY, 2)
      );
      
      // Check if we're moving towards the placeholder
      if (currentDistance < lastDistance) {
        isMovingTowardsPlaceholder = true;
      } else if (currentDistance > lastDistance + 5) { // Add small threshold to prevent flickering
        isMovingTowardsPlaceholder = false;
      }
      
      lastDistance = currentDistance;
    }

    function dropDrag() {
      if (!isDragging) return;
      isDragging = false;
      originalPill.style.cursor = 'grab';

      // Check if pill is close enough to its placeholder to snap back
      const pillRect = originalPill.getBoundingClientRect();
      const placeholderRect = pillData.get(originalPill).placeholder.getBoundingClientRect();
      
      // Calculate distance between pill center and placeholder center
      const pillCenterX = pillRect.left + pillRect.width / 2;
      const pillCenterY = pillRect.top + pillRect.height / 2;
      const placeholderCenterX = placeholderRect.left + placeholderRect.width / 2;
      const placeholderCenterY = placeholderRect.top + placeholderRect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(pillCenterX - placeholderCenterX, 2) + 
        Math.pow(pillCenterY - placeholderCenterY, 2)
      );
      
      // Snap threshold: 32px
      const snapThreshold = 32;
      
      if (distance <= snapThreshold && isMovingTowardsPlaceholder) {
        // Only snap if we're moving towards the placeholder
        const pos = getRelativePosition(pillData.get(originalPill).placeholder);
        originalPill.style.transition = 'left 0.3s ease, top 0.3s ease';
        originalPill.style.left = pos.left + 'px';
        originalPill.style.top = pos.top + 'px';

        setTimeout(() => {
          originalPill.style.transition = '';
        }, 300);
      } else {
        // Re-enable CSS transitions for normal hover effects
        originalPill.style.transition = '';
        
        // Reset the 3s timer for **all pills** if not snapped
        if (autoReturnTimer) clearTimeout(autoReturnTimer);
        autoReturnTimer = setTimeout(() => {
          pillData.forEach((data, pill) => {
            const pos = getRelativePosition(data.placeholder);
            pill.style.transition = 'left 0.5s ease, top 0.5s ease';
            pill.style.left = pos.left + 'px';
            pill.style.top = pos.top + 'px';

            setTimeout(() => {
              pill.style.transition = '';
            }, 500);
          });
        }, 2000);
      }
    }

    // --- Mouse events ---
    originalPill.addEventListener('mousedown', e => {
      e.preventDefault();
      
      // Calculate offset relative to parent container (for parent-relative positioning)
      // Calculate from pill's current position, not the placeholder
      const pillRect = originalPill.getBoundingClientRect();
      const parentRect = originalPill.parentNode.getBoundingClientRect();
      const offsetX = e.clientX - pillRect.left;
      const offsetY = e.clientY - pillRect.top;
      
      startDrag(e.clientX, e.clientY, offsetX, offsetY);

      function moveHandler(ev) {
        moveDrag(ev.clientX, ev.clientY);
      }

      function upHandler() {
        dropDrag();
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      }

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    });

    // --- Touch events ---
    originalPill.addEventListener('touchstart', e => {
      e.preventDefault();
      const touch = e.touches[0];
      
      // Calculate offset relative to parent container (for parent-relative positioning)
      // Calculate from pill's current position, not the placeholder
      const pillRect = originalPill.getBoundingClientRect();
      const parentRect = originalPill.parentNode.getBoundingClientRect();
      const offsetX = touch.clientX - pillRect.left;
      const offsetY = touch.clientY - pillRect.top;
      
      startDrag(touch.clientX, touch.clientY, offsetX, offsetY);

      function moveHandler(ev) {
        const t = ev.touches[0];
        moveDrag(t.clientX, t.clientY);
      }

      function endHandler() {
        dropDrag();
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', endHandler);
      }

      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', endHandler, { passive: false });
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

// Handle viewport resize to reposition pills
window.addEventListener('resize', function() {
    // Only run if we're on the homepage and pills exist
    if (document.body.classList.contains('homepage') && document.querySelectorAll('.hero .pill').length > 0) {
        // Small delay to ensure layout has updated
        setTimeout(() => {
            repositionPillsToPlaceholders();
        }, 100);
    }
});

// Function to reposition all pills back to their placeholders
function repositionPillsToPlaceholders() {
    const pills = document.querySelectorAll('.hero .pill');
    
    pills.forEach(originalPill => {
        // Find the corresponding placeholder
        const placeholder = originalPill.parentNode.querySelector('.pill.placeholder');
        if (placeholder && placeholder.parentNode) {
            const placeholderRect = placeholder.getBoundingClientRect();
            const parentRect = placeholder.parentNode.getBoundingClientRect();
            originalPill.style.left = (placeholderRect.left - parentRect.left) + 'px';
            originalPill.style.top = (placeholderRect.top - parentRect.top) + 'px';
        }
    });
}

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

// Play page modal functionality
function initPlayModal() {
    const galleryItems = document.querySelectorAll('.play-gallery-item');
    const modalOverlay = document.getElementById('playModalOverlay');
    const modalClose = document.getElementById('playModalClose');
    const modalMedia = document.getElementById('playModalMedia');
    const modalInfo = document.getElementById('playModalInfo');
    
    if (!modalOverlay || !modalClose) return;
    
    // Define content for each item
    const modalContent = {
        // Using absolute paths from site root
        'css-letterforms.mp4': {
            media: '<video><source src="/images/play/css-letterforms.mp4" type="video/mp4"></video>',
            info: '<div class="play-modal-info-header"><h3>CSS Letterforms</h3><p>A small coding exercise playing with typography and hover interactions</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p>2024</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>HTML, CSS</p></div><hr></div></div>'
        },
        'docker.mp4': {
            media: '<video><source src="/images/play/docker.mp4" type="video/mp4"></video>',
            info: '<div class="play-modal-info-header"><h3>Docker</h3><p>Container visualization project.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'earth.png': {
            media: '<img src="/images/play/earth.png" alt="Earth">',
            info: '<div class="play-modal-info-header"><h3>Earth</h3><p>Earth representation design.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'kitchen.jpg': {
            media: '<img src="/images/play/kitchen.jpg" alt="Kitchen">',
            info: '<div class="play-modal-info-header"><h3>Kitchen</h3><p>Kitchen design visualization.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'moon.mp4': {
            media: '<video><source src="/images/play/moon.mp4" type="video/mp4"></video>',
            info: '<div class="play-modal-info-header"><h3>Moon</h3><p>Lunar phase animation.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'tomato-tomato.png': {
            media: '<img src="/images/play/tomato-tomato.png" alt="Riso Tomato">',
            info: '<div class="play-modal-info-header"><h3>Tomato Tomato</h3><p>Ripped pieces of paper, scanned them, and assembled them into a risograph print. An ode to tomato lovers and linguists.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2023</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Illustrator</p></div><hr></div></div>'
        },
        'the-extensions-of-man.mp4': {
            media: '<video><source src="/images/play/the-extensions-of-man.mp4" type="video/mp4"></video>',
            info: '<div class="play-modal-info-header"><h3>the-extensions-of-man</h3><p>Character animation project.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'spirited-away.PNG': {
            media: '<img src="/images/play/spirited-away.PNG" alt="Spirited Away">',
            info: '<div class="play-modal-info-header"><h3>Spirited Away</h3><p>Illustration inspired by Studio Ghibli.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'twelve-moons.mp4': {
            media: '<video><source src="/images/play/twelve-moons.mp4" type="video/mp4"></video>',
            info: '<div class="play-modal-info-header"><h3>Twelve Moons</h3><p>Lunar calendar visualization.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'vincenzo.PNG': {
            media: '<img src="/images/play/vincenzo.PNG" alt="Vincenzo">',
            info: '<div class="play-modal-info-header"><h3>Vincenzo</h3><p>Digital portrait inspired by the drama.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'wheein.PNG': {
            media: '<img src="/images/play/wheein.PNG" alt="Wheein">',
            info: '<div class="play-modal-info-header"><h3>Wheein</h3><p>K-pop artist portrait.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'wkx-cup.PNG': {
            media: '<img src="/images/play/wkx-cup.PNG" alt="WKX Cup">',
            info: '<div class="play-modal-info-header"><h3>WKX Cup</h3><p>Custom cup design.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'wkx-fan.PNG': {
            media: '<img src="/images/play/wkx-fan.PNG" alt="WKX Fan">',
            info: '<div class="play-modal-info-header"><h3>WKX Fan</h3><p>Custom fan design.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'pixel-pastry.png': {
            media: '<img src="/images/play/pixel-pastry.png" alt="Pixel Pastry">',
            info: '<div class="play-modal-info-header"><h3>Pixel Pastry</h3><p>Pixel art pastry illustration.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'figurines.png': {
            media: '<img src="/images/play/figurines.png" alt="Figurines">',
            info: '<div class="play-modal-info-header"><h3>Figurines</h3><p>Got back into ceramics this summer, my first time since middle school. Inspo: @annabel_le</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2025</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Ceramics</p></div><hr></div></div>'
        },
        'house-jar.png': {
            media: '<img src="/images/play/house-jar.png" alt="House Jar">',
            info: '<div class="play-modal-info-header"><h3>House jar</h3><p>One of my first pieces from this summer. Inspo: @dgaf.studio</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2025</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Ceramics</p></div><hr></div></div>'
        },
        'rat-pizza.png': {
            media: '<img src="/images/play/rat-pizza.png" alt="Rat Pizza">',
            info: '<div class="play-modal-info-header"><h3>Rat Pizza</h3><p>3D rendered scene.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'cherry-tomato.jpeg': {
            media: '<img src="/images/play/cherry-tomato.jpeg" alt="Cherry Tomato">',
            info: '<div class="play-modal-info-header"><h3>Cherry Tomato</h3><p>Digital illustration.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'it-might-sting-a-little.png': {
            media: '<img src="/images/play/it-might-sting-a-little.png" alt="it-might-sting-a-little">',
            info: '<div class="play-modal-info-header"><h3>it-might-sting-a-little</h3><p>it-might-sting-a-little texture study.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'sisterhood.jpeg': {
            media: '<img src="/images/play/sisterhood.jpeg" alt="sisterhood">',
            info: '<div class="play-modal-info-header"><h3>sisterhood</h3><p>Character portrait.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'change-over-time.jpg': {
            media: '<img src="/images/play/change-over-time.jpg" alt="change-over-time">',
            info: '<div class="play-modal-info-header"><h3>change-over-time</h3><p>Interior design visualization.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'refraction.jpg': {
            media: '<img src="/images/play/refraction.jpg" alt="Refraction">',
            info: '<div class="play-modal-info-header"><h3>Refraction</h3><p>Surface texture study.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'flash.jpg': {
            media: '<img src="/images/play/flash.jpg" alt="Flash">',
            info: '<div class="play-modal-info-header"><h3>Flash</h3><p>Material rendering exploration.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'water-color.jpg': {
            media: '<img src="/images/play/water-color.jpg" alt="Water Color">',
            info: '<div class="play-modal-info-header"><h3>Water Color</h3><p>Watercolor painting technique.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'dry-eyes.GIF': {
            media: '<img src="/images/play/dry-eyes.GIF" alt="Dry Eyes">',
            info: '<div class="play-modal-info-header"><h3>Dry Eyes</h3><p>Animated illustration.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'pomodoro.GIF': {
            media: '<img src="/images/play/pomodoro.GIF" alt="Pomodoro">',
            info: '<div class="play-modal-info-header"><h3>Pomodoro</h3><p>Pomodoro timer design.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p>Description</p><p>Text</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2024</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>Tool</p></div><hr></div></div>'
        },
        'brain-fry.GIF': {
            media: '<img src="/images/play/brain-fry.GIF" alt="Brain Fry">',
            info: '<div class="play-modal-info-header"><h3>Brain Fry</h3><p>Mental exhaustion visualization.</p>'
        },
        // Type page fonts - using absolute paths from site root
        'basier-square.jpg': {
            media: '<img src="/images/play/type/basier-square.jpg" alt="Basier Square">',
            info: '<div class="play-modal-info-header"><h3>Basier Square</h3><p>Basier, inspired by the International Style, is a neo-grotesque sans serif typeface available in two variants, Circle & Square.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2018</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>atipo foundry</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="https://www.atipofoundry.com/fonts/basier" target="_blank">basier | atipo foundry</a></p></div><hr></div></div>'
        },
        'circular-std.png': {
            media: '<img src="/images/play/type/circular-std.png" alt="Circular Std">',
            info: '<div class="play-modal-info-header"><h3>Circular Std</h3><p>LL Circular is a geometric sans-serif font family in eight weights. It is Laurenz Brunner’s second official release after the critically acclaimed, immensely popular LL Akkurat.</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>2013</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Laurenz Brunner</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="https://lineto.com/typefaces/circular/" target="_blank">Lineto.com</a></p></div><hr></div></div>'
        },
        'diatype.png': {
            media: '<img src="/images/play/type/diatype.png" alt="Diatype">',
            info: '<div class="play-modal-info-header"><h3>Diatype</h3><p>Description</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'digibop.png': {
            media: '<img src="/images/play/type/digibop.png" alt="DigiBop">',
            info: '<div class="play-modal-info-header"><h3>DigiBop</h3><p>Description</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'editorial-new.jpg': {
            media: '<img src="/images/play/type/editorial-new.jpg" alt="Editorial New">',
            info: '<div class="play-modal-info-header"><h3>Editorial New</h3><p>Description</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'editorial-old.webp': {
            media: '<img src="/images/play/type/editorial-old.webp" alt="Editorial Old">',
            info: '<div class="play-modal-info-header"><h3>Editorial Old</h3><p>Description</p></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'figma-sans.avif': {
            media: '<img src="/images/play/type/figma-sans.avif" alt="Figma Sans">',
            info: '<div class="play-modal-info-header"><h3>Figma Sans</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'good-sans.webp': {
            media: '<img src="/images/play/type/good-sans.webp" alt="Good Sans">',
            info: '<div class="play-modal-info-header"><h3>Good Sans</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'google-sans.png': {
            media: '<img src="/images/play/type/google-sans.png" alt="Google Sans">',
            info: '<div class="play-modal-info-header"><h3>Google Sans</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'graphik.gif': {
            media: '<img src="/images/play/type/graphik.gif" alt="Graphik">',
            info: '<div class="play-modal-info-header"><h3>Graphik</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'helveesti.jpeg': {
            media: '<img src="/images/play/type/helveesti.jpeg" alt="Helveesti">',
            info: '<div class="play-modal-info-header"><h3>Helveesti</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'inferi.jpg': {
            media: '<img src="/images/play/type/inferi.jpg" alt="Inferi">',
            info: '<div class="play-modal-info-header"><h3>Inferi</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'instrument-sans.gif': {
            media: '<img src="/images/play/type/instrument-sans.gif" alt="Instrument Sans">',
            info: '<div class="play-modal-info-header"><h3>Instrument Sans</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'instrument-serif.png': {
            media: '<img src="/images/play/type/instrument-serif.png" alt="Instrument Serif">',
            info: '<div class="play-modal-info-header"><h3>Instrument Serif</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'mondwest.jpg': {
            media: '<img src="/images/play/type/mondwest.jpg" alt="Mondwest">',
            info: '<div class="play-modal-info-header"><h3>Mondwest</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'mori.jpg': {
            media: '<img src="/images/play/type/mori.jpg" alt="Mori">',
            info: '<div class="play-modal-info-header"><h3>Mori</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'neue-montreal.jpg': {
            media: '<img src="/images/play/type/neue-montreal.jpg" alt="Neue Montreal">',
            info: '<div class="play-modal-info-header"><h3>Neue Montreal</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'pentameter.png': {
            media: '<img src="/images/play/type/pentameter.png" alt="Pentameter">',
            info: '<div class="play-modal-info-header"><h3>Pentameter</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'polysans.jpg': {
            media: '<img src="/images/play/type/polysans.jpg" alt="Polysans">',
            info: '<div class="play-modal-info-header"><h3>Polysans</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'regola-pro.jpg': {
            media: '<img src="/images/play/type/regola-pro.jpg" alt="Regola Pro">',
            info: '<div class="play-modal-info-header"><h3>Regola Pro</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'rethink-sans.png': {
            media: '<img src="/images/play/type/rethink-sans.png" alt="Rethink Sans">',
            info: '<div class="play-modal-info-header"><h3>Rethink Sans</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'roobert.webp': {
            media: '<img src="/images/play/type/roobert.webp" alt="Roobert">',
            info: '<div class="play-modal-info-header"><h3>Roobert</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'self-modern.png': {
            media: '<img src="/images/play/type/self-modern.png" alt="Self Modern">',
            info: '<div class="play-modal-info-header"><h3>Self Modern</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'sf-pro.png': {
            media: '<img src="/images/play/type/sf-pro.png" alt="SF Pro">',
            info: '<div class="play-modal-info-header"><h3>SF Pro</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'sohne.avif': {
            media: '<img src="/images/play/type/sohne.avif" alt="Sohne">',
            info: '<div class="play-modal-info-header"><h3>Sohne</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'swear-text.png': {
            media: '<img src="/images/play/type/swear-text.png" alt="Swear Text">',
            info: '<div class="play-modal-info-header"><h3>Swear Text</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'that-that.png': {
            media: '<img src="/images/play/type/that-that.png" alt="That That">',
            info: '<div class="play-modal-info-header"><h3>That That</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'the-seasons.png': {
            media: '<img src="/images/play/type/the-seasons.png" alt="The Seasons">',
            info: '<div class="play-modal-info-header"><h3>The Seasons</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'tumb.jpeg': {
            media: '<img src="/images/play/type/tumb.jpeg" alt="Tumb">',
            info: '<div class="play-modal-info-header"><h3>Tumb</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'uw-workshop.png': {
            media: '<img src="/images/play/type/uw-workshop.png" alt="UW Workshop">',
            info: '<div class="play-modal-info-header"><h3>UW Workshop</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        },
        'wetris.jpeg': {
            media: '<img src="/images/play/type/wetris.jpeg" alt="Wetris">',
            info: '<div class="play-modal-info-header"><h3>Wetris</h3><p>Description</p><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>YYYY</p></div><hr></div><div><div class="play-modal-info-row"><p>By</p><p>Designer</p></div><hr></div><div><div class="play-modal-info-row"><p>Source</p><p><a href="#" target="_blank">Link</a></p></div><hr></div></div>'
        }
    };
    
    function openModal(content) {
        // Pause all background videos
        const backgroundVideos = document.querySelectorAll('.play-gallery-item video');
        backgroundVideos.forEach(video => {
            if (!video.paused) {
                video.setAttribute('data-was-playing', 'true');
                video.pause();
            }
        });
        
        modalMedia.innerHTML = content.media;
        
        // Set the full info HTML (title, description, and all info rows)
        modalInfo.innerHTML = content.info;
        
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Autoplay video in modal if it exists
        const modalVideo = modalMedia.querySelector('video');
        if (modalVideo) {
            modalVideo.autoplay = true;
            modalVideo.loop = true;
            modalVideo.setAttribute('autoplay', '');
            modalVideo.setAttribute('loop', '');
            modalVideo.setAttribute('playsinline', '');
            modalVideo.removeAttribute('controls');
            modalVideo.load(); // Reload to apply autoplay
        }
    }
    
    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
        
        // Resume background videos that were playing
        const backgroundVideos = document.querySelectorAll('.play-gallery-item video');
        backgroundVideos.forEach(video => {
            if (video.getAttribute('data-was-playing') === 'true') {
                video.play();
                video.removeAttribute('data-was-playing');
            }
        });
    }
    
    // Function to get relative time string
    function getRelativeTime(filePath) {
        // Extract filename from path (handle query parameters)
        let fileName = filePath.split('/').pop();
        if (fileName.includes('?')) {
            fileName = fileName.split('?')[0];
        }
        
        // File modification times
        const fileTimes = {
            // Type page files (last modified: 10/26/2025 9:31:09 PM)
            'basier-square.jpg': new Date('2025-10-26T21:31:09'),
            'circular-std.png': new Date('2025-10-26T21:31:10'),
            'diatype.png': new Date('2025-10-26T21:31:09'),
            'digibop.png': new Date('2025-10-26T21:31:10'),
            'editorial-new.jpg': new Date('2025-10-26T21:31:09'),
            'editorial-old.webp': new Date('2025-10-26T21:31:10'),
            'figma-sans.avif': new Date('2025-10-26T21:31:10'),
            'good-sans.webp': new Date('2025-10-26T21:31:10'),
            'google-sans.png': new Date('2025-10-26T21:31:09'),
            'graphik.gif': new Date('2025-10-26T21:31:09'),
            'helveesti.jpeg': new Date('2025-10-26T21:31:09'),
            'inferi.jpg': new Date('2025-10-26T21:31:10'),
            'instrument-sans.gif': new Date('2025-10-26T21:31:10'),
            'instrument-serif.png': new Date('2025-10-26T21:31:10'),
            'mondwest.jpg': new Date('2025-10-26T21:31:10'),
            'mori.jpg': new Date('2025-10-26T21:31:10'),
            'neue-montreal.jpg': new Date('2025-10-26T21:31:10'),
            'pentameter.png': new Date('2025-10-26T21:31:10'),
            'polysans.jpg': new Date('2025-10-26T21:31:10'),
            'regola-pro.jpg': new Date('2025-10-26T21:31:10'),
            'rethink-sans.png': new Date('2025-10-26T21:31:09'),
            'roobert.webp': new Date('2025-10-26T21:31:10'),
            'self-modern.png': new Date('2025-10-26T21:31:10'),
            'sf-pro.png': new Date('2025-10-26T21:31:09'),
            'sohne.avif': new Date('2025-10-26T21:31:09'),
            'swear-text.png': new Date('2025-10-26T21:31:10'),
            'that-that.png': new Date('2025-10-26T21:31:10'),
            'the-seasons.png': new Date('2025-10-26T21:31:09'),
            'tumb.jpeg': new Date('2025-10-26T21:31:10'),
            'uw-workshop.png': new Date('2025-10-26T21:31:10'),
            'wetris.jpeg': new Date('2025-10-26T21:31:10'),
            // Play page files (from Get-ChildItem images\play\*.mp4, etc.)
            'twelve-moons.mp4': new Date('2025-10-26T01:52:18'),
            'css-letterforms.mp4': new Date('2025-10-25T22:38:51'),
            'pixel-pastry.png': new Date('2025-10-26T19:27:49'),
            'riso-tomato.png': new Date('2023-11-06T23:16:33'),
            'tomato-tomato.png': new Date('2023-11-06T23:16:33'),
            'riso-test.png': new Date('2023-11-06T23:11:42'),
            'riso-zine.png': new Date('2023-11-06T23:16:22'),
            'figurines.png': new Date('2025-10-26T19:07:18'),
            'house-jar.png': new Date('2025-10-26T19:06:56'),
            'docker.mp4': new Date('2025-10-26T19:25:50'),
            'rat-pizza.png': new Date('2024-12-14T19:50:22'),
            'moon.mp4': new Date('2023-12-04T21:34:20'),
            'earth.png': new Date('2024-11-25T15:24:07'),
            'kitchen.jpg': new Date('2023-08-29T22:40:36'),
            'cherry-tomato.jpeg': new Date('2025-10-26T17:05:01'),
            'it-might-sting-a-little.png': new Date('2025-10-26T17:08:03'),
            'sisterhood.jpeg': new Date('2025-10-26T17:04:17'),
            'change-over-time.jpg': new Date('2023-09-02T00:37:42'),
            'refraction.jpg': new Date('2023-09-02T00:37:43'),
            'flash.jpg': new Date('2023-09-02T00:37:44'),
            'wkx-cup.PNG': new Date('2025-10-25T22:39:02'),
            'wkx-fan.PNG': new Date('2025-10-25T22:38:57'),
            'vincenzo.PNG': new Date('2025-10-25T22:38:59'),
            'water-color.jpg': new Date('2025-10-26T00:26:59'),
            'wheein.PNG': new Date('2025-10-25T22:39:16'),
            'spirited-away.PNG': new Date('2025-10-25T23:07:58'),
            'the-extensions-of-man.mp4': new Date('2025-10-25T23:07:36'),
            'dry-eyes.GIF': new Date('2023-08-28T19:25:08'),
            'pomodoro.GIF': new Date('2023-08-28T19:25:08'),
            'brain-fry.GIF': new Date('2023-08-28T19:25:08')
        };
        
        const fileTime = fileTimes[fileName];
        if (!fileTime) {
            console.log('File not found in fileTimes:', fileName);
            return 'recently';
        }
        
        const now = new Date();
        const diffMs = now - fileTime;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);
        
        if (diffMinutes < 1) return 'just now';
        if (diffMinutes < 60) return `about ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
        if (diffHours < 24) return `about ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
        if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
        return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
    
    
    // Add click handlers to gallery items and inject labels
    galleryItems.forEach(item => {
        // COMMENTED OUT - Hover labels disabled
        // Add label if it doesn't have one and isn't a link
        // if (!item.classList.contains('play-type-link') && !item.querySelector('.play-gallery-label')) {
        //     const label = document.createElement('div');
        //     label.className = 'play-gallery-label';
        //     label.innerHTML = '<span class="semibold">Info</span><span class="material-icons-round icon-xs">arrow_forward</span>';
        //     // Add label to image container if it exists, otherwise to gallery item
        //     const imageContainer = item.querySelector('.play-gallery-item-image');
        //     if (imageContainer) {
        //         imageContainer.appendChild(label);
        //     } else {
        //         item.appendChild(label);
        //     }
        // }
        
        item.addEventListener('click', () => {
            // Don't open modal for text link blocks
            if (item.classList.contains('play-type-link')) {
                return;
            }
            
            const img = item.querySelector('img');
            const video = item.querySelector('video');
            
            let src = '';
            if (img) {
                src = img.getAttribute('src');
            } else if (video) {
                const source = video.querySelector('source');
                src = source ? source.getAttribute('src') : '';
            }
            
            // Get caption text from the first p tag (filename)
            const caption = item.querySelector('.play-gallery-item > p.text-small:first-of-type');
            const captionText = caption ? caption.textContent : '';
            
            // Extract filename from src
            const filename = src.split('/').pop();
            const content = modalContent[filename];
            
            if (content) {
                // Use caption text (filename) as title
                const title = captionText;
                
                // Extract year from the file creation date
                let fileName = src.split('/').pop();
                if (fileName.includes('?')) {
                    fileName = fileName.split('?')[0];
                }
                
                // Get year from the getRelativeTimePlay function's fileTimes
                let year = '';
                const fileDateObj = getRelativeTimePlay(src);
                // We need to extract the YEAR from the creation date, so we'll get it from the fileTimes in getRelativeTimePlay
                // For now, we'll use the content.info if it exists
                if (content.info) {
                    // Extract year from existing content if available
                    const YEARMatch = content.info.match(/year.*?(\d{4})/);
                    if (year) {
                        year = year[1];
                    }
                }
                
                // Create tools mapping (you can customize this per file)
                const toolsMap = {
                    'twelve-moons.mp4': 'HTML, CSS, JavaScript',
                    'the-extensions-of-man.mp4': 'Procreate',
                    'css-letterforms.mp4': 'HTML, CSS',
                    'docker.mp4': 'Blender',
                    'moon.mp4': 'Blender',
                    'brain-fry.GIF': 'Procreate',
                    'dry-eyes.GIF': 'Procreate',
                    'pomodoro.GIF': 'Procreate',
                    'flash.jpg': 'Graphite',
                    'rat-pizza.png': 'Blender',
                    'earth.png': 'Blender',
                    'water-color.jpg': 'Procreate',
                    'spirited-away.PNG': 'Procreate',
                    'wheein.PNG': 'Procreate',
                    'vincenzo.PNG': 'Procreate',
                    'wkx-cup.PNG': 'Procreate',
                    'wkx-fan.PNG': 'Procreate',
                    'figurines.png': 'Ceramics',
                    'house-jar.png': 'Ceramics',
                    'tomato-tomato.png': 'Illustrator, Risograph',
                    'pixel-pastry.png': 'Glyphs 3',
                    'cherry-tomato.jpeg': 'Oil',
                    'it-might-sting-a-little.png': 'Oil',
                    'sisterhood.jpeg': 'Oil',
                    'change-over-time.jpg': 'Blender',
                    'kitchen.jpg': 'Blender',
                    'refraction.jpg': 'Blender'
                };
                
                const tools = toolsMap[fileName] || 'Tool';
                
                // If no year was extracted, try to get it from the file creation date
                if (!year) {
                    // Call getRelativeTimePlay to get the date, then extract year from the fileTimes
                    const relativeTime = getRelativeTimePlay(src);
                    // We need to access the fileTimes from getRelativeTimePlay
                    // For now, just get the year from the Date object
                    const fileTimesLookup = {
                        'twelve-moons.mp4': 2024,
                        'the-extensions-of-man.mp4': 2022,
                        'vincenzo.PNG': 2021,
                        'brain-fry.GIF': 2022,
                        'flash.jpg': 2017,
                        'change-over-time.jpg': 2021,
                        'cherry-tomato.jpeg': 2025,
                        'docker.mp4': 2024,
                        'css-letterforms.mp4': 2024,
                        'dry-eyes.GIF': 2022,
                        'earth.png': 2023,
                        'figurines.png': 2025,
                        'house-jar.png': 2025,
                        'it-might-sting-a-little.png': 2024,
                        'kitchen.jpg': 2023,
                        'moon.mp4': 2023,
                        'pixel-pastry.png': 2024,
                        'pomodoro.GIF': 2022,
                        'rat-pizza.png': 2024,
                        'refraction.jpg': 2020,
                        'sisterhood.jpeg': 2024,
                        'spirited-away.PNG': 2020,
                        'tomato-tomato.png': 2025,
                        'water-color.jpg': 2021,
                        'wheein.PNG': 2021,
                        'wkx-cup.PNG': 2021,
                        'wkx-fan.PNG': 2021
                    };
                    year = fileTimesLookup[fileName] || '';
                }
                
                // Update the info to include title and only YEAR and Tools rows
                content.info = `<div class="play-modal-info-header"><h3>${title}</h3></div><div class="play-modal-info-rows"><div><div class="play-modal-info-row"><p class="text-small">YEAR</p><p>${year}</p></div><hr></div><div><div class="play-modal-info-row"><p class="text-small">TOOLS</p><p>${tools}</p></div><hr></div></div>`;
                openModal(content);
            }
        });
    });
    
    // Close modal handlers
    modalClose.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        closeModal();
    });
    
    // Also handle clicks on the close icon span
    const closeIcon = modalClose.querySelector('.material-icons-round');
    if (closeIcon) {
        closeIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            closeModal();
        });
    }
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });
}

// Function to get relative time string
function getRelativeTimePlay(filePath) {
    // Extract filename from path (handle query parameters)
    let fileName = filePath.split('/').pop();
    if (fileName.includes('?')) {
        fileName = fileName.split('?')[0];
    }
    
    console.log('Looking for file:', fileName);
    
    // File modification times
    const fileTimes = {
        // Type page files (last modified: 10/26/2025 9:31:09 PM)
        'basier-square.jpg': new Date('2025-10-26T21:31:09'),
        'circular-std.png': new Date('2025-10-26T21:31:10'),
        'diatype.png': new Date('2025-10-26T21:31:09'),
        'digibop.png': new Date('2025-10-26T21:31:10'),
        'editorial-new.jpg': new Date('2025-10-26T21:31:09'),
        'editorial-old.webp': new Date('2025-10-26T21:31:10'),
        'figma-sans.avif': new Date('2025-10-26T21:31:10'),
        'good-sans.webp': new Date('2025-10-26T21:31:10'),
        'google-sans.png': new Date('2025-10-26T21:31:09'),
        'graphik.gif': new Date('2025-10-26T21:31:09'),
        'helveesti.jpeg': new Date('2025-10-26T21:31:09'),
        'inferi.jpg': new Date('2025-10-26T21:31:10'),
        'instrument-sans.gif': new Date('2025-10-26T21:31:10'),
        'instrument-serif.png': new Date('2025-10-26T21:31:10'),
        'mondwest.jpg': new Date('2025-10-26T21:31:10'),
        'mori.jpg': new Date('2025-10-26T21:31:10'),
        'neue-montreal.jpg': new Date('2025-10-26T21:31:10'),
        'pentameter.png': new Date('2025-10-26T21:31:10'),
        'polysans.jpg': new Date('2025-10-26T21:31:10'),
        'regola-pro.jpg': new Date('2025-10-26T21:31:10'),
        'rethink-sans.png': new Date('2025-10-26T21:31:09'),
        'roobert.webp': new Date('2025-10-26T21:31:10'),
        'self-modern.png': new Date('2025-10-26T21:31:10'),
        'sf-pro.png': new Date('2025-10-26T21:31:09'),
        'sohne.avif': new Date('2025-10-26T21:31:09'),
        'swear-text.png': new Date('2025-10-26T21:31:10'),
        'that-that.png': new Date('2025-10-26T21:31:10'),
        'the-seasons.png': new Date('2025-10-26T21:31:09'),
        'tumb.jpeg': new Date('2025-10-26T21:31:10'),
        'uw-workshop.png': new Date('2025-10-26T21:31:10'),
        'wetris.jpeg': new Date('2025-10-26T21:31:10'),
        // Play page files with actual creation dates
        'twelve-moons.mp4': new Date('2024-10-01'),
        'the-extensions-of-man.mp4': new Date('2022-05-01'),
        'vincenzo.PNG': new Date('2021-08-01'),
        'brain-fry.GIF': new Date('2022-04-01'),
        'flash.jpg': new Date('2017-01-01'),
        'change-over-time.jpg': new Date('2021-12-01'),
        'cherry-tomato.jpeg': new Date('2025-04-01'),
        'docker.mp4': new Date('2024-12-01'),
        'css-letterforms.mp4': new Date('2024-09-01'),
        'dry-eyes.GIF': new Date('2022-04-01'),
        'earth.png': new Date('2023-11-01'),
        'figurines.png': new Date('2025-07-01'),
        'house-jar.png': new Date('2025-07-01'),
        'it-might-sting-a-little.png': new Date('2024-04-01'),
        'kitchen.jpg': new Date('2023-06-01'),
        'moon.mp4': new Date('2023-11-01'),
        'pixel-pastry.png': new Date('2024-04-01'),
        'pomodoro.GIF': new Date('2022-04-01'),
        'rat-pizza.png': new Date('2024-12-01'),
        'refraction.jpg': new Date('2020-08-01'),
        'sisterhood.jpeg': new Date('2024-03-01'),
        'spirited-away.PNG': new Date('2020-06-01'),
        'tomato-tomato.png': new Date('2025-04-01'),
        'water-color.jpg': new Date('2021-08-01'),
        'wheein.PNG': new Date('2021-07-01'),
        'wkx-cup.PNG': new Date('2021-09-01'),
        'wkx-fan.PNG': new Date('2021-08-01'),
        'flash.jpg': new Date('2017-01-01'),
        // 'riso-tomato.png': new Date('2023-11-06T23:16:33'),
        'tomato-tomato.png': new Date('2023-11-06T23:16:33'),
        // 'riso-test.png': new Date('2023-11-06T23:11:42'),
        // 'riso-zine.png': new Date('2023-11-06T23:16:22'),
        'change-over-time.jpg': new Date('2023-08-29T22:40:36')
    };
    
    const fileTime = fileTimes[fileName];
    if (!fileTime) {
        return 'recently';
    }
    
    const now = new Date();
    const diffMs = now - fileTime;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `about ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `about ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
}

// Initialize play modal when DOM is loaded
document.addEventListener('DOMContentLoaded', initPlayModal);

// Update timestamps on the play and type pages
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.play-gallery-item .caption-overlay')) {
        const galleryItems = document.querySelectorAll('.play-gallery-item');
        galleryItems.forEach(item => {
            // Get image or video source
            const img = item.querySelector('img');
            const video = item.querySelector('video source');
            const src = img ? img.src : (video ? video.src : null);
            
            if (src) {
                const overlay = item.querySelector('.caption-overlay');
                if (overlay) {
                    const timeElement = overlay.querySelector('.timestamp');
                    if (timeElement) {
                        const relativeTime = getRelativeTimePlay(src);
                        timeElement.textContent = relativeTime;
                    }
                }
            }
        });
    }
});

// Play page block counters and timestamps
function initPlayBlockInfo() {
    const playTypeLinks = document.querySelectorAll('.play-type-link');
    
    playTypeLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Count blocks by fetching the page
        fetch(`${href}`)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const galleryItems = doc.querySelectorAll('.play-gallery .play-gallery-item');
                const count = galleryItems.length;
                
                // Find and update the text that contains "blocks"
                const textElements = link.querySelectorAll('.text-small');
                textElements.forEach(textEl => {
                    const text = textEl.textContent;
                    if (text.includes('blocks')) {
                        textEl.textContent = `${count} blocks`;
                    }
                });
            })
            .catch(() => {
                // Fallback: don't update if fetch fails
                console.log('Could not fetch page for counting');
            });
    });
}

// Play page timestamp functionality
function initPlayTimestamps() {
    const playTypeLinks = document.querySelectorAll('.play-type-link');
    
    function formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        
        if (minutes < 1) return '1 minute ago';
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours === 1) return '1 hour ago';
        if (hours < 24) return `${hours} hours ago`;
        if (days === 1) return '1 day ago';
        if (days < 7) return `${days} days ago`;
        if (weeks === 1) return '1 week ago';
        if (weeks < 4) return `${weeks} weeks ago`;
        if (months === 1) return '1 month ago';
        return `${months} months ago`;
    }
    
    // Get last modified time of each page
    playTypeLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        fetch(`${href}`, { method: 'HEAD' })
            .then(response => {
                const lastModified = response.headers.get('Last-Modified');
                const timestampEl = link.querySelector('.play-timestamp');
                
                if (lastModified && timestampEl) {
                    const timestamp = new Date(lastModified).getTime();
                    const timeAgo = formatTimeAgo(timestamp);
                    timestampEl.textContent = timeAgo;
                }
            })
            .catch(() => {
                // If fetch fails, use the static timestamp from HTML
                console.log('Could not get last modified time');
            });
    });
}

// Initialize play block info
document.addEventListener('DOMContentLoaded', () => {
    initPlayBlockInfo();
    initPlayTimestamps();
    
    // Initialize sticky scroll effect for type page
    initTypePageSticky();
});

// Sticky scroll effect for type and play pages
function initTypePageSticky() {
    const typePageTitle = document.getElementById('typePageTitle');
    const playPageTitle = document.getElementById('playPageTitle');
    const titleElement = typePageTitle || playPageTitle;
    
    if (!titleElement) return;
    
    let offsetTop = 0;
    let hasClass = false;
    
    // Get initial offset
    window.addEventListener('load', () => {
        const rect = titleElement.getBoundingClientRect();
        offsetTop = rect.top + window.scrollY;
    });
    
    // Also set immediately in case load already fired
    const rect = titleElement.getBoundingClientRect();
    offsetTop = rect.top + window.scrollY;
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const titleRect = titleElement.getBoundingClientRect();
        
        // When there's 32px between top of viewport and top of text
        if (scrollY >= offsetTop - 32 && !hasClass) {
            titleElement.classList.add('sticky-title');
            hasClass = true;
        } 
        // When scrolling back up past the threshold
        else if (scrollY < offsetTop - 32 && hasClass) {
            titleElement.classList.remove('sticky-title');
            hasClass = false;
        }
    });
}
