$(document).ready(function() {
    // Check authentication status
    $.ajax({
        url: 'https://localhost:7155/api/User/current',
        method: 'GET',
        xhrFields: {
            withCredentials: true
        },
        success: function(response) {
            console.log('Authentication successful:', response);
            loadSubjects();
        },
        error: function(xhr) {
            console.error('Authentication error:', xhr.status, xhr.responseText);
            if (xhr.status === 401) {
                window.location.href = 'loginpage.html';
            }
        }
    });

    function loadSubjects() {
        console.log('Loading subjects...');
        $.ajax({
            url: 'https://localhost:7155/api/Subject',
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(subjects) {
                console.log('Subjects loaded:', subjects);
                const subjectSelect = $('#subject-selector');
                subjectSelect.html('<option value="all">All Subjects</option>');
                subjects.forEach(subject => {
                    subjectSelect.append(`<option value="${subject.id}">${subject.name}</option>`);
                });
                loadQuizzes();
            },
            error: function(xhr) {
                console.error('Subject loading error:', xhr.status, xhr.responseText);
                if (xhr.status === 401) {
                    window.location.href = 'loginpage.html';
                } else {
                    // Still try to load quizzes even if subjects fail to load
                    loadQuizzes();
                }
            }
        });
    }

    // Subject filter change handler
    $('#subject-selector').change(function() {
        loadQuizzes();
    });

    // Search input handler with debounce
    let searchTimeout;
    $('#searchInput').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
            loadQuizzes();
        }, 300); // Wait 300ms after user stops typing
    });

    function loadQuizzes() {
        const selectedSubject = $('#subject-selector').val();
        
        let url = 'https://localhost:7155/api/Quiz';
        if (selectedSubject && selectedSubject !== 'all') {
            url = `https://localhost:7155/api/Quiz/subject/${selectedSubject}`;
        }

        $('#quiz-list').html(`
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `);

        $.ajax({
            url: url,
            method: 'GET',
            xhrFields: {
                withCredentials: true
            },
            success: function(quizzes) {
                displayQuizzes(quizzes);
            },
            error: function(xhr) {
                console.error('Quiz loading error:', xhr.status, xhr.responseText);
                if (xhr.status === 401) {
                    window.location.href = 'loginpage.html';
                } else {
                    $('#quiz-list').html(`
                        <div class="alert alert-danger">
                            Error loading quizzes. Please try again later.
                        </div>
                    `);
                }
            }
        });
    }

    function displayQuizzes(quizzes) {
        const quizList = $('#quiz-list');
        quizList.empty();

        if (quizzes.length === 0) {
            quizList.html(`
                <div class="alert alert-info">
                    No quizzes found.
                </div>
            `);
            return;
        }

        quizzes.forEach(quiz => {
            const quizItem = `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1">${quiz.title}</h5>
                            <p class="mb-1">${quiz.description}</p>
                            <small class="text-muted">
                                Created by: ${quiz.creatorName} | 
                                Subject: ${quiz.subject.name} | 
                                Questions: ${quiz.questionCount} | 
                                Created: ${new Date(quiz.createdAt).toLocaleDateString()}
                            </small>
                        </div>
                        <a href="takequiz.html?id=${quiz.id}" class="btn btn-primary">Take Quiz</a>
                    </div>
                </div>
            `;
            quizList.append(quizItem);
        });
    }

    function updateQuizCount(count) {
        $('#quizCount').text(`${count} Quiz${count !== 1 ? 'zes' : ''} Found`);
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