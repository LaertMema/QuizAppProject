$(document).ready(function() {
    const quizList = $('#quiz-list');
    const subjectSelector = $('#subject-selector');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};

    // Populate the subject selector
    Object.keys(quizzes).forEach(subject => {
        const option = $(`<option value="${subject}">${subject}</option>`);
        subjectSelector.append(option);
    });
    function logout() {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'loginpage.html';
    }
    function redirectAndLogOut(event) {
        event.preventDefault(); 
        logout(); 
        // setTimeout(() => {
        //     window.location.href = "index.html"; // 
        //     }, 100);
        }
    // Function to display quizzes by subject
    function displayQuizzes(subject) {
        quizList.empty();
        const quizzesToDisplay = subject === 'all' ? Object.entries(quizzes).flatMap(([subj, quizzes]) => quizzes.map((quiz, index) => ({ ...quiz, subject: subj, index }))) : quizzes[subject].map((quiz, index) => ({ ...quiz, subject, index }));

        if (quizzesToDisplay && quizzesToDisplay.length > 0) {
            quizzesToDisplay.forEach((quiz) => {
                const quizItem = $('<div class="list-group-item"></div>');
                quizItem.html(`
                    <h5 class="mb-1">${quiz.title || 'Untitled Quiz'}</h5>
                    <button class="btn btn-primary mt-2" onclick="takeQuiz('${quiz.subject}', ${quiz.index})">Take Quiz</button>
                    <button class="btn btn-secondary mt-2" onclick="editQuiz('${quiz.subject}', ${quiz.index})">Edit Quiz</button>
                    <button class="btn btn-danger mt-2" onclick="removeQuiz('${quiz.subject}', ${quiz.index})">Remove Quiz</button>
                `);
                quizList.append(quizItem);
            });
        } else {
            quizList.append('<p class="text-muted">No quizzes available for this subject.</p>');
        }
    }

    // Initial display of all quizzes
    displayQuizzes('all');

    // Event listener for subject selector change
    subjectSelector.change(function() {
        const selectedSubject = $(this).val();
        displayQuizzes(selectedSubject);
    });
});

function takeQuiz(subject, index) {
    window.location.href = `takequiz.html?subject=${subject}&quizIndex=${index}`;
}

function editQuiz(subject, index) {
    window.location.href = `editquiz.html?subject=${subject}&quizIndex=${index}`;
}

function removeQuiz(subject, index) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};
    if (quizzes[subject]) {
        quizzes[subject].splice(index, 1);
        if (quizzes[subject].length === 0) {
            delete quizzes[subject];
        }
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        location.reload();
    }
}