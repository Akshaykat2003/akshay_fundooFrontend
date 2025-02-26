



const BASE_URL = 'http://localhost:3000/api/v1';

let notesCache = []; // Local state to store notes

// Fetch notes from the server (only when necessary)
const fetchNotes = async (forceRefresh = false) => {
    try {
        const token = sessionStorage.getItem('authToken');
        if (!forceRefresh && notesCache.length > 0) {
            console.log('Using cached notes:', notesCache);
            return notesCache;
        }

        const timestamp = Date.now();
        const response = await fetch(`${BASE_URL}/notes?_=${timestamp}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            alert('Failed to fetch notes');
            console.error('Response Status:', response.status);
            return [];
        }

        const data = await response.json();
        console.log('Raw Fetched Notes:', JSON.stringify(data.notes, null, 2));
        notesCache = data.notes;
        return notesCache;
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
};

// Toggle Archive Status
const toggleArchive = async (noteId, currentView) => {
    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/notes/${noteId}/archive`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            alert('Failed to toggle archive status');
            console.error('Toggle archive failed:', response.status);
            return;
        }

        const result = await response.json();
        const updatedNote = result.note;

        const noteIndex = notesCache.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            notesCache[noteIndex] = updatedNote;
            console.log(`Updated note ${noteId} in cache:`, updatedNote);
            renderNotes(notesCache, currentView);
        }
    } catch (error) {
        console.error('Error archiving note:', error);
    }
};

// Toggle Trash Status
const toggleTrash = async (noteId, currentView) => {
    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/notes/${noteId}/trash`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            alert('Failed to toggle trash status');
            console.error('Toggle trash failed:', response.status);
            return;
        }

        const result = await response.json();
        const updatedNote = result.note;

        const noteIndex = notesCache.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            notesCache[noteIndex] = updatedNote;
            console.log(`Updated note ${noteId} in cache:`, updatedNote);
            renderNotes(notesCache, currentView);
        }
    } catch (error) {
        console.error('Error trashing note:', error);
    }
};

// Create a new note
const createNote = async () => {
    const noteInputContainer = document.querySelector('.note-input-container');
    if (!noteInputContainer) {
        console.error('Note input container not found');
        return;
    }

    const titleInput = noteInputContainer.querySelector('.note-title-input');
    const contentInput = noteInputContainer.querySelector('.note-content-input');
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title && !content) {
        noteInputContainer.classList.remove('expanded');
        return;
    }

    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/notes/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
            alert('Failed to create note');
            console.error('Create note failed:', response.status);
            return;
        }

        const result = await response.json();
        const newNote = result.note;

        notesCache.unshift(newNote);
        console.log('Created note:', newNote);
        renderNotes(notesCache, 'notes');

        titleInput.value = '';
        contentInput.value = '';
        noteInputContainer.classList.remove('expanded');
    } catch (error) {
        console.error('Error creating note:', error);
    }
};

// Update a note
const updateNote = async (noteId, currentView, title, content) => {
    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/notes/${noteId}`, {
            method: 'PUT', // Assuming your backend uses PUT for updates
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
            alert('Failed to update note');
            console.error('Update note failed:', response.status);
            return;
        }

        const result = await response.json();
        const updatedNote = result.note;

        const noteIndex = notesCache.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
            notesCache[noteIndex] = updatedNote;
            console.log(`Updated note ${noteId} in cache:`, updatedNote);
            renderNotes(notesCache, currentView);
        }
    } catch (error) {
        console.error('Error updating note:', error);
    }
};

// Change note color
const changeColor = async (noteId, currentView) => {
    const color = document.createElement('input');
    color.type = 'color';
    color.value = '#ffffff';
    color.onchange = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch(`${BASE_URL}/notes/${noteId}/change_color`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ color: color.value })
            });

            if (!response.ok) {
                alert('Failed to change note color');
                console.error('Change color failed:', response.status);
                return;
            }

            const result = await response.json();
            const updatedNote = result.note;

            const noteIndex = notesCache.findIndex(note => note.id === noteId);
            if (noteIndex !== -1) {
                notesCache[noteIndex] = updatedNote;
                console.log(`Updated note ${noteId} color to ${color.value} in cache:`, updatedNote);
                renderNotes(notesCache, currentView);
                // Update modal background if still open
                const modalContent = document.querySelector('.modal-content');
                if (modalContent) modalContent.style.backgroundColor = updatedNote.color || 'white';
            }
        } catch (error) {
            console.error('Error changing note color:', error);
        }
    };
    color.click();
};

// Render notes based on the current view
const renderNotes = (notes, view = 'notes') => {
    const notesContainer = document.querySelector('.notes-container');
    if (!notesContainer) {
        console.error('Notes container not found in the DOM');
        return;
    }

    console.log(`Rendering view: ${view}, Total notes received:`, notes.length);

    let filteredNotes = [];
    if (view === 'notes') {
        filteredNotes = notes.filter(note => !note.archived && !note.trashed);
    } else if (view === 'archives') {
        filteredNotes = notes.filter(note => note.archived && !note.trashed);
    } else if (view === 'bin') {
        filteredNotes = notes.filter(note => note.trashed);
    }

    console.log(`Filtered notes for ${view}:`, JSON.stringify(filteredNotes, null, 2));

    notesContainer.innerHTML = filteredNotes.length === 0 
        ? `<p>No ${view} available</p>` 
        : '';

    filteredNotes.forEach(note => {
        const existingNote = notesContainer.querySelector(`[data-id="${note.id}"]`);
        if (existingNote) {
            existingNote.style.backgroundColor = note.color || 'white';
            const archiveBtn = existingNote.querySelector('.icon-button[title="Archive"], .icon-button[title="Unarchive"]');
            const trashBtn = existingNote.querySelector('.icon-button[title="Trash"], .icon-button[title="Restore"]');
            archiveBtn.setAttribute('title', note.archived ? 'Unarchive' : 'Archive');
            trashBtn.setAttribute('title', note.trashed ? 'Restore' : 'Trash');
            trashBtn.querySelector('i').className = note.trashed ? 'fas fa-trash-restore' : 'fas fa-trash';
            return;
        }

        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.setAttribute('data-id', note.id);
        noteElement.style.backgroundColor = note.color || 'white';

        const archiveTitle = note.archived ? 'Unarchive' : 'Archive';
        const trashTitle = note.trashed ? 'Restore' : 'Trash';
        const trashIcon = note.trashed ? 'fas fa-trash-restore' : 'fas fa-trash';

        noteElement.innerHTML = `
            <div class="note-title">${note.title || ''}</div>
            <div class="note-content">${note.content || ''}</div>
            <div class="note-toolbar">
                <button class="icon-button" onclick="toggleArchive(${note.id}, '${view}')" title="${archiveTitle}">
                    <i class="fas fa-archive"></i>
                </button>
                <button class="icon-button" onclick="toggleTrash(${note.id}, '${view}')" title="${trashTitle}">
                    <i class="${trashIcon}"></i>
                </button>
                <button class="icon-button" onclick="changeColor(${note.id}, '${view}')" title="Change Color">
                    <i class="fas fa-palette"></i>
                </button>
            </div>
        `;

        noteElement.addEventListener('click', (e) => {
            if (!e.target.closest('.icon-button')) {
                expandNote(noteElement, note, view);
            }
        });

        notesContainer.prepend(noteElement);
    });
};

// Initialize the dashboard with a specific view
function initDashboard(view) {
    fetchNotes(true).then(notes => renderNotes(notes, view));
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            renderNotes(notesCache, view);
        });
    });
}

// Expand note as a modal with editable fields
function expandNote(noteElement, note, currentView) {
    const existingModal = document.querySelector('.note-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.classList.add('note-modal');

    const archiveTitle = note.archived ? 'Unarchive' : 'Archive';
    const trashTitle = note.trashed ? 'Restore' : 'Trash';
    const trashIcon = note.trashed ? 'fas fa-trash-restore' : 'fas fa-trash';

    modal.innerHTML = `
        <div class="modal-content" style="background-color: ${note.color || 'white'}">
            <div class="modal-header">
                <input type="text" class="modal-title" value="${note.title || ''}" placeholder="Title" />
                <button class="close-modal-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <textarea class="modal-content-text" placeholder="Take a note...">${note.content || ''}</textarea>
            </div>
            <div class="modal-toolbar">
                <button class="icon-button" onclick="toggleArchive(${note.id}, '${currentView}'); this.closest('.note-modal').remove()" title="${archiveTitle}">
                    <i class="fas fa-archive"></i>
                </button>
                <button class="icon-button" onclick="toggleTrash(${note.id}, '${currentView}'); this.closest('.note-modal').remove()" title="${trashTitle}">
                    <i class="${trashIcon}"></i>
                </button>
                <button class="icon-button" onclick="changeColor(${note.id}, '${currentView}')" title="Change Color">
                    <i class="fas fa-palette"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const titleInput = modal.querySelector('.modal-title');
    const contentInput = modal.querySelector('.modal-content-text');
    const closeBtn = modal.querySelector('.close-modal-btn');

    // Save changes and close modal
    const saveAndClose = () => {
        const newTitle = titleInput.value.trim();
        const newContent = contentInput.value.trim();
        if (newTitle !== (note.title || '') || newContent !== (note.content || '')) {
            updateNote(note.id, currentView, newTitle, newContent);
        }
        modal.remove();
    };

    closeBtn.addEventListener('click', saveAndClose);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            saveAndClose();
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initDashboard('notes');
    setupSidebarNavigation();

    const noteInputContainer = document.querySelector('.note-input-container');
    if (noteInputContainer) {
        const titleInput = noteInputContainer.querySelector('.note-title-input');
        const contentInput = noteInputContainer.querySelector('.note-content-input');

        titleInput.addEventListener('focus', () => {
            noteInputContainer.classList.add('expanded');
        });

        contentInput.addEventListener('focus', () => {
            noteInputContainer.classList.add('expanded');
        });

        noteInputContainer.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            createNote();
        });

        document.addEventListener('click', (e) => {
            if (!noteInputContainer.contains(e.target)) {
                createNote();
            }
        });
    }
});

function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('show-dropdown');
}

function logout() {
    alert('Logged out successfully!');
    sessionStorage.clear();
    window.location.href = 'userLogin.html';
}