const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  document.querySelectorAll('.error').forEach((err) => {
    err.style.display = 'none';
  });

  if (!email) {
    document.getElementById('emailError').style.display = 'block';
    return;
  }

  if (!password) {
    document.getElementById('passwordError').style.display = 'block';
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/users?email=${email}&password=${password}`,
    );

    const users = await res.json();

    if (users.length === 0) {
      document.getElementById('loginError').style.display = 'block';
      return;
    }

    const user = users[0];

    if (user.role === 'user') {
      // ✅ store user name in localStorage
      localStorage.setItem('userName', user.name);

      // ✅ redirect to home page
      window.location.replace('http://127.0.0.1:5500/Customer/home.html');
    }else {
      window.location.replace('http://127.0.0.1:5500/Admin/main.html');
    }
  } catch (error) {
    alert('Server error, please try again');
  }
});
