// library.js - Core library management and storage

class Library {
    constructor() {
        this.apps = [];
        this.currentFilter = 'all';
        this.load();
    }
    
    // Load library from localStorage
    load() {
        const saved = localStorage.getItem('paperLibrary');
        if (saved) {
            try {
                this.apps = JSON.parse(saved);
                console.log(`Loaded ${this.apps.length} apps from library`);
            } catch (e) {
                console.error('Failed to load library:', e);
                this.apps = [];
            }
        }
    }
    
    // Save library to localStorage
    save() {
        try {
            localStorage.setItem('paperLibrary', JSON.stringify(this.apps));
            console.log(`Saved ${this.apps.length} apps to library`);
        } catch (e) {
            console.error('Failed to save library:', e);
        }
    }
    
    // Add app to library
    add(appData) {
        appData.id = Date.now() + Math.random();
        appData.timestamp = new Date().toISOString();
        this.apps.push(appData);
        this.save();
        return appData.id;
    }
    
    // Update app
    update(id, updates) {
        const index = this.apps.findIndex(app => app.id === id);
        if (index !== -1) {
            this.apps[index] = { ...this.apps[index], ...updates };
            this.save();
            return true;
        }
        return false;
    }
    
    // Delete app
    delete(id) {
        const index = this.apps.findIndex(app => app.id === id);
        if (index !== -1) {
            this.apps.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }
    
    // Get app by ID
    get(id) {
        return this.apps.find(app => app.id === id);
    }
    
    // Get all apps
    getAll() {
        return this.apps;
    }
    
    // Filter apps by energy
    filter(energy) {
        if (energy === 'all') {
            return this.apps;
        }
        return this.apps.filter(app => app.energy === energy);
    }
    
    // Search apps
    search(query) {
        if (!query) return this.apps;
        
        const lower = query.toLowerCase();
        return this.apps.filter(app => {
            return (
                app.name.toLowerCase().includes(lower) ||
                app.description.toLowerCase().includes(lower) ||
                app.filename.toLowerCase().includes(lower) ||
                app.tags.some(tag => tag.toLowerCase().includes(lower))
            );
        });
    }
    
    // Get stats
    getStats() {
        return {
            total: this.apps.length,
            energetic: this.apps.filter(a => a.energy === 'energetic').length,
            flowing: this.apps.filter(a => a.energy === 'flowing').length,
            calm: this.apps.filter(a => a.energy === 'calm').length,
            focused: this.apps.filter(a => a.energy === 'focused').length,
            spiral: this.apps.filter(a => a.energy === 'spiral').length
        };
    }
    
    // Clear all
    clear() {
        this.apps = [];
        this.save();
    }
    
    // Export to JSON
    export() {
        return {
            version: '1.0',
            timestamp: new Date().toISOString(),
            stats: this.getStats(),
            apps: this.apps.map(app => ({
                id: app.id,
                name: app.name,
                filename: app.filename,
                description: app.description,
                energy: app.energy,
                glyphs: app.glyphs,
                tags: app.tags,
                bestFor: app.bestFor,
                content: app.content,
                timestamp: app.timestamp
            }))
        };
    }
    
    // Import from JSON
    import(data) {
        try {
            if (data.apps && Array.isArray(data.apps)) {
                this.apps = data.apps;
                this.save();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import library:', e);
            return false;
        }
    }
}

// Create global library instance
const library = new Library();
