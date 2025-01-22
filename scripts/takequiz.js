$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    // First, start the quiz attempt
    $.ajax({
        url: 'https://localhost:7155/api/QuizAttempt/start',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ quizId: parseInt(quizId) }),
        xhrFields: {
            withCredentials: true
        },
        success: function (attemptResponse) {
            localStorage.setItem('currentAttemptId', attemptResponse.id);
            
            // Then fetch the quiz details
            $.ajax({
                url: `https://localhost:7155/api/Quiz/${quizId}`,
                method: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                success: function (quiz) {
                    displayQuiz(quiz);
                },
                error: function (xhr) {
                    alert('Error loading quiz: ' + xhr.responseText);
                }
            });
        },
        error: function (xhr) {
            if (xhr.status === 401) {
                window.location.href = '/login.html';
            } else {
                alert('Error starting quiz: ' + xhr.responseText);
            }
        }
    });

    function displayQuiz(quiz) {
        $('#quizTitle').text(quiz.title);
        $('#quizDescription').text(quiz.description);

        const questionsHtml = quiz.questions.map((question, index) => `
            <div class="question-card mb-4">
                <div class="question-header">
                    Question ${index + 1}
                </div>
                <div class="question-body">
                    <p class="question-text">${question.text}</p>
                    <div class="options-container">
                        ${question.options.map(option => `
                            <div class="option-item">
                                <input type="radio" 
                                    name="question${question.id}" 
                                    value="${option.id}" 
                                    id="option${option.id}"
                                    class="option-input">
                                <label for="option${option.id}" class="option-label">
                                    ${option.text}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        $('#questions').html(questionsHtml);
    }

    $('#submitQuiz').click(function () {
        const answers = [];
        const attemptId = localStorage.getItem('currentAttemptId');

        // Collect all answers
        $('.question-card').each(function () {
            const questionId = parseInt($(this).find('input').attr('name').replace('question', ''));
            const selectedOption = $(this).find('input:checked').val();

            if (selectedOption) {
                answers.push({
                    questionId: questionId,
                    selectedOptionId: parseInt(selectedOption)
                });
            }
        });

        // Submit the quiz
        $.ajax({
            url: 'https://localhost:7155/api/QuizAttempt/submit',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                quizAttemptId: parseInt(attemptId),
                answers: answers
            }),
            xhrFields: {
                withCredentials: true
            },
            success: function (result) {
                localStorage.removeItem('currentAttemptId');
                
                // Show the result with the same styling
                $('#quizContent').html(`
                    <div class="card-header text-center">
                        <h2 class="mb-0">Quiz Results</h2>
                    </div>
                    <div class="card-body text-center">
                        <div class="result-container">
                            <h3 class="score-text">Your Score: ${result.score}%</h3>
                            <p class="completion-time">Completed at: ${new Date(result.completedAt).toLocaleString()}</p>
                            <a href="myquizzes.html" class="btn btn-primary btn-lg mt-3">Back to My Quizzes</a>
                        </div>
                    </div>
                `);
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    window.location.href = 'listquizzes.html';
                } else {
                    alert('Error submitting quiz: ' + xhr.responseText);
                }
            }
        });
    });
});