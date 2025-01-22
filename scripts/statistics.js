$(document).ready(function() {
    // Check authentication first
    $.ajax({
        url: 'https://localhost:7155/api/User/current',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            loadUserStatistics();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                window.location.href = 'loginpage.html';
            }
        }
    });

    function loadUserStatistics() {
        $.ajax({
            url: 'https://localhost:7155/api/QuizAttempt/user-statistics',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(statistics) {
                displayStatistics(statistics);
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    window.location.href = 'loginpage.html';
                } else {
                    alert('Error loading statistics');
                }
            }
        });
    }

    function displayStatistics(statistics) {
        // Update overall statistics
        $('#quizzesTaken').text(statistics.totalQuizzesTaken);
        $('#quizzesCreated').text(statistics.totalQuizzesCreated);
        $('#averageScore').text(statistics.averageScore);

        // Update recent attempts
        const $recentAttempts = $('#recentAttempts');
        $recentAttempts.empty();

        if (statistics.recentAttempts.length === 0) {
            $recentAttempts.append(`
                <tr>
                    <td colspan="3" class="text-center">No attempts yet</td>
                </tr>
            `);
            return;
        }

        statistics.recentAttempts.forEach(attempt => {
            const $row = $(`
                <tr>
                    <td>${attempt.quizTitle}</td>
                    <td>${attempt.score}%</td>
                    <td>${new Date(attempt.completedAt).toLocaleDateString()}</td>
                </tr>
            `);
            $recentAttempts.append($row);
        });
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