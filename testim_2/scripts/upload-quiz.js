$(document).ready(function() {
    // Check if user is logged in
    if (!localStorage.getItem('loggedInUser')) {
        alert("Please log in first.");
        window.location.href = "login.html";
    }

    // Load quiz data if editing an existing quiz
    const editingQuizIndex = localStorage.getItem('editingQuizIndex');
    if (editingQuizIndex !== null) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const quiz = quizzes[editingQuizIndex];
        $('#quizTitle').val(quiz.title);
        quiz.questions.forEach((question, index) => {
            addQuestion(question.text, question.answer, index);
        });
    }
});

// Function to add a question
function addQuestion(text = '', answer = '', index = -1) {
    const container = $('#questionsContainer');
    const questionDiv = $('<div>').addClass('question').html(`
        <div class="form-group">
            <label for="questionText${index !== -1 ? index : container.children().length}">Question Text:</label>
            <input type="text" id="questionText${index !== -1 ? index : container.children().length}" class="form-control" value="${text}" required>
        </div>
        <div class="form-group">
            <label for="questionAnswer${index !== -1 ? index : container.children().length}">Question Answer:</label>
            <input type="text" id="questionAnswer${index !== -1 ? index : container.children().length}" class="form-control" value="${answer}" required>
        </div>
        <button onclick="removeQuestion(this)" class="btn btn-danger">Remove Question</button>
    `);
    container.append(questionDiv);
}

// Function to remove a question
function removeQuestion(button) {
    $(button).closest('.question').remove();
}

// Function to submit the quiz
$('#submitButton').click(function(event) {
    event.preventDefault();
    const title = $('#quizTitle').val();
    const questions = [];
    const questionElements = $('.question');

    // Collect all questions and answers
    questionElements.each(function(index) {
        const text = $(this).find('input[type="text"]').first().val();
        const answer = $(this).find('input[type="text"]').last().val();
        questions.push({ text, answer });
    });

    const quiz = { title, questions, score: null };
    let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];

    // Update or add the quiz
    const editingQuizIndex = localStorage.getItem('editingQuizIndex');
    if (editingQuizIndex !== null) {
        quizzes[editingQuizIndex] = quiz;
        localStorage.removeItem('editingQuizIndex');
    } else {
        quizzes.push(quiz);
    }

    // Save the quizzes to local storage and routes to main
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    window.location.href ="main.html";
});