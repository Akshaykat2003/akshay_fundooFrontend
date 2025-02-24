document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('fundoo-login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        form.classList.add('was-validated');

        if (!form.checkValidity()) return;

        const credentials = {
            email: emailInput.value,
            password: passwordInput.value,
        };

        try {
            const response = await fetch('http://localhost:3000/api/v1/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Login failed: ${errorData.message || 'Invalid email or password.'}`);
                return;
            }

            const data = await response.json();
            const token = data.token;

            if (token) {
                sessionStorage.setItem('authToken', token);
                console.log(token);
                alert('Login successful!');
             window.location.href = 'notesDashboard.html';
            } else {
                alert('Token not found in server response.');
                console.error('Token missing in response:', data);
            }
        } catch (error) {
            alert('An error occurred while processing your request.');
            console.error('Fetch Error:', error);
        }
    });
});
