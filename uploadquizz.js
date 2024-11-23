$(document).ready(function () {
    // Load existing quizzes from localStorage or initialize an empty object
    let quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};

    // Function to create a question and answer group
    function createQuestionAnswerGroup(index) {
        const questionAnswerGroup = $('<div>', {
            class: 'question-answer-group mb-3'
        });

        const questionLabel = $('<label>', {
            for: `question${index}`,
            class: 'form-label',
            text: `Question ${index}`
        });
        const questionTextArea = $('<textarea>', {
            id: `question${index}`,
            class: 'form-control mb-2',
            rows: 3,
            placeholder: `Enter question ${index}`
        });

        const answerLabel = $('<label>', {
            for: `answer${index}`,
            class: 'form-label',
            text: `Answer ${index}`
        });
        const answerInput = $('<input>', {
            id: `answer${index}`,
            type: 'text',
            class: 'form-control',
            placeholder: `Enter answer ${index}`
        });

        questionAnswerGroup.append(questionLabel, questionTextArea, answerLabel, answerInput);

        return questionAnswerGroup;
    }

    // Add the first question and answer group on page load
    $('#questions-container').append(createQuestionAnswerGroup(1));

    // Add more question-answer fields when "Add Question" is clicked
    $('#add-question-btn').click(function () {
        const questionCount = $('#questions-container').children('.question-answer-group').length + 1;
        $('#questions-container').append(createQuestionAnswerGroup(questionCount));
    });

    // Save quiz to localStorage when "Submit Quiz" is clicked
    $('.submit-btn').click(function () {
        const subject = $('#subject').val();
        if (!subject) {
            alert('Please select a subject!');
            return;
        }

        const quiz = [];
        let isEmpty = false;

        $('.question-answer-group').each(function () {
            const questionText = $(this).find('textarea').val().trim();
            const answerText = $(this).find('input').val().trim();
            
            if (!questionText || !answerText) {
                isEmpty = true; // Mark as incomplete if any field is empty
                return false;   // Break the loop
            }

            quiz.push({ question: questionText, answer: answerText });
        });

        if (isEmpty) {
            alert('Please fill out all questions and answers before submitting!');
            return;
        }

        // Save the quiz in localStorage
        if (!quizzes[subject]) {
            quizzes[subject] = [];
        }
        quizzes[subject].push(quiz);

        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        // Reset the form fields
        $('#subject').val('');
        $('#questions-container').empty().append(createQuestionAnswerGroup(1));

        alert('Quiz submitted successfully!');
    });

    // Debugging: To verify localStorage structure, uncomment the following line
    // console.log(quizzes);
});
