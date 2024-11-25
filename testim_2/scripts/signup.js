$(document).ready(function() {
    $('#signupButton').click(function(event) {
        event.preventDefault();
        const newUsername = $('#newUsername').val();
        const newPassword = $('#newPassword').val();
        // Merr users nga local storage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(u => u.username === newUsername);

        if (userExists) {
            alert("Username already exists.");
        } else {
            users.push({ username: newUsername, password: newPassword });
            localStorage.setItem('users', JSON.stringify(users));
            alert("Sign up successful!");
            window.location.href = "login.html";
        }
    });
});