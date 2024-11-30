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