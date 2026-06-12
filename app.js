// Code Snippet Manager - Fully Functional Implementation

// State management
let snippets = [];
let currentSnippetId = null;
let currentFilter = 'all';

// DOM Elements
const elements = {
    snippetList: document.getElementById('snippetList'),
    snippetTitle: document.getElementById('snippetTitle'),
    snippetLanguage: document.getElementById('snippetLanguage'),
    snippetTags: document.getElementById('snippetTags'),
    snippetCode: document.getElementById('snippetCode'),
    searchInput: document.getElementById('searchInput'),
    themeToggle: document.getElementById('themeToggle'),
    newSnippetBtn: document.getElementById('newSnippetBtn'),
    saveSnippetBtn: document.getElementById('saveSnippetBtn'),
    copySnippetBtn: document.getElementById('copySnippetBtn'),
    deleteSnippetBtn: document.getElementById('deleteSnippetBtn'),
    importExportToggle: document.getElementById('importExportToggle'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    modal: document.getElementById('modal'),
    importExportArea: document.getElementById('importExportArea'),
    importBtn: document.getElementById('importBtn'),
    exportBtn: document.getElementById('exportBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    notification: document.getElementById('notification'),
    charCount: document.getElementById('charCount'),
    lineCount: document.getElementById('lineCount'),
    snippetCount: document.getElementById('snippetCount'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// Initialize
function init() {
    loadSnippets();
    loadTheme();
    setupEventListeners();
    renderSnippetList();
    updateStats();
    
    // Load first snippet or show empty state
    if (snippets.length > 0) {
        loadSnippet(snippets[0].id);
    } else {
        showEmptyState();
    }
}

// Load snippets from localStorage
function loadSnippets() {
    try {
        const saved = localStorage.getItem('code-snippets');
        if (saved) {
            snippets = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Failed to load snippets:', e);
        snippets = [];
    }
}

// Save snippets to localStorage
function saveToStorage() {
    try {
        localStorage.setItem('code-snippets', JSON.stringify(snippets));
    } catch (e) {
        showNotification('Failed to save snippets', 'error');
    }
}

// Load theme preference
function loadTheme() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        elements.themeToggle.textContent = '☀️';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Snippet actions
    elements.newSnippetBtn.addEventListener('click', createNewSnippet);
    elements.saveSnippetBtn.addEventListener('click', saveSnippet);
    elements.copySnippetBtn.addEventListener('click', copySnippet);
    elements.deleteSnippetBtn.addEventListener('click', deleteSnippet);
    
    // Search
    elements.searchInput.addEventListener('input', debounce(renderSnippetList, 150));
    
    // Filters
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderSnippetList();
        });
    });
    
    // Import/Export
    elements.importExportToggle.addEventListener('click', openModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.importBtn.addEventListener('click', importSnippets);
    elements.exportBtn.addEventListener('click', exportSnippets);
    
    // Clear all
    elements.clearAllBtn.addEventListener('click', clearAllSnippets);
    
    // Stats update
    elements.snippetCode.addEventListener('input', updateStats);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
}

// Create new snippet
function createNewSnippet() {
    currentSnippetId = null;
    elements.snippetTitle.value = '';
    elements.snippetLanguage.value = 'javascript';
    elements.snippetTags.value = '';
    elements.snippetCode.value = '';
    updateStats();
    elements.snippetTitle.focus();
    showNotification('New snippet created', 'info');
}

// Save snippet
function saveSnippet() {
    const title = elements.snippetTitle.value.trim();
    const code = elements.snippetCode.value;
    
    if (!title) {
        showNotification('Please enter a title', 'error');
        elements.snippetTitle.focus();
        return;
    }
    
    if (!code.trim()) {
        showNotification('Please enter some code', 'error');
        elements.snippetCode.focus();
        return;
    }
    
    const snippet = {
        id: currentSnippetId || Date.now().toString(),
        title: title,
        language: elements.snippetLanguage.value,
        tags: elements.snippetTags.value.split(',').map(t => t.trim()).filter(t => t),
        code: code,
        createdAt: currentSnippetId ? (snippets.find(s => s.id === currentSnippetId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentSnippetId) {
        const index = snippets.findIndex(s => s.id === currentSnippetId);
        if (index !== -1) {
            snippets[index] = snippet;
        }
    } else {
        snippets.unshift(snippet);
        currentSnippetId = snippet.id;
    }
    
    saveToStorage();
    renderSnippetList();
    updateStats();
    showNotification('Snippet saved successfully!', 'success');
}

// Load snippet
function loadSnippet(id) {
    const snippet = snippets.find(s => s.id === id);
    if (!snippet) return;
    
    currentSnippetId = id;
    elements.snippetTitle.value = snippet.title;
    elements.snippetLanguage.value = snippet.language;
    elements.snippetTags.value = snippet.tags.join(', ');
    elements.snippetCode.value = snippet.code;
    
    // Update active state in list
    document.querySelectorAll('.snippet-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === id) {
            item.classList.add('active');
        }
    });
    
    updateStats();
}

// Delete snippet
function deleteSnippet() {
    if (!currentSnippetId) {
        showNotification('No snippet selected', 'error');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    
    snippets = snippets.filter(s => s.id !== currentSnippetId);
    saveToStorage();
    
    currentSnippetId = null;
    elements.snippetTitle.value = '';
    elements.snippetLanguage.value = 'javascript';
    elements.snippetTags.value = '';
    elements.snippetCode.value = '';
    
    renderSnippetList();
    updateStats();
    showNotification('Snippet deleted', 'info');
    
    if (snippets.length > 0) {
        loadSnippet(snippets[0].id);
    } else {
        showEmptyState();
    }
}

// Copy snippet
async function copySnippet() {
    const code = elements.snippetCode.value;
    if (!code) {
        showNotification('Nothing to copy', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(code);
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy', 'error');
    }
}

// Render snippet list
function renderSnippetList() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    
    let filtered = snippets.filter(s => {
        const matchesSearch = !searchTerm || 
            s.title.toLowerCase().includes(searchTerm) ||
            s.code.toLowerCase().includes(searchTerm) ||
            s.tags.some(t => t.toLowerCase().includes(searchTerm));
        
        const matchesFilter = currentFilter === 'all' || s.language === currentFilter;
        
        return matchesSearch && matchesFilter;
    });
    
    if (filtered.length === 0) {
        elements.snippetList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>${searchTerm ? 'No snippets found' : 'No snippets yet'}</p>
            </div>
        `;
        return;
    }
    
    elements.snippetList.innerHTML = filtered.map(s => `
        <div class="snippet-item ${s.id === currentSnippetId ? 'active' : ''}" data-id="${s.id}">
            <div class="snippet-item-header">
                <span class="snippet-title">${escapeHtml(s.title)}</span>
                <span class="snippet-lang">${s.language}</span>
            </div>
            <div class="snippet-preview">${escapeHtml(s.code.slice(0, 60))}${s.code.length > 60 ? '...' : ''}</div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.snippet-item').forEach(item => {
        item.addEventListener('click', () => loadSnippet(item.dataset.id));
    });
}

// Show empty state
function showEmptyState() {
    elements.snippetList.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <p>No snippets yet. Create your first one!</p>
        </div>
    `;
}

// Update stats
function updateStats() {
    const code = elements.snippetCode.value;
    elements.charCount.textContent = `${code.length} chars`;
    elements.lineCount.textContent = `${code.split('\n').length} lines`;
    elements.snippetCount.textContent = `${snippets.length} snippets`;
}

// Modal functions
function openModal() {
    elements.importExportArea.value = '';
    elements.modal.classList.remove('hidden');
}

function closeModal() {
    elements.modal.classList.add('hidden');
}

// Import snippets
function importSnippets() {
    const json = elements.importExportArea.value.trim();
    if (!json) {
        showNotification('Please paste JSON to import', 'error');
        return;
    }
    
    try {
        const imported = JSON.parse(json);
        if (Array.isArray(imported)) {
            snippets = [...imported, ...snippets];
            saveToStorage();
            renderSnippetList();
            updateStats();
            closeModal();
            showNotification(`Imported ${imported.length} snippets!`, 'success');
        } else if (imported.id) {
            snippets.unshift(imported);
            saveToStorage();
            renderSnippetList();
            updateStats();
            closeModal();
            showNotification('Imported 1 snippet!', 'success');
        } else {
            throw new Error('Invalid format');
        }
    } catch (e) {
        showNotification('Invalid JSON format', 'error');
    }
}

// Export snippets
function exportSnippets() {
    if (snippets.length === 0) {
        showNotification('No snippets to export', 'error');
        return;
    }
    
    const json = JSON.stringify(snippets, null, 2);
    elements.importExportArea.value = json;
    
    // Also download as file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippets-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Exported and downloaded!', 'success');
}

// Clear all snippets
function clearAllSnippets() {
    if (!confirm('Are you sure? This will delete ALL snippets permanently!')) return;
    
    snippets = [];
    currentSnippetId = null;
    saveToStorage();
    
    elements.snippetTitle.value = '';
    elements.snippetLanguage.value = 'javascript';
    elements.snippetTags.value = '';
    elements.snippetCode.value = '';
    
    renderSnippetList();
    updateStats();
    showEmptyState();
    showNotification('All snippets cleared', 'info');
}

// Keyboard shortcuts
function handleKeyboard(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                saveSnippet();
                break;
            case 'n':
                e.preventDefault();
                createNewSnippet();
                break;
            case 'f':
                e.preventDefault();
                elements.searchInput.focus();
                break;
        }
    }
}

// Notification
function showNotification(message, type = 'success') {
    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    
    setTimeout(() => {
        elements.notification.classList.add('hidden');
    }, 3000);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
