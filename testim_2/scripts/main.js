$(document).ready(function() {
    // Check if user is logged in
    if (!localStorage.getItem('loggedInUser')) {
        alert("Please log in first.");
        window.location.href = "login.html";
    }

    const quizList = $('#quizList');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];

    // Dynamically add quizzes to the list
    quizzes.forEach((quiz, index) => {
        const listItem = $('<li>').addClass('quiz-item').html(`
            ${quiz.title} - Score: ${quiz.score || 'Not taken yet'}
            <button onclick="takeQuiz(${index})" class="btn btn-info">Take Quiz</button>
            <button onclick="editQuiz(${index})" class="btn btn-warning">Edit</button>
            <button onclick="removeQuiz(${index})" class="btn btn-danger">Remove</button>
        `);
        quizList.append(listItem);
    });
});

// Function to take a quiz
function takeQuiz(index) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = quizzes[index];
    localStorage.setItem('currentQuizIndex', index);
    window.location.href = "take-quiz.html";
}

// Function to edit a quiz
function editQuiz(index) {
    localStorage.setItem('editingQuizIndex', index);
    window.location.href = 'upload-quiz.html';
}

// Function to remove a quiz
function removeQuiz(index) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        quizzes.splice(index, 1);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        location.reload();
    }
}