// Code Snippet Manager - Fully Functional Implementation

// State management
let snippets = [];
let currentSnippetId = null;
let currentFilter = 'all';

// Undo/Redo history
let history = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

// Notification Manager
const NotificationManager = {
    enabled: false,
    permission: 'default',
    
    init() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
            if (this.permission === 'granted') {
                this.enabled = true;
            }
        }
    },
    
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return false;
        }
        
        try {
            const result = await Notification.requestPermission();
            this.permission = result;
            this.enabled = result === 'granted';
            return this.enabled;
        } catch (e) {
            console.error('Notification permission error:', e);
            return false;
        }
    },
    
    notify(title, body, options = {}) {
        if (!this.enabled || this.permission !== 'granted') return;
        
        try {
            const notification = new Notification(title, {
                body,
                icon: '💡',
                badge: '💡',
                tag: options.tag || 'code-snippet-manager',
                requireInteraction: options.requireInteraction || false,
                silent: options.silent || false,
                ...options
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
                if (options.onClick) options.onClick();
            };
            
            // Auto-close after 5 seconds unless requireInteraction is true
            if (!options.requireInteraction) {
                setTimeout(() => notification.close(), 5000);
            }
            
            return notification;
        } catch (e) {
            console.error('Notification error:', e);
        }
    },
    
    notifySnippetSaved(snippet) {
        this.notify(
            'Snippet Saved!',
            `"${snippet.title}" has been saved successfully.`,
            { tag: 'snippet-saved' }
        );
    },
    
    notifySnippetDeleted(title) {
        this.notify(
            'Snippet Deleted',
            `"${title}" has been deleted.`,
            { tag: 'snippet-deleted' }
        );
    },
    
    notifyDailyReminder(count) {
        this.notify(
            'Snippet Manager',
            `You have ${count} snippets. Keep coding! 💪`,
            { 
                tag: 'daily-reminder',
                requireInteraction: false,
                silent: true
            }
        );
    },
    
    notifyBackupReminder() {
        this.notify(
            '💾 Backup Reminder',
            'It\'s been a while since you exported your snippets. Keep them safe!',
            { 
                tag: 'backup-reminder',
                requireInteraction: true
            }
        );
    }
};

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
    duplicateSnippetBtn: document.getElementById('duplicateSnippetBtn'),
    importExportToggle: document.getElementById('importExportToggle'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    shortcutsBtn: document.getElementById('shortcutsBtn'),
    statsBtn: document.getElementById('statsBtn'),
    modal: document.getElementById('modal'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    statsModal: document.getElementById('statsModal'),
    importExportArea: document.getElementById('importExportArea'),
    importBtn: document.getElementById('importBtn'),
    exportBtn: document.getElementById('exportBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn'),
    closeStatsBtn: document.getElementById('closeStatsBtn'),
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
    NotificationManager.init();
    setupEventListeners();
    renderSnippetList();
    updateStats();
    
    // Load first snippet or show empty state
    if (snippets.length > 0) {
        loadSnippet(snippets[0].id);
    } else {
        showEmptyState();
    }
    
    // Save initial state to history
    saveHistory();
    
    // Setup notification features
    setupNotificationFeatures();
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

// History management
function saveHistory() {
    // Remove any future history if we're not at the end
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    
    // Add current state to history
    history.push({
        snippets: JSON.parse(JSON.stringify(snippets)),
        currentSnippetId: currentSnippetId
    });
    
    // Limit history size
    if (history.length > MAX_HISTORY) {
        history.shift();
    } else {
        historyIndex++;
    }
    
    updateUndoRedoButtons();
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        const state = history[historyIndex];
        snippets = JSON.parse(JSON.stringify(state.snippets));
        currentSnippetId = state.currentSnippetId;
        saveToStorage();
        renderSnippetList();
        if (currentSnippetId) {
            loadSnippet(currentSnippetId);
        } else {
            createNewSnippet();
        }
        showNotification('Undo', 'info');
        updateUndoRedoButtons();
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        const state = history[historyIndex];
        snippets = JSON.parse(JSON.stringify(state.snippets));
        currentSnippetId = state.currentSnippetId;
        saveToStorage();
        renderSnippetList();
        if (currentSnippetId) {
            loadSnippet(currentSnippetId);
        } else {
            createNewSnippet();
        }
        showNotification('Redo', 'info');
        updateUndoRedoButtons();
    }
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
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
    if (elements.duplicateSnippetBtn) {
        elements.duplicateSnippetBtn.addEventListener('click', duplicateSnippet);
    }
    
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
    
    // Shortcuts modal
    if (elements.shortcutsBtn) {
        elements.shortcutsBtn.addEventListener('click', openShortcutsModal);
    }
    if (elements.closeShortcutsBtn) {
        elements.closeShortcutsBtn.addEventListener('click', closeShortcutsModal);
    }
    
    // Stats modal
    if (elements.statsBtn) {
        elements.statsBtn.addEventListener('click', openStatsModal);
    }
    if (elements.closeStatsBtn) {
        elements.closeStatsBtn.addEventListener('click', closeStatsModal);
    }
    
    // Notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.style.display = NotificationManager.permission === 'default' ? 'block' : 'none';
        notificationBtn.addEventListener('click', async () => {
            const granted = await NotificationManager.requestPermission();
            if (granted) {
                notificationBtn.style.display = 'none';
                showNotification('Notifications enabled!', 'success');
                NotificationManager.notify(
                    'Code Snippet Manager',
                    'Notifications are now enabled. You\'ll get updates on saves and daily reminders!',
                    { requireInteraction: false }
                );
            } else {
                showNotification('Notification permission denied', 'error');
            }
        });
    }
    
    // Clear all
    elements.clearAllBtn.addEventListener('click', clearAllSnippets);
    
    // Stats update
    elements.snippetCode.addEventListener('input', updateStats);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Close modals on outside click
    document.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
        if (e.target === elements.shortcutsModal) closeShortcutsModal();
        if (e.target === elements.statsModal) closeStatsModal();
    });
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
    saveHistory();
    renderSnippetList();
    updateStats();
    showNotification('Snippet saved successfully!', 'success');
    
    // Browser notification
    NotificationManager.notifySnippetSaved(snippet);
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
    
    const snippet = snippets.find(s => s.id === currentSnippetId);
    const snippetTitle = snippet ? snippet.title : 'Snippet';
    
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    
    snippets = snippets.filter(s => s.id !== currentSnippetId);
    saveToStorage();
    saveHistory();
    
    currentSnippetId = null;
    elements.snippetTitle.value = '';
    elements.snippetLanguage.value = 'javascript';
    elements.snippetTags.value = '';
    elements.snippetCode.value = '';
    
    renderSnippetList();
    updateStats();
    showNotification('Snippet deleted', 'info');
    
    // Browser notification
    NotificationManager.notifySnippetDeleted(snippetTitle);
    
    if (snippets.length > 0) {
        loadSnippet(snippets[0].id);
    } else {
        showEmptyState();
    }
}

// Duplicate snippet
function duplicateSnippet() {
    if (!currentSnippetId) {
        showNotification('No snippet to duplicate', 'error');
        return;
    }
    
    const original = snippets.find(s => s.id === currentSnippetId);
    if (!original) return;
    
    const duplicate = {
        id: Date.now().toString(),
        title: original.title + ' (Copy)',
        language: original.language,
        tags: [...original.tags],
        code: original.code,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    snippets.unshift(duplicate);
    saveToStorage();
    saveHistory();
    currentSnippetId = duplicate.id;
    renderSnippetList();
    loadSnippet(duplicate.id);
    showNotification('Snippet duplicated!', 'success');
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

function openShortcutsModal() {
    elements.shortcutsModal.classList.remove('hidden');
}

function closeShortcutsModal() {
    elements.shortcutsModal.classList.add('hidden');
}

// Statistics Modal functions
function openStatsModal() {
    elements.statsModal.classList.remove('hidden');
    renderStatistics();
}

function closeStatsModal() {
    elements.statsModal.classList.add('hidden');
}

// Render Statistics Dashboard
function renderStatistics() {
    if (snippets.length === 0) {
        document.getElementById('statTotalSnippets').textContent = '0';
        document.getElementById('statTotalChars').textContent = '0';
        document.getElementById('statAvgLength').textContent = '0';
        document.getElementById('statLanguages').textContent = '0';
        document.getElementById('languageChart').innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No data available yet</p>';
        document.getElementById('tagsCloud').innerHTML = '<p style="color: var(--text-secondary);">No tags yet</p>';
        document.getElementById('activityChart').innerHTML = '<p style="color: var(--text-secondary);">No activity yet</p>';
        return;
    }
    
    // Calculate statistics
    const totalSnippets = snippets.length;
    const totalChars = snippets.reduce((sum, s) => sum + s.code.length, 0);
    const avgLength = Math.round(totalChars / totalSnippets);
    
    // Count by language
    const languageCounts = {};
    snippets.forEach(s => {
        languageCounts[s.language] = (languageCounts[s.language] || 0) + 1;
    });
    const languagesUsed = Object.keys(languageCounts).length;
    
    // Count tags
    const tagCounts = {};
    snippets.forEach(s => {
        s.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    
    // Activity by date (last 7 days)
    const activityData = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        activityData[key] = { date: key, display: d.toLocaleDateString('en', { weekday: 'short' }), count: 0 };
    }
    
    snippets.forEach(s => {
        const date = s.createdAt.split('T')[0];
        if (activityData[date]) {
            activityData[date].count++;
        }
    });
    
    // Update stat cards
    document.getElementById('statTotalSnippets').textContent = totalSnippets.toLocaleString();
    document.getElementById('statTotalChars').textContent = totalChars.toLocaleString();
    document.getElementById('statAvgLength').textContent = avgLength.toLocaleString();
    document.getElementById('statLanguages').textContent = languagesUsed;
    
    // Render language chart
    const sortedLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    const maxCount = sortedLanguages[0][1];
    
    document.getElementById('languageChart').innerHTML = sortedLanguages.map(([lang, count]) => {
        const percentage = (count / totalSnippets) * 100;
        const width = (count / maxCount) * 100;
        return `
            <div class="language-bar">
                <span class="language-label">${lang}</span>
                <div class="language-progress">
                    <div class="language-fill lang-${lang}" style="width: ${width}%">
                        <span>${count}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Render tags cloud
    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const tagColors = [
        'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
    ];
    
    document.getElementById('tagsCloud').innerHTML = sortedTags.map(([tag, count], i) => `
        <span class="tag-badge" style="background: ${tagColors[i % tagColors.length]}; color: white;">
            <span class="tag-name">${escapeHtml(tag)}</span>
            <span class="tag-count">${count}</span>
        </span>
    `).join('');
    
    // Render activity chart
    const activityValues = Object.values(activityData);
    const maxActivity = Math.max(...activityValues.map(a => a.count), 1);
    
    document.getElementById('activityChart').innerHTML = activityValues.map(day => {
        const height = day.count > 0 ? (day.count / maxActivity) * 100 : 5;
        const opacity = day.count > 0 ? 0.5 + (day.count / maxActivity) * 0.5 : 0.2;
        return `
            <div class="activity-bar-wrapper">
                <div class="activity-bar" style="height: ${height}%; opacity: ${opacity}" data-count="${day.count} snippet${day.count !== 1 ? 's' : ''}"></div>
                <span class="activity-label">${day.display}</span>
            </div>
        `;
    }).join('');
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
            saveHistory();
            renderSnippetList();
            updateStats();
            closeModal();
            showNotification(`Imported ${imported.length} snippets!`, 'success');
        } else if (imported.id) {
            snippets.unshift(imported);
            saveToStorage();
            saveHistory();
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
    
    // Track export date for backup reminder
    localStorage.setItem('lastExportDate', Date.now().toString());
    
    showNotification('Exported and downloaded!', 'success');
}

// Clear all snippets
function clearAllSnippets() {
    if (!confirm('Are you sure? This will delete ALL snippets permanently!')) return;
    
    snippets = [];
    currentSnippetId = null;
    saveToStorage();
    saveHistory();
    
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
            case 'd':
                e.preventDefault();
                duplicateSnippet();
                break;
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
            case 'y':
                e.preventDefault();
                redo();
                break;
            case '/':
                e.preventDefault();
                if (e.shiftKey) {
                    openShortcutsModal();
                }
                break;
        }
    }
    
    // Ctrl+Shift+S for stats
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        openStatsModal();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        closeModal();
        closeShortcutsModal();
        closeStatsModal();
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

// Setup notification features
function setupNotificationFeatures() {
    // Request permission on first save attempt if not already granted
    const originalSave = saveSnippet;
    saveSnippet = function() {
        if (NotificationManager.permission === 'default') {
            NotificationManager.requestPermission().then(granted => {
                if (granted) {
                    console.log('Notifications enabled!');
                }
            });
        }
        return originalSave.apply(this, arguments);
    };
    
    // Daily reminder (check every hour)
    setInterval(() => {
        const lastReminder = localStorage.getItem('lastDailyReminder');
        const now = new Date();
        const today = now.toDateString();
        
        if (lastReminder !== today && snippets.length > 0) {
            NotificationManager.notifyDailyReminder(snippets.length);
            localStorage.setItem('lastDailyReminder', today);
        }
    }, 3600000); // Check every hour
    
    // Backup reminder (every 7 days)
    setInterval(() => {
        const lastExport = localStorage.getItem('lastExportDate');
        if (lastExport) {
            const daysSinceExport = (Date.now() - parseInt(lastExport)) / (1000 * 60 * 60 * 24);
            if (daysSinceExport >= 7 && snippets.length > 5) {
                NotificationManager.notifyBackupReminder();
            }
        }
    }, 86400000); // Check once per day
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
