// Disable right-click context menu on images
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      return false;
    });
  });
});
