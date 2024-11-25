$(document).ready(function() {
    // Check if user is logged in
    if (!localStorage.getItem('loggedInUser')) {
        alert("Please log in first.");
        window.location.href = "login.html";
    }

    const currentQuizIndex = localStorage.getItem('currentQuizIndex');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = quizzes[currentQuizIndex];

    // Dynamically add questions to the form
    quiz.questions.forEach((question, index) => {
        const questionDiv = $('<div>').addClass('form-group').html(`
            <label>${question.text}</label>
            <input type="text" id="answer${index}" class="form-control" required>
        `);
        $('#questionsContainer').append(questionDiv);
    });

    // Handle form submission
    $('#quizForm').submit(function(event) {
        event.preventDefault();
        let score = 0;

        // Calculate score based on user answers
        quiz.questions.forEach((question, index) => {
            const userAnswer = $(`#answer${index}`).val();
            if (userAnswer.toLowerCase() === question.answer.toLowerCase()) {
                score++;
            }
        });

        // Update the quiz score and save to local storage
        quizzes[currentQuizIndex].score = score;
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        alert(`Your score: ${score}`);
        window.location.href = "main.html";
    });
});