$(document).ready(function() {
    const userScores = JSON.parse(localStorage.getItem('userScores')) || {};
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};

    // Populate the subject selector
    const subjectSelector = $('#subject-selector');
    const subjects = Object.keys(quizzes);
    subjects.forEach(subject => {
        const option = $(`<option value="${subject}">${subject}</option>`);
        subjectSelector.append(option);
    });

    // Load the leaderboard for the selected subject
    function loadLeaderboard(subject) {
        $('#subject-title').text(`${subject} - Leaderboard`);
        const leaderboard = $('#leaderboard');
        leaderboard.empty();

        const scores = [];

        // Calculate scores for each user for the given subject
        Object.keys(userScores).forEach(email => {
            const userSubjectScores = userScores[email][subject];
            if (userSubjectScores) {
                const totalScore = userSubjectScores.reduce((sum, entry) => sum + entry.score, 0) * 100;
                scores.push({ email, totalScore });
            }
        });

        // Sort scores in descending order
        scores.sort((a, b) => b.totalScore - a.totalScore);

        // Display the leaderboard
        if (scores.length > 0) {
            scores.forEach((entry, index) => {
                const row = $(`
                    <tr>
                        <th scope="row">${index + 1}</th>
                        <td>${entry.email}</td>
                        <td>${entry.totalScore}</td>
                    </tr>
                `);
                leaderboard.append(row);
            });
        } else {
            leaderboard.append('<tr><td colspan="3" class="text-center">No entries yet</td></tr>');
        }
    }

    // Load the leaderboard for the first subject by default
    if (subjects.length > 0) {
        loadLeaderboard(subjects[0]);
    }

    // Event listener for subject selector change
    subjectSelector.change(function() {
        const selectedSubject = $(this).val();
        loadLeaderboard(selectedSubject);
    });
});