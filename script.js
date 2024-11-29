document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('menu-icon').addEventListener('click', function () {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
  });

  const boundingBoxes = document.querySelectorAll('.bounding-box');

  boundingBoxes.forEach(box => {
    const tooltip = box.querySelector('.tooltip');

    const offsetX = 30;
    const offsetY = -24;

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
});




// // Apply the user's preferred mode immediately before the document is fully loaded
// (function() {
//   const mode = localStorage.getItem('mode') || 'lightmode';
//   document.documentElement.classList.add(mode); // Apply mode to <html> element immediately
// })();

// $(document).ready(function () {
//   // Reapply mode on page load (safeguard against missing class)
//   const mode = localStorage.getItem('mode') || 'lightmode';
//   $('body').addClass(mode);

//   // Toggle dark mode on button click
//   $('#darkmode').on('click', function () {
//     // Toggle the darkmode class on the body
//     $('body').toggleClass('darkmode');
    
//     // Update the user's mode preference in localStorage
//     const currentMode = $('body').hasClass('darkmode') ? 'darkmode' : 'lightmode';
//     localStorage.setItem('mode', currentMode);
//   });
// });
