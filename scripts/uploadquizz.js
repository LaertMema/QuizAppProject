$(document).ready(function () {
    // Load existing quizzes from localStorage or initialize an empty object
    let quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};
    
    function logout() {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'loginpage.html';
    }
    //E bej kete funksionin qe te sigurohem te behem logout mos bej redirect pa u bere kjo
    function redirectAndLogOut(event) {
        event.preventDefault(); 
        logout(); 
        setTimeout(() => {
            window.location.href = "index.html"; // 
            }, 100);
        }

    // Function to create a question and answer group
    function createQuestionAnswerGroup(index) {
        const questionAnswerGroup = $('<div>', {
            class: 'question-answer-group mb-3',
            id: `question-answer-group-${index}`
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

        const removeButton = $('<button>', {
            type: 'button',
            class: 'btn btn-danger mt-2',
            text: 'Remove',
            click: function () {
                removeQuestionAnswerGroup(index);
            }
        });

        questionAnswerGroup.append(questionLabel, questionTextArea, answerLabel, answerInput, removeButton);

        return questionAnswerGroup;
    }

    // Function to remove a question and answer group
    function removeQuestionAnswerGroup(index) {
        $(`#question-answer-group-${index}`).remove();
        updateQuestionLabels();
    }

    // Function to update question labels after removal
    function updateQuestionLabels() {
        $('.question-answer-group').each(function (index) {
            $(this).find('label[for^="question"]').text(`Question ${index + 1}`);
            $(this).find('textarea').attr('id', `question${index + 1}`).attr('placeholder', `Enter question ${index + 1}`);
            $(this).find('label[for^="answer"]').text(`Answer ${index + 1}`);
            $(this).find('input').attr('id', `answer${index + 1}`).attr('placeholder', `Enter answer ${index + 1}`);
        });
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
        const title = $('#quiz-title').val(); // Get the title value

        if (!subject) {
            alert('Please select a subject!');
            return;
        }

        if (!title) {
            alert('Please enter a title!');
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
        const quizId = 'quiz-' + Date.now();
        //Data ne e kemi cuditerisht quizzes->subject->quizzes per subject->questions and answers
        quizzes[subject].push({ id: quizId, title: title, questions: quiz });

        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        // Reset the form fields
        $('#subject').val('');
        $('#quiz-title').val(''); // Reset the title field
        $('#questions-container').empty().append(createQuestionAnswerGroup(1));

        alert('Quiz submitted successfully!');
        window.location.href = 'listquizzes.html';
    });

    // Debugging: To verify localStorage structure, uncomment the following line
    console.log(quizzes);
});
