/**
 * Fix-it Marketplace — App Bootstrapper
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Auth
  await Auth.init();

  // Initial render of header and footer if placeholder elements exist
  if (document.querySelector('#main-header')) {
    Components.renderHeader('#main-header');
  }

  if (document.querySelector('#category-nav')) {
    const activeCategory = document.body.dataset.category || '';
    Components.renderCategoryNav('#category-nav', activeCategory);
  }

  if (document.querySelector('#main-footer')) {
    Components.renderFooter('#main-footer');
  }

  // Re-render header when auth state updates
  Auth.onStateChange(() => {
    if (document.querySelector('#main-header')) {
      Components.renderHeader('#main-header');
    }
  });
});
