# 📚 PAPER Library Manager

Your consciousness-aware app & knowledge organization system with AI-powered analysis.

## 🎯 Two Libraries in One

### 📱 Apps Library
Organize and categorize your web applications, tools, and components by consciousness energy signature.

### 📖 Knowledge Library
Extract wisdom from books and documents - automatically finding gate/line references, quantum concepts, and consciousness insights.

## 🚀 Quick Start

### 1. Download LlamaFile

First, get LlamaFile running on your computer:

```bash
# Download LlamaFile (choose your OS)
# For macOS/Linux:
wget https://huggingface.co/Mozilla/Mistral-7B-Instruct-v0.2-llamafile/resolve/main/mistral-7b-instruct-v0.2.Q4_0.llamafile
chmod +x mistral-7b-instruct-v0.2.Q4_0.llamafile

# For Windows: Download the .exe from the same link
```

### 2. Start LlamaFile

```bash
# Run the server
./mistral-7b-instruct-v0.2.Q4_0.llamafile --server --port 8080

# You should see: "Server listening on http://localhost:8080"
```

### 3. Open Library Manager

Just double-click `index.html` in your browser. That's it!

## 📁 File Structure

```
paper-library/
├── index.html      # Main interface
├── styles.css      # All styling
├── library.js      # Library storage & management
├── parser.js       # File parsing (HTML, JS, Python, etc.)
├── analyzer.js     # Glyph detection & AI analysis
├── app.js          # Main application logic
└── README.md       # This file
```

## 🎯 How to Use

### Upload Files

1. **Drag & Drop** - Drop any files or folders onto the upload zone
2. **Click to Browse** - Click the upload zone to select files manually
3. **Supported Types**: HTML, JS, JSX, Python, TypeScript, CSS, JSON, Markdown, ZIP archives

### Auto-Analysis

When LlamaFile is running (green status), files are automatically analyzed for:
- **Description** - What the app does
- **Energy signature** - 🌊 Calm / 🔥 Focused / ⚡ Energetic / 〰️ Flowing
- **Tags** - Relevant keywords
- **Best for** - Who would benefit most

### Manual Editing

Click **Edit** on any app card to:
- Change the name or description
- Adjust the energy signature
- Add/remove tags
- Specify who it's best for

### Export/Import

- **Export JSON** - Save your entire library as a JSON file
- **Import JSON** - Load a previously exported library
- **Clear All** - Start fresh (with confirmation)

## 🌊 Energy Signatures (5 Consciousness Dimensions)

The system categorizes apps into five energy types, mapped to the fundamental dimensions of consciousness:

| Energy | Icon | Dimension | Description | Examples |
|--------|------|-----------|-------------|----------|
| **Energetic** | ⚡ | Movement/Individuality | Dynamic, intense, fast-paced | Games, simulations, interactive demos |
| **Flowing** | 〰️ | Evolution/Mind | Adaptive, smooth, evolutionary | Learning tools, memory aids, growth trackers |
| **Calm** | 🌊 | Being/Body | Peaceful, gentle, grounded | Meditation timers, relaxation tools, body awareness |
| **Focused** | 🔥 | Design/Ego | Structured, precise, organized | Dashboards, planners, analytical tools |
| **Spiral** | 🌀 | Space/Personality | Recursive, transformative, creative | Generative tools, creative apps, personality explorers |

### The 5th Dimension: Space/Personality

Space is unique - it emerges as a **property of Evolution** (the growth through which you move), but this property becomes **self-referential and recursive**, generating its own dimensional field. This is why Spiral represents transformation, imagination, and the container where personality manifests.

## 🧠 AI Analysis

With LlamaFile running, the system performs:

### Quick Analysis (Default)
- Fast pattern detection
- Keyword extraction
- Color/style analysis
- Maps to 5-dimensional framework
- ~1 second per file

### Deep Analysis (Optional)
- Full code understanding
- Detailed descriptions
- Accurate 5-dimensional energy detection
- ~5 seconds per file

Enable "Deep analysis" in settings for maximum accuracy.

## 💾 Data Storage

Everything is stored in your browser's localStorage:
- ✅ No server required
- ✅ Works offline (except AI analysis)
- ✅ Private and secure
- ⚠️ Clearing browser data clears library (export regularly!)

## 🔧 Troubleshooting

### LlamaFile shows "Offline"

1. Check LlamaFile is running: `curl http://localhost:8080/health`
2. Verify port 8080 in settings matches your LlamaFile
3. Check firewall isn't blocking localhost connections

### Files not uploading

1. Check file extension is supported
2. Try uploading one file at a time
3. Check browser console for errors (F12)

### Can't find exported JSON

Look in your browser's default download folder. File name format: `paper-library-[timestamp].json`

## 🎨 What Happens Next?

Once your library is built, this JSON file becomes the data source for:

**PAPER Frontend** - The user-facing app matcher that:
- Takes user birth data
- Calculates their consciousness signature
- Matches them to the perfect app from your library
- Delivers personalized experiences

---

## 📖 Knowledge Library

The Knowledge Library extracts wisdom from books and documents, organizing insights by gates, lines, and consciousness concepts.

### What It Extracts

**Gate & Line References**
- Automatically finds references to Gates 1-64
- Identifies specific Lines 1-6
- Extracts surrounding context

**Quantum Mechanics Concepts**
- Wave function, superposition, entanglement
- Field theory, resonance, coherence
- Frequency, probability, uncertainty

**Dimensional References**
- Movement/Individuality
- Evolution/Mind
- Being/Body
- Design/Ego
- Space/Personality

### How to Use Knowledge Library

1. **Switch to Knowledge Tab** - Click "📖 Knowledge Library" at the top
2. **Upload Documents** - Drop PDF, EPUB, TXT, or MD files
3. **Configure Extraction**:
   - ✓ Gate/Line references
   - ✓ Quantum mechanics concepts
   - ✓ Dimensional references
4. **AI Analysis** (if LlamaFile running):
   - Deep contextual extraction
   - Concept identification
   - Relationship mapping
5. **Query Your Knowledge**:
   - Filter by specific Gate (1-64)
   - Filter by Line (1-6)
   - Search by concept keyword
   - View insights with full context and source

### Example Use Cases

**Personal Chart Analysis**
```
1. Upload Human Design books
2. System extracts all Gate 62 references
3. Filter to Gate 62, Line 3
4. Get personalized insights for your placement
```

**Quantum Consciousness Research**
```
1. Upload quantum physics + consciousness texts
2. Search for "wave function collapse"
3. Get all relevant passages indexed by concept
4. Cross-reference with dimensional framework
```

**Build Reference Library for Paper**
```
1. Upload your entire book collection
2. System builds searchable knowledge base
3. Query by gate/line for user-specific insights
4. Export for Paper frontend integration
```

### Knowledge Export

Exported JSON includes:
- All books with metadata (title, author, word count)
- Extracted insights with full context
- Gate/Line index (sortable by gate number)
- Concept taxonomy (all quantum/consciousness terms)
- Source attribution for every insight

**This becomes your wisdom database** - Paper frontend queries it based on user birth charts to deliver personalized consciousness insights.

---

## 🚀 Tips

1. **Upload in batches** - Drop entire project folders as ZIPs
2. **Use deep analysis** - For accurate categorization of complex apps
3. **Export regularly** - Backup your library every 50+ apps
4. **Tag generously** - More tags = better matching later
5. **Review AI suggestions** - AI is smart but you know your apps best

## 📖 What's in Your Library?

After uploading your apps, you should see:
- Total count of apps
- Breakdown by 5 energy dimensions (Energetic/Flowing/Calm/Focused/Spiral)
- Searchable, filterable grid
- Detailed cards with descriptions and tags

## 🌟 Next Steps

1. Upload all your existing apps
2. Review and adjust AI-detected energy signatures
3. Add "Best for" descriptions for consciousness matching
4. Export your library JSON
5. Build the PAPER frontend to match users to apps!

---

**Built with consciousness, powered by AI, organized by glyphs** ⚡📚
