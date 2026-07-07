document.addEventListener('DOMContentLoaded', () => {
  // Highlight the nav link that matches the current page
  const navLinks = document.querySelectorAll('#main-tabs .tab-button');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage || (currentPage === 'index.html' && linkPage === 'index.html')) {
      link.classList.add('active');
      link.classList.remove('text-muted-foreground');
    } else {
      link.classList.remove('active');
      link.classList.add('text-muted-foreground');
    }
  });

  // Filter button groups (visual toggle only, no filtering logic yet)
  document.querySelectorAll('[id$="-filters"]').forEach(group => {
    group.querySelectorAll('.filter-button').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
});
