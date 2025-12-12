// knowledge.js - Book parsing and knowledge extraction

class KnowledgeLibrary {
    constructor() {
        this.books = [];
        this.insights = [];
        this.gateIndex = {}; // Gate number -> insights
        this.conceptIndex = {}; // Concept -> insights
        this.currentFilter = { gate: null, line: null, concept: null };
        this.load();
    }
    
    // Load from localStorage
    load() {
        const saved = localStorage.getItem('paperKnowledge');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.books = data.books || [];
                this.insights = data.insights || [];
                this.rebuildIndexes();
                console.log(`Loaded ${this.books.length} books, ${this.insights.length} insights`);
            } catch (e) {
                console.error('Failed to load knowledge:', e);
            }
        }
    }
    
    // Save to localStorage
    save() {
        try {
            localStorage.setItem('paperKnowledge', JSON.stringify({
                books: this.books,
                insights: this.insights
            }));
            console.log(`Saved ${this.books.length} books, ${this.insights.length} insights`);
        } catch (e) {
            console.error('Failed to save knowledge:', e);
        }
    }
    
    // Add book
    addBook(bookData) {
        bookData.id = Date.now() + Math.random();
        bookData.timestamp = new Date().toISOString();
        this.books.push(bookData);
        this.save();
        return bookData.id;
    }
    
    // Add insight
    addInsight(insightData) {
        insightData.id = Date.now() + Math.random();
        insightData.timestamp = new Date().toISOString();
        this.insights.push(insightData);
        
        // Index by gate
        if (insightData.gate) {
            if (!this.gateIndex[insightData.gate]) {
                this.gateIndex[insightData.gate] = [];
            }
            this.gateIndex[insightData.gate].push(insightData);
        }
        
        // Index by concepts
        if (insightData.concepts) {
            insightData.concepts.forEach(concept => {
                if (!this.conceptIndex[concept]) {
                    this.conceptIndex[concept] = [];
                }
                this.conceptIndex[concept].push(insightData);
            });
        }
        
        this.save();
        return insightData.id;
    }
    
    // Rebuild indexes
    rebuildIndexes() {
        this.gateIndex = {};
        this.conceptIndex = {};
        
        this.insights.forEach(insight => {
            if (insight.gate) {
                if (!this.gateIndex[insight.gate]) {
                    this.gateIndex[insight.gate] = [];
                }
                this.gateIndex[insight.gate].push(insight);
            }
            
            if (insight.concepts) {
                insight.concepts.forEach(concept => {
                    if (!this.conceptIndex[concept]) {
                        this.conceptIndex[concept] = [];
                    }
                    this.conceptIndex[concept].push(insight);
                });
            }
        });
    }
    
    // Get insights by gate
    getByGate(gateNumber) {
        return this.gateIndex[gateNumber] || [];
    }
    
    // Get insights by gate and line
    getByGateLine(gateNumber, lineNumber) {
        const gateInsights = this.getByGate(gateNumber);
        if (!lineNumber) return gateInsights;
        return gateInsights.filter(i => i.line === lineNumber);
    }
    
    // Get insights by concept
    getByConcept(concept) {
        return this.conceptIndex[concept.toLowerCase()] || [];
    }
    
    // Search insights
    search(query) {
        if (!query) return this.insights;
        
        const lower = query.toLowerCase();
        return this.insights.filter(insight => {
            return (
                insight.text.toLowerCase().includes(lower) ||
                insight.title?.toLowerCase().includes(lower) ||
                insight.concepts?.some(c => c.toLowerCase().includes(lower))
            );
        });
    }
    
    // Get all unique gates
    getGates() {
        return Object.keys(this.gateIndex).map(Number).sort((a, b) => a - b);
    }
    
    // Get all unique concepts
    getConcepts() {
        return Object.keys(this.conceptIndex).sort();
    }
    
    // Get stats
    getStats() {
        return {
            totalBooks: this.books.length,
            totalInsights: this.insights.length,
            totalGates: Object.keys(this.gateIndex).length,
            totalConcepts: Object.keys(this.conceptIndex).length
        };
    }
    
    // Clear all
    clear() {
        this.books = [];
        this.insights = [];
        this.gateIndex = {};
        this.conceptIndex = {};
        this.save();
    }
    
    // Export
    export() {
        return {
            version: '1.0',
            timestamp: new Date().toISOString(),
            stats: this.getStats(),
            books: this.books,
            insights: this.insights
        };
    }
}

class KnowledgeExtractor {
    constructor() {
        this.endpoint = 'http://localhost:8080';
    }
    
    // Parse book file
    async parseBook(filename, content) {
        // Clean text
        const text = this.cleanText(content);
        
        return {
            filename: filename,
            title: this.extractTitle(filename, text),
            author: this.extractAuthor(text),
            wordCount: text.split(/\s+/).length,
            content: text
        };
    }
    
    // Clean text content
    cleanText(text) {
        return text
            .replace(/[\r\n]+/g, '\n')
            .replace(/\s+/g, ' ')
            .trim();
    }
    
    // Extract title
    extractTitle(filename, content) {
        // Try to find title in first few lines
        const firstLines = content.split('\n').slice(0, 10);
        for (const line of firstLines) {
            if (line.length > 10 && line.length < 100 && !line.includes('©')) {
                return line.trim();
            }
        }
        
        // Fallback to filename
        return filename.replace(/\.(pdf|epub|txt|md)$/i, '');
    }
    
    // Extract author
    extractAuthor(content) {
        const authorMatch = content.match(/(?:by|author:)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);
        return authorMatch ? authorMatch[1] : 'Unknown';
    }
    
    // Extract insights using LlamaFile
    async extractInsights(bookData, options = {}) {
        const {
            extractGates = true,
            extractQuantum = true,
            extractDimensions = true
        } = options;
        
        // Split content into chunks (LlamaFile has token limits)
        const chunks = this.splitIntoChunks(bookData.content, 3000);
        const allInsights = [];
        
        for (let i = 0; i < chunks.length; i++) {
            try {
                const insights = await this.extractFromChunk(chunks[i], bookData, {
                    extractGates,
                    extractQuantum,
                    extractDimensions
                });
                allInsights.push(...insights);
            } catch (e) {
                console.warn(`Failed to extract from chunk ${i + 1}:`, e);
            }
        }
        
        return allInsights;
    }
    
    // Split text into chunks
    splitIntoChunks(text, maxWords) {
        const words = text.split(/\s+/);
        const chunks = [];
        
        for (let i = 0; i < words.length; i += maxWords) {
            chunks.push(words.slice(i, i + maxWords).join(' '));
        }
        
        return chunks;
    }
    
    // Extract insights from single chunk
    async extractFromChunk(text, bookData, options) {
        const prompt = this.buildExtractionPrompt(text, options);
        
        try {
            const response = await fetch(`${this.endpoint}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.2,
                    max_tokens: 1000
                })
            });
            
            const data = await response.json();
            const extracted = this.parseExtraction(data.choices[0].message.content);
            
            // Add book metadata to each insight
            return extracted.map(insight => ({
                ...insight,
                bookId: bookData.id,
                bookTitle: bookData.title,
                bookAuthor: bookData.author
            }));
        } catch (error) {
            console.error('Extraction failed:', error);
            return [];
        }
    }
    
    // Build extraction prompt
    buildExtractionPrompt(text, options) {
        const { extractGates, extractQuantum, extractDimensions } = options;
        
        let prompt = `Analyze this text and extract key insights. Respond ONLY with a JSON array of insights in this format:

[
  {
    "text": "the actual insight or quote",
    "gate": 23,
    "line": 4,
    "concepts": ["quantum mechanics", "wave function", "consciousness"],
    "dimension": "Evolution"
  }
]

`;
        
        if (extractGates) {
            prompt += `- Look for references to Gates (1-64) and Lines (1-6) from Human Design\n`;
        }
        
        if (extractQuantum) {
            prompt += `- Extract quantum mechanics concepts: wave function, superposition, entanglement, collapse, interference, field theory, resonance\n`;
        }
        
        if (extractDimensions) {
            prompt += `- Identify dimensional references: Movement, Evolution, Being, Design, Space\n`;
        }
        
        prompt += `\nText to analyze:\n${text.substring(0, 2500)}`;
        
        return prompt;
    }
    
    // Parse extraction response
    parseExtraction(text) {
        try {
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (e) {
            console.error('Failed to parse extraction:', e);
        }
        return [];
    }
    
    // Quick extraction (pattern matching, no AI)
    quickExtraction(text, bookData) {
        const insights = [];
        
        // Find gate references
        const gateMatches = text.matchAll(/Gate\s+(\d{1,2})(?:[,.\s]+Line\s+(\d))?/gi);
        for (const match of gateMatches) {
            const gate = parseInt(match[1]);
            const line = match[2] ? parseInt(match[2]) : null;
            
            if (gate >= 1 && gate <= 64) {
                // Extract surrounding context
                const index = match.index;
                const context = text.substring(Math.max(0, index - 200), Math.min(text.length, index + 200));
                
                insights.push({
                    text: context.trim(),
                    gate: gate,
                    line: line,
                    concepts: this.extractConceptsFromText(context),
                    bookId: bookData.id,
                    bookTitle: bookData.title,
                    bookAuthor: bookData.author
                });
            }
        }
        
        // Find quantum concepts
        const quantumKeywords = [
            'wave function', 'superposition', 'entanglement', 'quantum field',
            'interference', 'resonance', 'frequency', 'vibration', 'collapse',
            'probability', 'uncertainty', 'coherence', 'decoherence'
        ];
        
        quantumKeywords.forEach(keyword => {
            const regex = new RegExp(`[^.]*${keyword}[^.]*\\.`, 'gi');
            const matches = text.match(regex);
            if (matches) {
                matches.slice(0, 3).forEach(sentence => { // Limit per keyword
                    insights.push({
                        text: sentence.trim(),
                        concepts: [keyword, ...this.extractConceptsFromText(sentence)],
                        bookId: bookData.id,
                        bookTitle: bookData.title,
                        bookAuthor: bookData.author
                    });
                });
            }
        });
        
        return insights;
    }
    
    // Extract concepts from text
    extractConceptsFromText(text) {
        const concepts = [];
        const lower = text.toLowerCase();
        
        const conceptPatterns = [
            'consciousness', 'awareness', 'quantum', 'wave', 'field',
            'resonance', 'frequency', 'energy', 'dimension', 'mind',
            'body', 'spirit', 'evolution', 'transformation', 'design'
        ];
        
        conceptPatterns.forEach(pattern => {
            if (lower.includes(pattern)) {
                concepts.push(pattern);
            }
        });
        
        return [...new Set(concepts)];
    }
}

// Global instances
const knowledgeLibrary = new KnowledgeLibrary();
const knowledgeExtractor = new KnowledgeExtractor();

// Knowledge UI Controller
const knowledge = {
    currentFilter: { gate: null, line: null, concept: null },
    
    // Initialize
    init() {
        this.setupEventListeners();
        this.render();
        this.updateStats();
        this.populateGateSelect();
    },
    
    // Setup event listeners
    setupEventListeners() {
        const dropZone = document.getElementById('bookDropZone');
        const bookInput = document.getElementById('bookInput');
        
        if (!dropZone || !bookInput) return;
        
        dropZone.addEventListener('click', () => bookInput.click());
        
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
        
        bookInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            bookInput.value = '';
        });
    },
    
    // Handle uploaded files
    async handleFiles(files) {
        this.showLog();
        const dropZone = document.getElementById('bookDropZone');
        dropZone.classList.add('processing');
        
        for (const file of files) {
            await this.processBook(file);
        }
        
        dropZone.classList.remove('processing');
        this.render();
        this.updateStats();
        this.populateGateSelect();
        this.log('✓ All books processed!', 'success');
    },
    
    // Process single book
    async processBook(file) {
        this.log(`📖 Processing: ${file.name}`);
        
        try {
            const content = await file.text();
            const bookData = await knowledgeExtractor.parseBook(file.name, content);
            
            const bookId = knowledgeLibrary.addBook(bookData);
            bookData.id = bookId;
            
            this.log(`✓ Parsed: ${bookData.title}`, 'success');
            
            // Extract insights
            const extractGates = document.getElementById('extractGates').checked;
            const extractQuantum = document.getElementById('extractQuantum').checked;
            const extractDimensions = document.getElementById('extractDimensions').checked;
            
            if (!analyzer.online) {
                this.log(`⚡ Using quick extraction (LlamaFile offline)`);
                const insights = knowledgeExtractor.quickExtraction(content, bookData);
                insights.forEach(insight => knowledgeLibrary.addInsight(insight));
                this.log(`✓ Extracted ${insights.length} insights`, 'success');
            } else {
                this.log(`🧠 Extracting insights with AI...`);
                const insights = await knowledgeExtractor.extractInsights(bookData, {
                    extractGates,
                    extractQuantum,
                    extractDimensions
                });
                insights.forEach(insight => knowledgeLibrary.addInsight(insight));
                this.log(`✓ Extracted ${insights.length} insights`, 'success');
            }
        } catch (error) {
            this.log(`✗ Failed to process ${file.name}: ${error.message}`, 'error');
        }
    },
    
    // Render knowledge grid
    render() {
        const grid = document.getElementById('knowledgeGrid');
        if (!grid) return;
        
        let insights = this.getFilteredInsights();
        
        if (insights.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📖</div>
                    <h3>No insights found</h3>
                    <p>${this.hasFilters() ? 'Try adjusting your filters' : 'Upload books to extract wisdom!'}</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = insights.map(insight => this.renderInsightCard(insight)).join('');
    },
    
    // Get filtered insights
    getFilteredInsights() {
        let insights = knowledgeLibrary.insights;
        
        if (this.currentFilter.gate) {
            insights = insights.filter(i => i.gate === this.currentFilter.gate);
        }
        
        if (this.currentFilter.line) {
            insights = insights.filter(i => i.line === this.currentFilter.line);
        }
        
        if (this.currentFilter.concept) {
            const lower = this.currentFilter.concept.toLowerCase();
            insights = insights.filter(i => 
                i.text.toLowerCase().includes(lower) ||
                i.concepts?.some(c => c.toLowerCase().includes(lower))
            );
        }
        
        return insights;
    },
    
    // Check if filters are active
    hasFilters() {
        return this.currentFilter.gate || this.currentFilter.line || this.currentFilter.concept;
    },
    
    // Render insight card
    renderInsightCard(insight) {
        return `
            <div class="insight-card">
                <div class="insight-header">
                    ${insight.gate ? `<span class="gate-badge">Gate ${insight.gate}${insight.line ? `.${insight.line}` : ''}</span>` : ''}
                    ${insight.dimension ? `<span class="dimension-badge">${insight.dimension}</span>` : ''}
                </div>
                <div class="insight-text">${insight.text}</div>
                ${insight.concepts && insight.concepts.length > 0 ? `
                    <div class="insight-concepts">
                        ${insight.concepts.map(c => `<span class="concept-tag">${c}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="insight-source">
                    📚 ${insight.bookTitle} ${insight.bookAuthor ? `by ${insight.bookAuthor}` : ''}
                </div>
            </div>
        `;
    },
    
    // Update stats
    updateStats() {
        const stats = knowledgeLibrary.getStats();
        const totalBooks = document.getElementById('totalBooks');
        const totalInsights = document.getElementById('totalInsights');
        const totalGates = document.getElementById('totalGates');
        const totalConcepts = document.getElementById('totalConcepts');
        
        if (totalBooks) totalBooks.textContent = stats.totalBooks;
        if (totalInsights) totalInsights.textContent = stats.totalInsights;
        if (totalGates) totalGates.textContent = stats.totalGates;
        if (totalConcepts) totalConcepts.textContent = stats.totalConcepts;
    },
    
    // Populate gate select
    populateGateSelect() {
        const select = document.getElementById('gateSelect');
        if (!select) return;
        
        const gates = knowledgeLibrary.getGates();
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">All Gates</option>' +
            gates.map(gate => `<option value="${gate}">Gate ${gate}</option>`).join('');
        
        if (currentValue) select.value = currentValue;
    },
    
    // Filter by gate
    filterByGate() {
        const select = document.getElementById('gateSelect');
        this.currentFilter.gate = select.value ? parseInt(select.value) : null;
        this.render();
    },
    
    // Filter by line
    filterByLine() {
        const select = document.getElementById('lineSelect');
        this.currentFilter.line = select.value ? parseInt(select.value) : null;
        this.render();
    },
    
    // Search concepts
    searchConcepts() {
        const input = document.getElementById('conceptSearch');
        this.currentFilter.concept = input.value;
        this.render();
    },
    
    // Export knowledge
    exportKnowledge() {
        const data = knowledgeLibrary.export();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paper-knowledge-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.log('✓ Knowledge exported!', 'success');
    },
    
    // Clear knowledge
    clearKnowledge() {
        if (confirm('Clear entire knowledge library?\n\nThis will delete all books and insights and cannot be undone!')) {
            knowledgeLibrary.clear();
            this.render();
            this.updateStats();
            this.populateGateSelect();
            this.log('Knowledge library cleared', 'success');
        }
    },
    
    // Logging
    showLog() {
        const log = document.getElementById('knowledgeLog');
        if (log) log.style.display = 'block';
    },
    
    log(message, type = '') {
        const logEl = document.getElementById('knowledgeLog');
        if (!logEl) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logEl.appendChild(entry);
        logEl.scrollTop = logEl.scrollHeight;
        
        console.log(`[KNOWLEDGE] ${message}`);
    }
};
