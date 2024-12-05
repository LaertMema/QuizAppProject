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

    // Debugging: Check the retrieved quiz object
    console.log('Retrieved Quiz:', quiz);

    if (!quiz) {
        alert('Quiz not found!');
        return;
    }

    $('#quiz-title').val(quiz.title || 'Untitled Quiz');

    const $quizForm = $('#quiz-form');
    quiz.questions.forEach((question, index) => {
        const $questionGroup = $(`
            <div class="form-group">
                <label for="question${index}">Question ${index + 1}</label>
                <input type="text" id="question${index}" name="question${index}" class="form-control" value="${question.question}">
                <label for="answer${index}">Answer</label>
                <input type="text" id="answer${index}" name="answer${index}" class="form-control" value="${question.answer}">
                <button type="button" class="btn btn-danger mt-2" onclick="removeQuestion(${index})">Remove Question</button>
            </div>
        `);
        $quizForm.append($questionGroup);
    });

    $('#add-question').click(function(event) {
        event.preventDefault();
        const index = quiz.questions.length;
        const questionGroup = $(`
            <div class="form-group">
                <label for="question${index}">Question ${index + 1}</label>
                <input type="text" id="question${index}" name="question${index}" class="form-control">
                <label for="answer${index}">Answer</label>
                <input type="text" id="answer${index}" name="answer${index}" class="form-control">
                <button type="button" class="btn btn-danger mt-2" onclick="removeQuestion(${index})">Remove Question</button>
            </div>
        `);
        $quizForm.append(questionGroup);
        quiz.questions.push({ question: '', answer: '' });
    });

    $('#save-quiz').click(function(event) {
        event.preventDefault();
        quiz.title = $('#quiz-title').val();
        quiz.questions.forEach((question, index) => {
            question.question = $(`#question${index}`).val();
            question.answer = $(`#answer${index}`).val();
        });
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        alert('Quiz saved successfully!');
        window.location.href = 'listquizzes.html';
    });
});

function removeQuestion(index) {
    const $questionGroup = $(`#question${index}`).closest('.form-group');
    $questionGroup.remove();
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const quizIndex = urlParams.get('quizIndex');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};
    const quiz = quizzes[subject][quizIndex];
    quiz.questions.splice(index, 1);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    location.reload();
}