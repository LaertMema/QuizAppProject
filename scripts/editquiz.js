$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    if (!quizId) {
        alert('Quiz ID not provided!');
        window.location.href = 'myquizzes.html';
        return;
    }

    // Check authentication and load quiz data
    $.ajax({
        url: 'https://localhost:7155/api/User/current',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function() {
            loadQuizData();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                window.location.href = 'loginpage.html';
            }
        }
    });

    function loadQuizData() {
        $.ajax({
            url: `https://localhost:7155/api/Quiz/${quizId}`,
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(quiz) {
                populateQuizData(quiz);
            },
            error: function(xhr) {
                alert('Error loading quiz data');
                window.location.href = 'myquizzes.html';
            }
        });
    }

    function createAlternativeInput(questionIndex, alternative) {
        const text = alternative ? alternative.text.replace(/"/g, '&quot;') : '';
        return `
            <div class="alternative-group mb-2" data-alternative-id="${alternative?.id || ''}">
                <div class="input-group">
                    <input type="text" class="form-control alternative-text" 
                           value="${text}"
                           placeholder="Alternative text">
                    <div class="input-group-append">
                        <div class="input-group-text">
                            <input type="radio" name="correct-${questionIndex}" 
                                   class="correct-alternative"
                                   ${alternative?.isCorrect ? 'checked' : ''}>
                        </div>
                        <button type="button" class="btn btn-danger remove-alternative">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function createQuestionGroup(question, index) {
        const alternatives = question?.alternatives || [];
        const alternativesHtml = alternatives.length > 0 
            ? alternatives.map(alt => createAlternativeInput(index, alt)).join('')
            : createAlternativeInput(index) + createAlternativeInput(index);

        return $(`
            <div class="question-group mb-4" data-question-id="${question?.id || ''}" data-question="${index}">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Question ${index + 1}</h5>
                        <button type="button" class="btn btn-danger remove-question">
                            Remove Question
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label>Question Text</label>
                            <textarea class="form-control question-text mb-3" rows="2">${question?.text || ''}</textarea>
                            <div class="alternatives-container">
                                ${alternativesHtml}
                            </div>
                            <button type="button" class="btn btn-secondary add-alternative mt-2">
                                Add Alternative
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    function populateQuizData(quiz) {
        $('#quiz-title').val(quiz.title);
        $('#quiz-description').val(quiz.description);
        
        // Load subject
        const $subject = $('#subject');
        $subject.empty().append(new Option(quiz.subject.name, quiz.subject.id));
        
        // Load questions and their alternatives
        const $questionsContainer = $('#questions-container');
        $questionsContainer.empty();
        
        quiz.questions.forEach((question, index) => {
            const $questionGroup = createQuestionGroup(question, index);
            $questionsContainer.append($questionGroup);
        });
    }

    // Event handlers
    $('#add-question-btn').click(function() {
        const questionCount = $('.question-group').length;
        $('#questions-container').append(createQuestionGroup(null, questionCount));
    });

    $(document).on('click', '.remove-question', function() {
        if ($('.question-group').length <= 1) {
            alert('Quiz must have at least one question');
            return;
        }
        $(this).closest('.question-group').remove();
        updateQuestionNumbers();
    });

    $(document).on('click', '.add-alternative', function() {
        const questionGroup = $(this).closest('.question-group');
        const questionIndex = questionGroup.data('question');
        const alternativesContainer = questionGroup.find('.alternatives-container');
        alternativesContainer.append(createAlternativeInput(questionIndex));
    });

    $(document).on('click', '.remove-alternative', function() {
        const alternativesContainer = $(this).closest('.alternatives-container');
        if (alternativesContainer.children().length <= 2) {
            alert('Each question must have at least 2 alternatives');
            return;
        }
        $(this).closest('.alternative-group').remove();
    });

    function updateQuestionNumbers() {
        $('.question-group').each(function(index) {
            $(this).find('h5').text(`Question ${index + 1}`);
            $(this).data('question', index);
            $(this).find('input[type="radio"]').attr('name', `correct-${index}`);
        });
    }

    // Save changes
    $('#save-quiz').click(function() {
        const quiz = {
            id: parseInt(quizId),
            title: $('#quiz-title').val().trim(),
            description: $('#quiz-description').val().trim(),
            subjectId: parseInt($('#subject').val()),
            questions: []
        };

        if (!quiz.title || !quiz.description) {
            alert('Please fill in all quiz details');
            return;
        }

        let isValid = true;
        $('.question-group').each(function() {
            const questionId = $(this).data('question-id');
            const questionText = $(this).find('.question-text').val().trim();
            const alternatives = [];
            let hasCorrectAnswer = false;

            $(this).find('.alternative-group').each(function() {
                const alternativeId = $(this).data('alternative-id');
                const alternativeText = $(this).find('.alternative-text').val().trim();
                const isCorrect = $(this).find('.correct-alternative').prop('checked');
                
                if (!alternativeText) {
                    isValid = false;
                    return false;
                }

                if (isCorrect) hasCorrectAnswer = true;

                alternatives.push({
                    id: alternativeId ? parseInt(alternativeId) : undefined,
                    text: alternativeText,
                    isCorrect: isCorrect
                });
            });

            if (!questionText || !hasCorrectAnswer || alternatives.length < 2) {
                isValid = false;
                return false;
            }

            quiz.questions.push({
                id: questionId ? parseInt(questionId) : undefined,
                text: questionText,
                alternatives: alternatives
            });
        });

        if (!isValid) {
            alert('Please fill in all questions, mark correct answers, and ensure at least 2 alternatives per question');
            return;
        }

        $.ajax({
            url: `https://localhost:7155/api/Quiz/${quizId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(quiz),
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                alert('Quiz updated successfully!');
                window.location.href = 'listquizzes.html';
            },
            error: function(xhr) {
                alert('Error updating quiz: ' + xhr.responseText);
            }
        });
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