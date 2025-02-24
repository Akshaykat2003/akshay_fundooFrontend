

(function () {
    'use strict';
    const form = document.getElementById('registerForm');
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // Form Validation
      if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        return;
      }
  
      form.classList.add('was-validated');
  
    
      const formData = {
        user: {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          phone_no: document.getElementById('phone_no').value,
        }
      };
  
      try {
        const response = await fetch('http://localhost:3000/api/v1/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          alert('Registration successful!');
          window.location.href = 'userLogin.html';
        } else {
          const errorData = await response.json();
          alert('Registration failed: ' + (errorData.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.');
      }
    });
  })();
  