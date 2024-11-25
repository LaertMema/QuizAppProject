$(document).ready(function() {
    $('#loginButton').click(function(event) {
        event.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
      // Merr users nga local storage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem('loggedInUser', username);
            alert("Login successful!");
            window.location.href = "main.html";
        } else {
            alert("Invalid username or password.");
        }
    });
});