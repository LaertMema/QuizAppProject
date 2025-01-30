$(document).ready(function() {
    // Check authentication first
    $.ajax({
        url: 'https://localhost:7155/api/User/current',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            loadSubjects();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                window.location.href = 'loginpage.html';
            }
        }
    });

    function loadSubjects() {
        $.ajax({
            url: 'https://localhost:7155/api/Subject',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(subjects) {
                const $subjectSelector = $('#subject-selector');
                subjects.forEach(subject => {
                    const $option = $(`<option value="${subject.id}">${subject.name}</option>`);
                    $subjectSelector.append($option);
                });
                // Load initial leaderboard
                if (subjects.length > 0) {
                    loadLeaderboard(subjects[0].id, subjects[0].name);
                }
            },
            error: function(xhr) {
                console.error('Error loading subjects:', xhr.responseText);
            }
        });
    }

    function loadLeaderboard(subjectId, subjectName) {
        $('#subject-title').text(`${subjectName} - Leaderboard`);
        
        $.ajax({
            url: `https://localhost:7155/api/QuizAttempt/leaderboard/${subjectId}`,
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(leaderboardData) {
                displayLeaderboard(leaderboardData);
            },
            error: function(xhr) {
                console.error('Error loading leaderboard:', xhr.responseText);
                $('#leaderboard').html(`
                    <tr>
                        <td colspan="3" class="text-center">Error loading leaderboard data</td>
                    </tr>
                `);
            }
        });
    }

    function displayLeaderboard(leaderboardData) {
        const $leaderboard = $('#leaderboard');
        $leaderboard.empty();

        if (leaderboardData.length === 0) {
            $leaderboard.append(`
                <tr>
                    <td colspan="3" class="text-center">No entries yet</td>
                </tr>
            `);
            return;
        }

        leaderboardData.forEach((entry, index) => {
            const rowClass = getRowClass(index);
            const $row = $(`
                <tr class="${rowClass}">
                    <th scope="row">${index + 1}</th>
                    <td>${entry.userName}</td>
                    <td>${entry.totalScore}</td>
                </tr>
            `);
            $leaderboard.append($row);
        });
    }

    function getRowClass(index) {
        switch(index) {
            case 0: return 'table-warning'; // Gold
            case 1: return 'table-light';   // Silver
            case 2: return 'table-secondary'; // Bronze
            default: return '';
        }
    }

    // Event listener for subject selector change
    $('#subject-selector').change(function() {
        const selectedSubject = $(this).find('option:selected');
        loadLeaderboard(selectedSubject.val(), selectedSubject.text());
    });

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