$(document).ready(function () {
    // Check authentication
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
                const subjectSelect = $('#subject');
                subjects.forEach(subject => {
                    subjectSelect.append(new Option(subject.name, subject.id));
                });
            },
            error: function(xhr) {
                console.error('Error loading subjects:', xhr.responseText);
            }
        });
    }

    function createAlternativeInput(questionIndex, alternativeIndex) {
        return `
            <div class="alternative-group mb-2" data-alternative="${alternativeIndex}">
                <div class="input-group">
                    <input type="text" class="form-control alternative-text" 
                           placeholder="Alternative ${alternativeIndex + 1}">
                    <div class="input-group-append">
                        <div class="input-group-text">
                            <input type="radio" name="correct-${questionIndex}" 
                                   class="correct-alternative">
                        </div>
                        <button type="button" class="btn btn-danger remove-alternative">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function createQuestionGroup(index) {
        const questionGroup = $(`
            <div class="question-group mb-4" data-question="${index}">
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
                            <textarea class="form-control question-text mb-3" rows="2"></textarea>
                            <div class="alternatives-container">
                                ${createAlternativeInput(index, 0)}
                                ${createAlternativeInput(index, 1)}
                            </div>
                            <button type="button" class="btn btn-secondary add-alternative mt-2">
                                Add Alternative
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        return questionGroup;
    }

    // Add first question
    $('#questions-container').append(createQuestionGroup(0));

    // Add question button handler
    $('#add-question-btn').click(function() {
        const questionCount = $('.question-group').length;
        $('#questions-container').append(createQuestionGroup(questionCount));
    });

    // Remove question handler
    $(document).on('click', '.remove-question', function() {
        $(this).closest('.question-group').remove();
        updateQuestionNumbers();
    });

    // Add alternative handler
    $(document).on('click', '.add-alternative', function() {
        const questionGroup = $(this).closest('.question-group');
        const questionIndex = questionGroup.data('question');
        const alternativesContainer = questionGroup.find('.alternatives-container');
        const alternativeCount = alternativesContainer.children().length;
        alternativesContainer.append(createAlternativeInput(questionIndex, alternativeCount));
    });

    // Remove alternative handler
    $(document).on('click', '.remove-alternative', function() {
        const alternativesContainer = $(this).closest('.alternatives-container');
        if (alternativesContainer.children().length > 2) {
            $(this).closest('.alternative-group').remove();
        } else {
            alert('Each question must have at least 2 alternatives');
        }
    });

    function updateQuestionNumbers() {
        $('.question-group').each(function(index) {
            $(this).find('h5').text(`Question ${index + 1}`);
            $(this).data('question', index);
            $(this).find('input[type="radio"]').attr('name', `correct-${index}`);
        });
    }

    // Submit quiz handler
    $('#submit-quiz').click(function() {
        const quiz = {
            title: $('#quiz-title').val().trim(),
            description: $('#quiz-description').val().trim(),
            subjectId: parseInt($('#subject').val()),
            questions: []
        };

        if (!quiz.title || !quiz.description || !quiz.subjectId) {
            alert('Please fill in all quiz details');
            return;
        }

        let isValid = true;
        $('.question-group').each(function() {
            const questionText = $(this).find('.question-text').val().trim();
            const alternatives = [];
            let hasCorrectAnswer = false;

            $(this).find('.alternative-group').each(function() {
                const alternativeText = $(this).find('.alternative-text').val().trim();
                const isCorrect = $(this).find('.correct-alternative').prop('checked');
                
                if (!alternativeText) {
                    isValid = false;
                    return false;
                }

                if (isCorrect) hasCorrectAnswer = true;

                alternatives.push({
                    text: alternativeText,
                    isCorrect: isCorrect
                });
            });

            if (!questionText || !hasCorrectAnswer) {
                isValid = false;
                return false;
            }

            quiz.questions.push({
                text: questionText,
                alternatives: alternatives
            });
        });

        if (!isValid) {
            alert('Please fill in all questions and mark correct answers');
            return;
        }

        $.ajax({
            url: 'https://localhost:7155/api/Quiz',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(quiz),
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                alert('Quiz created successfully!');
                window.location.href = 'listquizzes.html';
            },
            error: function(xhr) {
                alert('Error creating quiz: ' + xhr.responseText);
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
