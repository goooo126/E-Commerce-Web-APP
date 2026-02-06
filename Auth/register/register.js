const form = document.getElementById('registerForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  let valid = true;

  // Reset errors
  document.querySelectorAll('.error').forEach((err) => {
    err.style.display = 'none';
  });

  if (!name) {
    document.getElementById('nameError').style.display = 'block';
    valid = false;
  }

  if (!email || !email.includes('@')) {
    document.getElementById('emailError').style.display = 'block';
    valid = false;
  }

  if (password.length < 6) {
    document.getElementById('passwordError').style.display = 'block';
    valid = false;
  }

  if (password !== confirmPassword) {
    document.getElementById('confirmError').style.display = 'block';
    valid = false;
  }

  if (!valid) return;

  // check if email already exists
  try {
    const res = await fetch(
      `http://localhost:3000/users?email=${encodeURIComponent(email)}`,
    );
    const existing = await res.json();
    if (existing.length > 0) {
      document.getElementById('emailExistsError').style.display = 'block';
      return;
    }
  } catch (err) {
    console.error('Failed to check email existence', err);
    alert('Failed to validate email. Please try again.');
    return;
  }

  const user = {
    name,
    email,
    password,
    role : 'user',
  };

  try {
    const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!res.ok) throw new Error('Register failed');

    // ✅ Store name in localStorage
    localStorage.setItem('userName', name);

    // ✅ Redirect to home page
    window.location.replace('http://127.0.0.1:5500/Customer/home.html');
  } catch (error) {
    alert('Something went wrong, please try again.');
  }
});
