document.addEventListener('DOMContentLoaded', function () {
  // MOBILE MENU
  // Toggle the nav links when the menu icon is clicked
  document.getElementById('menu-icon').addEventListener('click', function (event) {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
    event.stopPropagation(); // Prevent click from reaching the document listener
  });

  // Close the nav links when clicking outside of the menu
  document.addEventListener('click', function (event) {
    const navLinks = document.getElementById('nav-links');
    const menuIcon = document.getElementById('menu-icon');

    // Check if the click target is not within the menu or the menu icon
    if (!navLinks.contains(event.target) && !menuIcon.contains(event.target)) {
      navLinks.classList.remove('active');
    }
  });


  // HOVER TEXT EFFECT
  const boundingBoxes = document.querySelectorAll('.bounding-box');
  boundingBoxes.forEach(box => {
    const tooltip = box.querySelector('.tooltip');

    const offsetX = 15;
    const offsetY = 15;

    box.addEventListener('mousemove', (e) => {
      const rect = box.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      tooltip.style.left = `${x + offsetX}px`;
      tooltip.style.top = `${y + offsetY}px`;
      tooltip.style.visibility = 'visible';
    });

    box.addEventListener('mouseleave', () => {
      tooltip.style.visibility = 'hidden';
    });

    box.addEventListener('mouseenter', () => {
      tooltip.style.visibility = 'visible';
    });
  });

  // DARK MODE
  const savedMode = localStorage.getItem('theme');
  if (savedMode === 'dark') {
    document.body.classList.add('dark-mode');
  }  

  function toggleMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }

  const toggleButton = document.querySelector('.toggle-button');
  toggleButton.addEventListener('click', toggleMode);

  if (!savedMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
  }

  // BOTTOM NAV
  const bottomNavButton = document.querySelector('.bottom-nav-button');
  const bottomNavContainer = document.querySelector('.bottom-nav-container');
  const sections = document.querySelectorAll('section');
  const navButtons = document.querySelectorAll('.nav-button');
  const bottomNavLinks = document.querySelector('.bottom-nav-links');
  const firstSection = document.querySelector('section'); // Assuming the first section is the target

  function handleBottomNavVisibility() {
    const sectionTop = firstSection.getBoundingClientRect().top;
    
    if (sectionTop <= 0) {
      // Show the bottom nav when the first section is in view
      bottomNavContainer.classList.add('active');
    } else {
      // Hide the bottom nav when the first section is out of view
      bottomNavContainer.classList.remove('active');
    }
  }

  // Event listener to track scroll position
  window.addEventListener('scroll', handleBottomNavVisibility);

  // Initial call to ensure the nav is in the correct state on page load
  handleBottomNavVisibility();
  console.log(firstSection); // Debugging to check if firstSection is correctly selected


  // Function to update nav button text dynamically
  function updateNavButtonText(sectionId) {
    const activeNavButton = [...navButtons].find(
      (btn) => btn.getAttribute('href') === `#${sectionId}`
    );

    if (activeNavButton) {
      const fancyText = activeNavButton.querySelector('.fancy').textContent;
      const nameText = activeNavButton.querySelector('p:not(.fancy)').textContent;

      const buttonLeft = bottomNavButton.querySelector('.left');
      buttonLeft.innerHTML = `<p class="fancy">${fancyText}</p><p>${nameText}</p>`;
    }
  }

  // Observer to update button text based on current section
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateNavButtonText(entry.target.id);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  // Observe all sections for text updates
  sections.forEach((section) => {
    if (section.id) {
      sectionObserver.observe(section);
    }
  });

  // Toggle the nav links menu
  bottomNavButton.addEventListener('click', (event) => {
    bottomNavLinks.classList.toggle('active');
    event.stopPropagation(); // Prevent bubbling to document
  });

  // Ensure menu items remain clickable
  bottomNavLinks.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent menu from closing when clicking a nav link
  });

  // Close the menu when clicking outside
  document.addEventListener('click', (event) => {
    if (
      !bottomNavLinks.contains(event.target) &&
      !bottomNavButton.contains(event.target)
    ) {
      bottomNavLinks.classList.remove('active');
    }
  });
});