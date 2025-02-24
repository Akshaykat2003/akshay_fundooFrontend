const BASE_URL = 'http://localhost:3000/api/v1'; 

// Function to fetch all notes for the logged-in user
const fetchNotes = async () => {
    try {
        const token = sessionStorage.getItem('authToken'); 
        const response = await fetch(`${BASE_URL}/notes`, {
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
        console.log('Fetched Notes:', data.notes); 
        return data.notes;
    } catch (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
};



// Function to render notes on the dashboard
const renderNotes = (notes) => {
    const notesContainer = document.querySelector('.notes-container');
    if (!notesContainer) {
        console.error('Notes container not found in the DOM');
        return;
    }

    notesContainer.innerHTML = '';

    if (notes.length === 0) {
        notesContainer.innerHTML = '<p>No notes available</p>';
        return;
    }

    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `
            <input 
                type="text" 
                class="note-title" 
                placeholder="Enter title..." 
                value="${note.title || ''}"
            />
            <textarea 
                class="note-content" 
                placeholder="Write your content here..."
            >${note.content || ''}</textarea>
            
            <button onclick="toggleArchive(${note.id})">
                ${note.isArchived ? 'Unarchive' : 'Archive'}
            </button>

            <button onclick="toggleTrash(${note.id})">
                ${note.isTrashed ? 'Restore' : 'Trash'}
            </button>
        `;
        notesContainer.appendChild(noteElement);
    });
};



const createNote = async () => {
    const textarea = document.querySelector('.create-note-textarea');
    const noteContent = textarea.value.trim();
    
    if (!noteContent) return;

    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/notes/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: 'New Note', content: noteContent })
        });

        if (!response.ok) {
            alert('Failed to create note');
            console.error('Create Note Response Status:', response.status);
            return;
        }

        const createdNote = await response.json();
        console.log('Created Note:', createdNote);
        textarea.value = ''; 
        await initDashboard(); 
    } catch (error) {
        console.error('Error creating note:', error);
    }
};





const initDashboard = async () => {
    try {
        const notes = await fetchNotes();
        renderNotes(notes);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
};





const toggleArchive = async (noteId) => {
    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/notes/${noteId}/archive`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            alert('Failed to toggle archive status');
            console.error('Response Status:', response.status);
            return;
        }

        console.log('Archive status toggled successfully');
        await initDashboard();
    } catch (error) {
        console.error('Error toggling archive status:', error);
    }
};

const toggleTrash = async (noteId) => {
    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}/notes/${noteId}/trash`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            alert('Failed to toggle trash status');
            console.error('Response Status:', response.status);
            return;
        }

        console.log('Trash status toggled successfully');
        await initDashboard();
    } catch (error) {
        console.error('Error toggling trash status:', error);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    updateUserDropdown();
});

// Event Listener for Create Note Button
const addNoteBtn = document.querySelector('.add-note-btn');
if (addNoteBtn) {
    addNoteBtn.addEventListener('click', createNote);
}





























// function updateUserDropdown() {
//     const token = sessionStorage.getItem('authToken');
    
//     if (token) {
//         try {
//             // Decode JWT to inspect the payload
//             const payloadBase64 = token.split('.')[1];
//             const payload = JSON.parse(atob(payloadBase64));
            
//             console.log('Decoded Token Payload:', payload); // 🟢 Check what's inside
            
//             const email = payload.email; // Attempt to extract email
            
//             if (email) {
//                 document.querySelector('.user-email').textContent = email;
//                 console.log('Displayed Email:', email);
//             } else {
//                 console.warn('Email not found in token payload.');
//             }
//         } catch (e) {
//             console.error('Failed to parse JWT token:', e);
//         }
//     } else {
//         console.warn('No auth token found in sessionStorage.');
//     }
// }


// // Call this function on page load
// window.onload = updateUserDropdown;



// // Toggle Dropdown
// function toggleDropdown() {
//     const dropdown = document.getElementById('dropdownMenu');
//     dropdown.classList.toggle('show-dropdown');
//     updateUserDropdown(); 
// }

// // Logout
// function logout() {
//     alert('Logged out successfully!');
//     sessionStorage.clear();
//     window.location.href = 'userLogin.html';
// }

// // Close Dropdown
// window.onclick = function(event) {
//     if (!event.target.closest('.user-logo-container')) {
//         const dropdown = document.getElementById('dropdownMenu');
//         dropdown.classList.remove('show-dropdown');
//     }
// }

// Initialize on Page Load
