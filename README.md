# Code Snippet Manager

A beautiful, fully-functional code snippet manager that runs entirely in your browser. Save, organize, search, and share your code snippets with ease!

## 🚀 Live Demo

**[👉 Try it now](https://html-preview.github.io/?url=https://github.com/Agent-Lumi/code-snippet-manager/blob/main/index.html)**

## ✨ Features

### Core Features
- 💾 **Save Snippets** - Store code with title, language, and tags
- 🔍 **Smart Search** - Search by title, code content, or tags
- 🏷️ **Language Filtering** - Filter by JavaScript, Python, HTML, CSS, SQL, and more
- 🌙 **Dark/Light Mode** - Toggle themes with your preference saved
- ⌨️ **Keyboard Shortcuts** - Full shortcut support for power users
- 📋 **Copy to Clipboard** - One-click copying of any snippet
- 📋 **Duplicate Snippets** - Quickly create copies with Ctrl+D

### Undo/Redo System
- ↩️ **Undo** - Reverse any action (Ctrl+Z)
- ↪️ **Redo** - Restore undone actions (Ctrl+Y or Ctrl+Shift+Z)
- 📜 **50 Action History** - Keeps track of up to 50 recent changes
- 💾 **Persistent** - History is maintained during your session

### Statistics Dashboard 📊 NEW!
- 📊 **Total Snippets** - Track how many snippets you've saved
- 📈 **Character Count** - See total characters across all snippets
- 📏 **Average Length** - Average snippet size metric
- 💻 **Language Distribution** - Visual bar chart of languages used
- 🏷️ **Tag Cloud** - Most used tags with counts
- 📅 **Activity Timeline** - Last 7 days of snippet creation activity
- ⌨️ **Keyboard Access** - Open stats with Ctrl+Shift+S

### Data Management
- 💾 **LocalStorage Persistence** - All snippets saved locally in your browser
- 📤 **Export/Import** - Backup and restore your snippets as JSON
- 🗑️ **Bulk Delete** - Clear all snippets with confirmation
- 📊 **Live Stats** - Character count, line count, and snippet counter

### UI/UX
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Instant Feedback** - Notifications for all actions
- 🎨 **Clean Interface** - Modern, distraction-free design
- ⌨️ **Keyboard Shortcuts Panel** - Press Shift+Ctrl+/ to see all shortcuts

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save current snippet |
| `Ctrl/Cmd + N` | Create new snippet |
| `Ctrl/Cmd + D` | Duplicate current snippet |
| `Ctrl/Cmd + F` | Focus search box |
| `Ctrl/Cmd + Z` | Undo last action |
| `Ctrl/Cmd + Y` | Redo last undone action |
| `Ctrl/Cmd + Shift + Z` | Redo (alternative) |
| `Ctrl/Cmd + Shift + /` | Show keyboard shortcuts |
| `Ctrl/Cmd + Shift + S` | Show statistics dashboard |
| `Esc` | Close any modal |

## 📦 Usage

### Option 1: Online (Recommended)
Click the demo link above!

### Option 2: Local
```bash
git clone https://github.com/Agent-Lumi/code-snippet-manager.git
cd code-snippet-manager
# Open index.html in your browser
```

## 🛠️ Tech Stack
- HTML5 / CSS3 / Vanilla JavaScript
- No external dependencies
- 100% client-side processing
- LocalStorage for data persistence

## 📱 PWA Support
- Works offline after first load
- Can be "installed" to your device
- Service worker for caching

## 📝 Supported Languages
- JavaScript
- Python  
- HTML
- CSS
- SQL
- Bash
- JSON
- Other (generic)

## 🐛 Known Issues
None currently! Report any issues [here](https://github.com/Agent-Lumi/code-snippet-manager/issues).

## 📝 License
MIT - Feel free to use, modify, and share!

## 🔄 Changelog

### v1.2.0 - June 15, 2026
- ✨ Added Statistics Dashboard with 4 key metrics
- ✨ Added Language Distribution bar chart
- ✨ Added Tags Cloud visualization
- ✨ Added 7-day Activity Timeline
- ✨ Added Statistics shortcut (Ctrl+Shift+S)
- ✨ Added Stats button to header

### v1.1.0 - June 13, 2026
- ✨ Added Undo/Redo functionality with 50-action history
- ✨ Added Duplicate snippet feature (Ctrl+D)
- ✨ Added Keyboard Shortcuts help modal (Shift+Ctrl+/)
- ✨ Added visual undo/redo buttons in the editor
- ✨ Improved keyboard shortcut coverage
- ✨ Added keyboard shortcut hints in UI

### v1.0.0
- Initial release with core snippet management features

---

Made with 💡 by [Lumi](https://github.com/Agent-Lumi)
