# BookTheme

**Find the song that *feels* like your book.**

BookTheme matches books to theme songs based on **vibe** (mood/aesthetic), not plot. Pick a popular book and discover the perfect song to listen to while reading—or to capture its essence.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)

## Features

- 📚 **20 Popular Books** with vibe profiles (tags + 9-dimension vibe vectors)
- 🎵 **150+ Songs** with audio features and mood metadata
- 🎯 **Vibe Matching Algorithm** using tag overlap + cosine similarity
- 🎨 **Minimal, Cozy UI** with responsive design and soft aesthetics
- 🎧 **Spotify Integration** with embedded player and direct links
- 📊 **Explainable Results** showing why songs match books

## How Matching Works

The algorithm combines three scoring components:

### 1. Tag Score (55% weight)
Uses **Jaccard similarity** between book and song vibe tags:
```
Jaccard = |A ∩ B| / |A ∪ B|
```
Tags describe the aesthetic: "nostalgic", "melancholic", "intimate", "gothic", etc.

### 2. Vector Score (35% weight)
Uses **cosine similarity** between book vibe vectors and derived song vectors:
```
Cosine = (A · B) / (||A|| × ||B||)
```

**Book Vibe Dimensions (0-1):**
- Melancholy, Intimacy, Intensity, Hope, Tension
- Warmth, Nostalgia, Eeriness, Pace

**Song Audio → Vibe Mapping:**
| Vibe Dimension | Derived From |
|----------------|--------------|
| Melancholy | `1 - valence` |
| Intimacy | `acousticness × 0.6 + (1 - energy) × 0.4` |
| Intensity | `energy` |
| Hope | `valence × 0.7 + energy × 0.3` |
| Tension | `energy × 0.5 + (1 - valence) × 0.5` |
| Warmth | `acousticness × 0.5 + valence × 0.3 + (1 - energy) × 0.2` |
| Nostalgia | `acousticness × 0.4 + (1 - tempo) × 0.3 + (1 - energy) × 0.3` |
| Eeriness | `(1 - valence) × 0.5 + (1 - danceability) × 0.3 + (1 - warmth) × 0.2` |
| Pace | `tempo × 0.6 + energy × 0.4` |

### 3. Penalties (up to -15%)
Reduces score for vibe mismatches:
- `-10%`: Melancholic book (>0.7) + happy song (valence >0.7)
- `-8%`: Eerie book (>0.7) + warm song (warmth >0.7)
- `-7%`: Hopeful book (>0.7) + very sad song (valence <0.2)
- `-5%`: Tense book (>0.7) + low-energy song (energy <0.3)
- `-5%`: Intense book (>0.8) + mellow song (energy <0.25)

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone or navigate to the project
cd booktheme

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests (watch mode) |
| `npm run test:run` | Run tests once |
| `npm run lint` | Lint code |

## Project Structure

```
booktheme/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── book/[id]/page.tsx    # Book detail page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── BookCard.tsx          # Book grid card
│   │   ├── BookSearch.tsx        # Search/filter component
│   │   ├── SongCard.tsx          # Theme song result
│   │   └── VibeMeter.tsx         # 9-dimension vibe bars
│   ├── data/
│   │   ├── books.json            # Book data (20 books)
│   │   └── songs.json            # Song data (150+ songs)
│   └── lib/
│       ├── types.ts              # TypeScript definitions
│       └── matchThemeSong.ts     # Matching algorithm
├── __tests__/
│   └── matchThemeSong.test.ts    # Unit tests
└── vitest.config.ts              # Test configuration
```

## Adding Books

Edit `src/data/books.json`:

```json
{
  "id": "your-book-slug",
  "title": "Book Title",
  "author": "Author Name",
  "coverImageUrl": "/covers/your-book.jpg",
  "vibeTags": ["nostalgic", "melancholic", "intimate"],
  "vibeVector": {
    "melancholy": 0.7,
    "intimacy": 0.8,
    "intensity": 0.4,
    "hope": 0.3,
    "tension": 0.5,
    "warmth": 0.6,
    "nostalgia": 0.9,
    "eeriness": 0.2,
    "pace": 0.3
  },
  "vibeBlurb": "2-3 sentences describing the book's vibe (not plot)."
}
```

**Tips for vibe vectors:**
- Think about the *feeling* of reading, not events
- 0.5 is neutral; extremes (0.0, 1.0) should be rare
- Compare to existing books for calibration

## Adding Songs

Edit `src/data/songs.json`:

```json
{
  "id": "song-slug",
  "title": "Song Title",
  "artist": "Artist Name",
  "spotifyUrl": "https://open.spotify.com/track/TRACK_ID",
  "previewUrl": null,
  "vibeTags": ["melancholic", "intimate", "acoustic"],
  "audio": {
    "energy": 0.35,
    "valence": 0.2,
    "tempo": 0.4,
    "acousticness": 0.85,
    "danceability": 0.3
  },
  "moodBlurb": "1-2 sentences describing the song's mood."
}
```

**Audio features (all 0-1):**
| Feature | Description |
|---------|-------------|
| `energy` | Intensity and activity (0=calm, 1=energetic) |
| `valence` | Musical positiveness (0=sad, 1=happy) |
| `tempo` | Normalized BPM (map 60-200 BPM → 0-1) |
| `acousticness` | Acoustic vs electronic (1=acoustic) |
| `danceability` | Rhythmic suitability for dancing |

**Getting Spotify audio features:**
You can use the [Spotify Web API](https://developer.spotify.com/documentation/web-api/reference/get-audio-features) to get official audio features, then normalize them to 0-1.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **Fonts:** Playfair Display (serif) + Inter (sans)
- **Testing:** Vitest
- **Data:** Local JSON (no database)

## License

MIT

---

Built with vibes. 🎵📚
