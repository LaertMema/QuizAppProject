$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const quizIndex = urlParams.get('quizIndex');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};

    // Debugging: Check the structure of quizzes and the retrieved quiz
    console.log('Quizzes:', quizzes);
    console.log('Subject:', subject);
    console.log('Quiz Index:', quizIndex);

    const quiz = quizzes[subject] ? quizzes[subject][quizIndex] : null;
    const questions = quiz ? quiz.questions : null;

    // Debugging: Check the retrieved quiz object
    console.log('Retrieved Quiz:', quiz);

    if (!quiz) {
        alert('Quiz not found!');
        return;
    }

    $('#quiz-title').text(quiz.title || 'Untitled Quiz');

    const quizForm = $('#quiz-form');
    if (Array.isArray(questions)) {
        questions.forEach((question, index) => {
            const questionGroup = $(`
                <div class="form-group">
                    <label for="question${index}">${question.question}</label>
                    <input type="text" id="question${index}" name="question${index}" class="form-control">
                </div>
            `);
            quizForm.append(questionGroup);
        });
    } else {
        console.error('Quiz is not an array:', questions);
    }
    
    $('#submit-quiz').click(function(event) {
        event.preventDefault();
        let score = 0;
        quiz.forEach((question, index) => {
            const userAnswer = $(`#question${index}`).val().trim().toLowerCase();
            if (userAnswer === question.answer.trim().toLowerCase()) {
                score++;
            }
        });

        alert(`Your score is ${score}/${quiz.length}`);

        // Save the score for the user
        const userScores = JSON.parse(localStorage.getItem('userScores')) || {};
        if (!userScores[subject]) {
            userScores[subject] = [];
        }
        userScores[subject].push({ quizIndex, score });
        localStorage.setItem('userScores', JSON.stringify(userScores));
        window.location.href = 'listquizzes.html';
    });
});