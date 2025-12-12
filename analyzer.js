// analyzer.js - Glyph detection and LlamaFile integration

class Analyzer {
    constructor() {
        this.endpoint = 'http://localhost:8080';
        this.online = false;
        this.checking = false;
    }
    
    // Check if LlamaFile is online
    async checkStatus() {
        if (this.checking) return this.online;
        
        this.checking = true;
        try {
            const response = await fetch(`${this.endpoint}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000)
            });
            this.online = response.ok;
        } catch (e) {
            // Try alternative endpoint
            try {
                const response = await fetch(`${this.endpoint}/v1/models`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000)
                });
                this.online = response.ok;
            } catch (e2) {
                this.online = false;
            }
        }
        this.checking = false;
        return this.online;
    }
    
    // Quick glyph detection (no AI)
    detectGlyphsQuick(parsedFile) {
        const content = parsedFile.content.toLowerCase();
        const keywords = parsedFile.keywords;
        const colors = parsedFile.colors;
        
        // Energy detection
        let energy = 'focused'; // default
        
        // Energetic indicators (Movement/Individuality)
        if (
            keywords.includes('game') ||
            keywords.includes('simulation') ||
            parsedFile.complexity === 'complex' ||
            colors.includes('red') ||
            content.includes('particle') ||
            content.includes('animation') ||
            content.includes('dynamic') ||
            content.includes('intense') ||
            content.includes('burst') ||
            content.includes('explosive')
        ) {
            energy = 'energetic';
        }
        // Flowing indicators (Evolution/Mind)
        else if (
            content.includes('flow') ||
            content.includes('wave') ||
            content.includes('smooth') ||
            content.includes('rhythm') ||
            content.includes('adaptive') ||
            content.includes('evolution') ||
            content.includes('memory') ||
            colors.includes('blue')
        ) {
            energy = 'flowing';
        }
        // Calm indicators (Being/Body)
        else if (
            keywords.includes('meditation') ||
            keywords.includes('calm') ||
            keywords.includes('peaceful') ||
            colors.includes('green') ||
            colors.includes('light') ||
            content.includes('gentle') ||
            content.includes('serene') ||
            content.includes('tranquil') ||
            content.includes('touch') ||
            content.includes('sensation')
        ) {
            energy = 'calm';
        }
        // Spiral indicators (Space/Personality)
        else if (
            content.includes('spiral') ||
            content.includes('recursive') ||
            content.includes('transform') ||
            content.includes('metamorph') ||
            content.includes('personality') ||
            content.includes('imagination') ||
            content.includes('creative') ||
            content.includes('generative') ||
            content.includes('self-referential') ||
            content.includes('fractal') ||
            content.includes('dimension')
        ) {
            energy = 'spiral';
        }
        
        // Flow detection
        let flow = 'straight';
        if (content.includes('curve') || content.includes('wave')) flow = 'wavy';
        if (content.includes('spiral') || content.includes('circular')) flow = 'spiral';
        
        // Mood detection
        let mood = 'energetic';
        if (content.includes('contemplat') || content.includes('meditat')) mood = 'contemplative';
        if (content.includes('creat') || content.includes('art')) mood = 'creative';
        if (content.includes('search') || content.includes('explore')) mood = 'searching';
        if (content.includes('transform')) mood = 'transformative';
        
        // Rhythm detection
        let rhythm = 'continuous';
        if (content.includes('burst') || content.includes('pulse')) rhythm = 'punctuated';
        if (content.includes('pause') || content.includes('hesita')) rhythm = 'hesitant';
        
        return {
            energy,
            flow,
            mood,
            rhythm
        };
    }
    
    // Analyze with LlamaFile (AI-powered)
    async analyzeWithAI(parsedFile, deepAnalysis = false) {
        if (!this.online) {
            throw new Error('LlamaFile is offline');
        }
        
        // Prepare code snippet (limit size)
        const maxLength = deepAnalysis ? 4000 : 2000;
        const codeSnippet = parsedFile.content.substring(0, maxLength);
        
        const prompt = `Analyze this ${parsedFile.fileType} code and respond ONLY with valid JSON in this exact format:
{
  "description": "brief description of what this code does (max 2 sentences)",
  "energy": "energetic|flowing|calm|focused|spiral",
  "tags": ["tag1", "tag2", "tag3"],
  "bestFor": "who would benefit most from this app"
}

Energy meanings (5 consciousness dimensions):
- energetic: dynamic, intense, fast-paced, exciting (Movement/Individuality)
- flowing: adaptive, smooth, rhythmic, evolutionary (Evolution/Mind)
- calm: peaceful, gentle, meditative, grounded (Being/Body)
- focused: structured, precise, analytical, organized (Design/Ego)
- spiral: recursive, transformative, creative, dimensional (Space/Personality)

Code to analyze:
\`\`\`${parsedFile.fileType}
${codeSnippet}
\`\`\`

Respond with ONLY the JSON object, no markdown, no explanation.`;

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
                    temperature: 0.3,
                    max_tokens: deepAnalysis ? 400 : 200
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            const analysis = this.parseAIResponse(data.choices[0].message.content);
            
            if (!analysis) {
                throw new Error('Failed to parse AI response');
            }
            
            return analysis;
        } catch (error) {
            console.error('AI analysis failed:', error);
            throw error;
        }
    }
    
    // Parse AI response
    parseAIResponse(text) {
        try {
            // Try to extract JSON from text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                
                // Validate energy value
                const validEnergies = ['energetic', 'flowing', 'calm', 'focused', 'spiral'];
                if (!validEnergies.includes(parsed.energy)) {
                    parsed.energy = 'focused';
                }
                
                // Ensure arrays
                if (!Array.isArray(parsed.tags)) parsed.tags = [];
                
                return {
                    description: parsed.description || '',
                    energy: parsed.energy,
                    tags: parsed.tags.filter(t => t && t.trim()),
                    bestFor: parsed.bestFor || ''
                };
            }
        } catch (e) {
            console.error('Failed to parse AI response:', e);
        }
        return null;
    }
    
    // Full analysis pipeline
    async analyze(parsedFile, useAI = true, deepAnalysis = false) {
        // Start with quick detection
        const glyphs = this.detectGlyphsQuick(parsedFile);
        
        // Base result
        const result = {
            name: parsedFile.name,
            filename: parsedFile.filename,
            description: '',
            energy: glyphs.energy,
            glyphs: glyphs,
            tags: parsedFile.keywords,
            bestFor: '',
            content: parsedFile.content,
            fileType: parsedFile.fileType,
            complexity: parsedFile.complexity,
            dependencies: parsedFile.dependencies
        };
        
        // Enhance with AI if available
        if (useAI && this.online) {
            try {
                const aiAnalysis = await this.analyzeWithAI(parsedFile, deepAnalysis);
                result.description = aiAnalysis.description;
                result.energy = aiAnalysis.energy;
                result.tags = [...new Set([...result.tags, ...aiAnalysis.tags])];
                result.bestFor = aiAnalysis.bestFor;
            } catch (e) {
                console.warn('AI analysis failed, using quick detection:', e);
            }
        }
        
        return result;
    }
    
    // Get energy icon
    getEnergyIcon(energy) {
        const icons = {
            energetic: '⚡',
            flowing: '〰️',
            calm: '🌊',
            focused: '🔥',
            spiral: '🌀'
        };
        return icons[energy] || '🔥';
    }
    
    // Get energy description
    getEnergyDescription(energy) {
        const descriptions = {
            energetic: 'Dynamic, intense, exciting (Movement/Individuality)',
            flowing: 'Adaptive, smooth, rhythmic (Evolution/Mind)',
            calm: 'Peaceful, gentle, grounded (Being/Body)',
            focused: 'Structured, precise, analytical (Design/Ego)',
            spiral: 'Recursive, transformative, creative (Space/Personality)'
        };
        return descriptions[energy] || 'Balanced and versatile';
    }
}

// Create global analyzer instance
const analyzer = new Analyzer();
