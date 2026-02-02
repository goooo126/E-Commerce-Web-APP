document.addEventListener("DOMContentLoaded", () => {
  fetch("navbar.html")
    .then(res => res.text())
    .then(data => {
      document.body.insertAdjacentHTML("afterbegin", data);
    })
    .catch(err => console.error(err));
});
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.classList.toggle('active');
    });
  });
