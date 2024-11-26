document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('menu-icon').addEventListener('click', function () {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
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
