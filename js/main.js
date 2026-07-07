document.addEventListener('DOMContentLoaded', () => {
  // Top-level tab switching
  const tabButtons = document.querySelectorAll('#main-tabs .tab-button');
  const pages = document.querySelectorAll('.tab-page');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.classList.add('text-muted-foreground');
      });
      btn.classList.add('active');
      btn.classList.remove('text-muted-foreground');

      const target = btn.dataset.tab;
      pages.forEach(page => {
        if (page.id === `page-${target}`) {
          page.classList.remove('hidden');
        } else {
          page.classList.add('hidden');
        }
      });
    });
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