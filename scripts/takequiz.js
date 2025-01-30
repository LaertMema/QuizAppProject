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
            <div class="question-card mb-4" data-question-id="${question.id}">
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
                                    class="option-input"
                                    data-is-correct="${option.isCorrect}">
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
            const questionId = $(this).data('question-id');
            const selectedOption = $(this).find('input:checked');

            if (selectedOption.length) {
                answers.push({
                    questionId: questionId,
                    selectedOptionId: parseInt(selectedOption.val())
                });
            }
        });

        // Validate all questions are answered
        if (answers.length !== $('.question-card').length) {
            alert('Please answer all questions before submitting.');
            return;
        }

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
                            <div class="answers-summary mt-4">
                                <h4>Answers Summary:</h4>
                                ${result.answers.map(answer => `
                                    <div class="answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}">
                                        <p class="question-text">${answer.questionText}</p>
                                        <p class="selected-answer">Your answer: ${answer.selectedOptionText}</p>
                                        <p class="answer-status">${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
                                    </div>
                                `).join('')}
                            </div>
                            <a href="myquizzes.html" class="btn btn-primary btn-lg mt-3">Back to My Quizzes</a>
                        </div>
                    </div>
                `);
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    window.location.href = 'login.html';
                } else {
                    alert('Error submitting quiz: ' + xhr.responseText);
                }
            }
        });
    });
});