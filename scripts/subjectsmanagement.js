$(document).ready(function() {
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
                const tbody = $('#subjectsTableBody');
                tbody.empty();
                subjects.forEach(function(subject) {
                    tbody.append(`
                        <tr>
                            <td>${subject.name}</td>
                            <td>${subject.description}</td>
                            <td>
                                <button class="btn btn-primary btn-sm me-2 edit-subject" 
                                        data-id="${subject.id}">Edit</button>
                                <button class="btn btn-danger btn-sm delete-subject" 
                                        data-id="${subject.id}">Delete</button>
                            </td>
                        </tr>
                    `);
                });
            },
            error: function(xhr) {
                alert('Error loading subjects');
            }
        });
    }

    // Form submission handler
    $('#subjectForm').submit(function(e) {
        e.preventDefault();
        const subjectId = $('#editSubjectId').val();
        const subjectData = {
            name: $('#subjectName').val(),
            description: $('#subjectDescription').val()
        };

        const url = subjectId ? 
            `https://localhost:7155/api/Subject/${subjectId}` : 
            'https://localhost:7155/api/Subject';
        const method = subjectId ? 'PUT' : 'POST';

        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json',
            data: JSON.stringify(subjectData),
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                resetForm();
                loadSubjects();
                alert(subjectId ? 'Subject updated successfully' : 'Subject created successfully');
            },
            error: function(xhr) {
                alert('Error saving subject');
            }
        });
    });

    // Edit subject handler
    $(document).on('click', '.edit-subject', function() {
        const subjectId = $(this).data('id');
        const row = $(this).closest('tr');
        
        $('#editSubjectId').val(subjectId);
        $('#subjectName').val(row.find('td:first').text());
        $('#subjectDescription').val(row.find('td:eq(1)').text());
        
        $('#formTitle').text('Edit Subject');
        $('#submitButton').text('Update Subject');
        $('#cancelButton').removeClass('d-none');
    });

    // Delete subject handler
    $(document).on('click', '.delete-subject', function() {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        const subjectId = $(this).data('id');
        $.ajax({
            url: `https://localhost:7155/api/Subject/${subjectId}`,
            method: 'DELETE',
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                loadSubjects();
                alert('Subject deleted successfully');
            },
            error: function(xhr) {
                alert('Error deleting subject');
            }
        });
    });

    // Cancel button handler
    $('#cancelButton').click(function() {
        resetForm();
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

    function resetForm() {
        $('#editSubjectId').val('');
        $('#subjectName').val('');
        $('#subjectDescription').val('');
        $('#formTitle').text('Add New Subject');
        $('#submitButton').text('Add Subject');
        $('#cancelButton').addClass('d-none');
    }
}); 