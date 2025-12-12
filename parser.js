// parser.js - File parsing and content extraction

class Parser {
    constructor() {
        this.validExtensions = ['.html', '.js', '.jsx', '.py', '.ts', '.tsx', '.css', '.json', '.md'];
    }
    
    // Check if file is valid
    isValid(filename) {
        return this.validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    }
    
    // Get file type
    getFileType(filename) {
        const lower = filename.toLowerCase();
        if (lower.endsWith('.html')) return 'html';
        if (lower.endsWith('.js') || lower.endsWith('.jsx')) return 'javascript';
        if (lower.endsWith('.py')) return 'python';
        if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
        if (lower.endsWith('.css')) return 'css';
        if (lower.endsWith('.json')) return 'json';
        if (lower.endsWith('.md')) return 'markdown';
        return 'unknown';
    }
    
    // Extract name from file
    extractName(filename, content) {
        // Try HTML title
        const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            return this.cleanName(titleMatch[1]);
        }
        
        // Try H1
        const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (h1Match) {
            return this.cleanName(h1Match[1]);
        }
        
        // Try Python/JS class name
        const classMatch = content.match(/class\s+(\w+)/);
        if (classMatch) {
            return this.cleanName(classMatch[1]);
        }
        
        // Try function name
        const funcMatch = content.match(/function\s+(\w+)/);
        if (funcMatch) {
            return this.cleanName(funcMatch[1]);
        }
        
        // Fallback to filename
        return this.cleanName(filename.replace(/\.(html|js|jsx|py|ts|tsx|css|json|md)$/, ''));
    }
    
    // Clean name
    cleanName(name) {
        return name
            .replace(/[🌟📄🎮⚡🌊🔥〰️]/g, '')
            .replace(/<[^>]*>/g, '')
            .replace(/[-_]/g, ' ')
            .trim()
            .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Extract keywords from content
    extractKeywords(content) {
        const keywords = new Set();
        const lower = content.toLowerCase();
        
        // Common patterns
        const patterns = [
            'game', 'simulation', 'consciousness', 'meditation', 'timer',
            'dashboard', 'tracker', 'planner', 'calendar', 'todo',
            'chart', 'visualization', 'data', 'analytics',
            'chat', 'messenger', 'social', 'network',
            'music', 'audio', 'video', 'image',
            'editor', 'creator', 'builder', 'generator',
            'learning', 'education', 'tutorial', 'guide',
            'health', 'fitness', 'wellness', 'therapy',
            'business', 'productivity', 'workflow', 'automation'
        ];
        
        patterns.forEach(pattern => {
            if (lower.includes(pattern)) {
                keywords.add(pattern);
            }
        });
        
        return Array.from(keywords);
    }
    
    // Detect colors from CSS/style
    detectColors(content) {
        const colors = [];
        
        // Find background gradients
        const gradientMatch = content.match(/background:\s*linear-gradient\([^)]+\)/gi);
        if (gradientMatch) {
            gradientMatch.forEach(grad => {
                if (grad.includes('#667eea') || grad.includes('#764ba2')) {
                    colors.push('purple-gradient');
                }
                if (grad.includes('blue') || grad.includes('#0') || grad.includes('#1')) {
                    colors.push('blue');
                }
                if (grad.includes('green') || grad.includes('#0f0') || grad.includes('#2')) {
                    colors.push('green');
                }
                if (grad.includes('red') || grad.includes('#f00') || grad.includes('#d')) {
                    colors.push('red');
                }
            });
        }
        
        // Find solid colors
        const bgMatch = content.match(/background(-color)?:\s*#?[a-fA-F0-9]{3,6}/gi);
        if (bgMatch) {
            bgMatch.forEach(bg => {
                const hex = bg.match(/#([a-fA-F0-9]{3,6})/);
                if (hex) {
                    const color = this.categorizeColor(hex[1]);
                    if (color) colors.push(color);
                }
            });
        }
        
        return [...new Set(colors)];
    }
    
    // Categorize hex color
    categorizeColor(hex) {
        // Simple color categorization
        if (hex.startsWith('0') || hex.startsWith('1') || hex.startsWith('2')) return 'dark';
        if (hex.startsWith('f') || hex.startsWith('e')) return 'light';
        if (hex.includes('00f') || hex.includes('0af')) return 'blue';
        if (hex.includes('0f0') || hex.includes('0a0')) return 'green';
        if (hex.includes('f00') || hex.includes('a00')) return 'red';
        if (hex.includes('ff0') || hex.includes('aa0')) return 'yellow';
        return null;
    }
    
    // Detect complexity
    detectComplexity(content) {
        // Count elements
        const lines = content.split('\n').length;
        const functions = (content.match(/function\s+\w+/g) || []).length;
        const classes = (content.match(/class\s+\w+/g) || []).length;
        const components = (content.match(/<[A-Z]\w+/g) || []).length;
        
        const score = (lines / 100) + (functions * 2) + (classes * 3) + (components * 2);
        
        if (score < 10) return 'simple';
        if (score < 30) return 'moderate';
        return 'complex';
    }
    
    // Extract imports/dependencies
    extractDependencies(content) {
        const deps = new Set();
        
        // JavaScript imports
        const esImports = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
        if (esImports) {
            esImports.forEach(imp => {
                const match = imp.match(/from\s+['"]([^'"]+)['"]/);
                if (match) deps.add(match[1]);
            });
        }
        
        // Require statements
        const requires = content.match(/require\(['"]([^'"]+)['"]\)/g);
        if (requires) {
            requires.forEach(req => {
                const match = req.match(/require\(['"]([^'"]+)['"]\)/);
                if (match) deps.add(match[1]);
            });
        }
        
        // Python imports
        const pyImports = content.match(/^import\s+(\w+)/gm);
        if (pyImports) {
            pyImports.forEach(imp => {
                const match = imp.match(/import\s+(\w+)/);
                if (match) deps.add(match[1]);
            });
        }
        
        const fromImports = content.match(/^from\s+(\w+)/gm);
        if (fromImports) {
            fromImports.forEach(imp => {
                const match = imp.match(/from\s+(\w+)/);
                if (match) deps.add(match[1]);
            });
        }
        
        return Array.from(deps);
    }
    
    // Parse file content
    async parseFile(filename, content) {
        return {
            filename: filename,
            fileType: this.getFileType(filename),
            name: this.extractName(filename, content),
            keywords: this.extractKeywords(content),
            colors: this.detectColors(content),
            complexity: this.detectComplexity(content),
            dependencies: this.extractDependencies(content),
            lineCount: content.split('\n').length,
            content: content
        };
    }
}

// Create global parser instance
const parser = new Parser();
