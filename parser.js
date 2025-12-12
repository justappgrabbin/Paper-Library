// app.js - Main application logic and UI handling

class App {
    constructor() {
        this.currentEditId = null;
        this.currentFilter = 'all';
        this.init();
    }
    
    // Initialize app
    async init() {
        this.setupEventListeners();
        this.render();
        this.updateStats();
        
        // Initialize knowledge tab
        if (typeof knowledge !== 'undefined') {
            knowledge.init();
        }
        
        // Check LlamaFile status
        await this.checkLlamaStatus();
        setInterval(() => this.checkLlamaStatus(), 10000);
    }
    
    // Setup event listeners
    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        // Click to upload
        dropZone.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            fileInput.value = '';
        });
        
        // Endpoint change
        document.getElementById('llamaEndpoint').addEventListener('change', (e) => {
            analyzer.endpoint = e.target.value;
            this.checkLlamaStatus();
        });
    }
    
    // Check LlamaFile status
    async checkLlamaStatus() {
        const endpoint = document.getElementById('llamaEndpoint').value;
        analyzer.endpoint = endpoint;
        
        const online = await analyzer.checkStatus();
        
        const statusEl = document.getElementById('llamaStatus');
        const dotEl = document.getElementById('statusDot');
        const textEl = document.getElementById('statusText');
        
        if (online) {
            statusEl.className = 'llama-status online';
            dotEl.className = 'status-dot online';
            textEl.textContent = 'LlamaFile: Online ✓';
        } else {
            statusEl.className = 'llama-status offline';
            dotEl.className = 'status-dot';
            textEl.textContent = 'LlamaFile: Offline';
        }
    }
    
    // Handle uploaded files
    async handleFiles(files) {
        this.showLog();
        const dropZone = document.getElementById('dropZone');
        dropZone.classList.add('processing');
        
        for (const file of files) {
            this.log(`Processing: ${file.name}`);
            
            if (file.name.endsWith('.zip')) {
                await this.handleZipFile(file);
            } else {
                await this.handleSingleFile(file);
            }
        }
        
        dropZone.classList.remove('processing');
        this.render();
        this.updateStats();
        this.log('✓ All files processed!', 'success');
    }
    
    // Handle ZIP file
    async handleZipFile(file) {
        try {
            const zip = await JSZip.loadAsync(file);
            this.log(`📦 Unpacking ZIP: ${file.name}`);
            
            let count = 0;
            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (!zipEntry.dir && parser.isValid(path)) {
                    const content = await zipEntry.async('text');
                    await this.processFileContent(path, content);
                    count++;
                }
            }
            
            this.log(`✓ Extracted ${count} files from ${file.name}`, 'success');
        } catch (error) {
            this.log(`✗ Error unpacking ${file.name}: ${error.message}`, 'error');
        }
    }
    
    // Handle single file
    async handleSingleFile(file) {
        if (!parser.isValid(file.name)) {
            this.log(`⊘ Skipped: ${file.name} (unsupported type)`, 'error');
            return;
        }
        
        try {
            const content = await file.text();
            await this.processFileContent(file.name, content);
        } catch (error) {
            this.log(`✗ Error reading ${file.name}: ${error.message}`, 'error');
        }
    }
    
    // Process file content
    async processFileContent(filename, content) {
        try {
            // Parse file
            const parsed = await parser.parseFile(filename, content);
            
            // Analyze
            const autoAnalyze = document.getElementById('autoAnalyze').checked;
            const deepAnalysis = document.getElementById('deepAnalysis').checked;
            
            this.log(`🔍 Analyzing ${filename}...`);
            const analyzed = await analyzer.analyze(parsed, autoAnalyze, deepAnalysis);
            
            // Add to library
            library.add(analyzed);
            
            this.log(`✓ Added: ${filename} → ${analyzer.getEnergyIcon(analyzed.energy)} ${analyzed.energy}`, 'success');
        } catch (error) {
            this.log(`✗ Failed to process ${filename}: ${error.message}`, 'error');
        }
    }
    
    // Render library
    render() {
        const grid = document.getElementById('libraryGrid');
        let apps = library.getAll();
        
        // Apply filter
        if (this.currentFilter !== 'all') {
            apps = apps.filter(app => app.energy === this.currentFilter);
        }
        
        // Apply search
        const searchQuery = document.getElementById('searchInput')?.value;
        if (searchQuery) {
            apps = library.search(searchQuery);
        }
        
        if (apps.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <h3>No apps found</h3>
                    <p>${this.currentFilter !== 'all' ? 'Try a different filter' : 'Drop some files above to get started!'}</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = apps.map(app => this.renderAppCard(app)).join('');
    }
    
    // Render app card
    renderAppCard(app) {
        const icon = analyzer.getEnergyIcon(app.energy);
        
        return `
            <div class="app-card" onclick="app.viewApp('${app.id}')">
                <div class="app-header">
                    <div class="app-icon">${icon}</div>
                    <div class="app-title">
                        <h3>${app.name}</h3>
                        <div class="file-name">${app.filename}</div>
                    </div>
                </div>
                <div class="app-glyphs">
                    <span class="glyph energy-${app.energy}">
                        ${icon} ${app.energy}
                    </span>
                    ${app.fileType ? `<span class="glyph" style="background: #e9ecef; color: #495057;">${app.fileType}</span>` : ''}
                </div>
                <div class="app-description">
                    ${app.description || 'No description yet. Click Edit to add one.'}
                </div>
                ${app.tags && app.tags.length > 0 ? `
                    <div class="app-tags">
                        ${app.tags.slice(0, 5).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        ${app.tags.length > 5 ? `<span class="tag">+${app.tags.length - 5}</span>` : ''}
                    </div>
                ` : ''}
                ${app.bestFor ? `
                    <div style="margin-top: 10px; padding: 8px; background: #e7f3ff; border-radius: 5px; font-size: 0.85em;">
                        <strong>Best for:</strong> ${app.bestFor}
                    </div>
                ` : ''}
                <div class="app-actions">
                    <button class="btn-edit" onclick="event.stopPropagation(); app.editApp('${app.id}')">✏️ Edit</button>
                    <button class="btn-delete" onclick="event.stopPropagation(); app.deleteApp('${app.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    }
    
    // Update stats
    updateStats() {
        const stats = library.getStats();
        document.getElementById('totalApps').textContent = stats.total;
        document.getElementById('energeticApps').textContent = stats.energetic;
        document.getElementById('flowingApps').textContent = stats.flowing;
        document.getElementById('calmApps').textContent = stats.calm;
        document.getElementById('focusedApps').textContent = stats.focused;
        document.getElementById('spiralApps').textContent = stats.spiral;
    }
    
    // Filter library
    filterLibrary(filter) {
        this.currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.render();
    }
    
    // Search library
    searchLibrary() {
        this.render();
    }
    
    // View app
    viewApp(id) {
        this.editApp(id);
    }
    
    // Edit app
    editApp(id) {
        this.currentEditId = id;
        const appData = library.get(id);
        
        if (!appData) return;
        
        document.getElementById('editName').value = appData.name;
        document.getElementById('editDescription').value = appData.description || '';
        document.getElementById('editTags').value = (appData.tags || []).join(', ');
        document.getElementById('editBestFor').value = appData.bestFor || '';
        
        // Select current energy
        document.querySelectorAll('.glyph-option').forEach(el => {
            el.classList.remove('selected');
            if (el.dataset.energy === appData.energy) {
                el.classList.add('selected');
            }
        });
        
        document.getElementById('editModal').classList.add('active');
    }
    
    // Select energy
    selectEnergy(energy) {
        document.querySelectorAll('.glyph-option').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelector(`[data-energy="${energy}"]`).classList.add('selected');
    }
    
    // Close edit modal
    closeEditModal() {
        document.getElementById('editModal').classList.remove('active');
        this.currentEditId = null;
    }
    
    // Save edit
    saveEdit(event) {
        event.preventDefault();
        
        if (!this.currentEditId) return;
        
        const selectedEnergy = document.querySelector('.glyph-option.selected');
        
        const updates = {
            name: document.getElementById('editName').value,
            description: document.getElementById('editDescription').value,
            energy: selectedEnergy ? selectedEnergy.dataset.energy : 'focused',
            tags: document.getElementById('editTags').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t),
            bestFor: document.getElementById('editBestFor').value
        };
        
        library.update(this.currentEditId, updates);
        this.render();
        this.updateStats();
        this.closeEditModal();
        
        this.log(`✓ Updated: ${updates.name}`, 'success');
    }
    
    // Delete app
    deleteApp(id) {
        const appData = library.get(id);
        if (!appData) return;
        
        if (confirm(`Delete "${appData.name}"?\n\nThis cannot be undone.`)) {
            library.delete(id);
            this.render();
            this.updateStats();
            this.log(`✓ Deleted: ${appData.name}`, 'success');
        }
    }
    
    // Export library
    exportLibrary() {
        const manifest = library.export();
        
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paper-library-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('✓ Library exported successfully!', 'success');
    }
    
    // Import library
    importLibrary() {
        const input = document.getElementById('importInput');
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const content = await file.text();
                const data = JSON.parse(content);
                
                if (library.import(data)) {
                    this.render();
                    this.updateStats();
                    this.log(`✓ Imported ${data.apps.length} apps!`, 'success');
                } else {
                    this.log('✗ Invalid library file', 'error');
                }
            } catch (error) {
                this.log(`✗ Import failed: ${error.message}`, 'error');
            }
            
            input.value = '';
        };
        input.click();
    }
    
    // Clear library
    clearLibrary() {
        if (confirm('Clear entire library?\n\nThis will delete all apps and cannot be undone!')) {
            library.clear();
            this.render();
            this.updateStats();
            this.log('Library cleared', 'success');
        }
    }
    
    // Logging
    showLog() {
        document.getElementById('processingLog').style.display = 'block';
    }
    
    log(message, type = '') {
        const logEl = document.getElementById('processingLog');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
        
        console.log(`[PAPER] ${message}`);
    }
    
    // Switch tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        if (tabName === 'apps') {
            document.getElementById('appsTab').classList.add('active');
        } else if (tabName === 'knowledge') {
            document.getElementById('knowledgeTab').classList.add('active');
        }
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new App();
    });
} else {
    app = new App();
}
