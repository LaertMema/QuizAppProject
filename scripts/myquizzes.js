$(document).ready(function() {
    // Check authentication first
    $.ajax({
        url: 'https://localhost:7155/api/User/current',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            loadCompletedQuizzes();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                window.location.href = 'loginpage.html';
            }
        }
    });

    function loadCompletedQuizzes() {
        $.ajax({
            url: 'https://localhost:7155/api/QuizAttempt/my-attempts',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(attempts) {
                displayAttempts(attempts);
                loadCreatedQuizzes();
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    window.location.href = 'loginpage.html';
                } else {
                    $('#completed-quizzes').html(`
                        <div class="alert alert-danger">
                            Error loading quiz attempts. Please try again later.
                        </div>
                    `);
                }
            }
        });
    }
    //For created quizzes from user we also have to load them
    function loadCreatedQuizzes() {
        $.ajax({
            url: 'https://localhost:7155/api/Quiz/my-quizzes',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(quizzes) {
                displayCreatedQuizzes(quizzes);
            },
            error: function(xhr) {
                console.error('Error loading created quizzes:', xhr.responseText);
            }
        });
    }
    function displayCreatedQuizzes(quizzes) {
        const $container = $('#created-quizzes');
        
        if (quizzes.length === 0) {
            $container.html('<p class="text-center">You haven\'t created any quizzes yet.</p>');
            return;
        }
    
        quizzes.forEach(quiz => {
            const $quizItem = $(`
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${quiz.title}</h5>
                            <p class="mb-1">${quiz.description}</p>
                            <small>Subject: ${quiz.subject.name}</small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-primary edit-quiz" data-quiz-id="${quiz.id}">
                                Edit Quiz
                            </button>
                            <button class="btn btn-danger delete-quiz" data-quiz-id="${quiz.id}">
                                Delete Quiz
                            </button>
                        </div>
                    </div>
                </div>
            `);
            $container.append($quizItem);
        });
    }
    // Add click handler for edit buttons
    $(document).on('click', '.edit-quiz', function() {
    const quizId = $(this).data('quiz-id');
    window.location.href = `editquiz.html?id=${quizId}`;
    });
    function displayAttempts(attempts) {
        const container = $('#completed-quizzes');
        container.empty();

        if (attempts.length === 0) {
            container.html(`
                <div class="alert alert-info">
                    You haven't completed any quizzes yet. 
                    <a href="listquizzes.html" class="alert-link">Try one now!</a>
                </div>
            `);
            return;
        }
        // Add delete handler
    $(document).on('click', '.delete-quiz', function() {
    const quizId = $(this).data('quiz-id');
    if (confirm('Are you sure you want to delete this quiz?')) {
        $.ajax({
            url: `https://localhost:7155/api/Quiz/${quizId}`,
            method: 'DELETE',
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                alert('Quiz deleted successfully!');
                loadCreatedQuizzes(); // Reload the list
            },
            error: function(xhr) {
                alert('Error deleting quiz: ' + xhr.responseText);
            }
        });
    }
});

        attempts.forEach(attempt => {
            const scoreClass = getScoreClass(attempt.score);
            const quizItem = `
                <div class="list-group-item quiz-result">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${attempt.quizTitle}</h5>
                            <small class="text-muted">
                                Completed on: ${new Date(attempt.completedAt).toLocaleString()}
                            </small>
                            <p class="mb-1">
                                Questions: ${attempt.totalQuestions}
                            </p>
                        </div>
                        <div class="text-center">
                            <div class="score-badge badge ${scoreClass}">
                                ${attempt.score}%
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.append(quizItem);
        });
    }

    function getScoreClass(score) {
        if (score >= 90) return 'bg-success';
        if (score >= 70) return 'bg-primary';
        if (score >= 50) return 'bg-warning';
        return 'bg-danger';
    }

    // Logout handler
    $('#logoutLink').click(function(e) {
        e.preventDefault();
        $.ajax({
            url: 'https://localhost:7155/api/User/logout',
            method: 'POST',
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                window.location.href = 'index.html';
            },
            error: function() {
                alert('Error logging out');
            }
        });
    });
}); 