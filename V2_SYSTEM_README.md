# V2 Dynamic Data System - Documentation

## 🚀 TL;DR (Too Long; Didn't Read)

**V2 is like a magic number in your URL that changes what data you see.**

```
Same URL + Different Number = Different Data

http://localhost:8003/?v2-seed=1   → Shows restaurants A, B, C
http://localhost:8003/?v2-seed=5   → Shows restaurants D, E, F
http://localhost:8003/?v2-seed=99  → Shows restaurants X, Y, Z
```

**Why is this useful?**

- Show different demos to different clients (just change the seed)
- Test different scenarios without changing code
- Same seed = same data (reproducible demos)

---

## 📋 Overview

The **V2 system** is a seed-based dynamic data loading mechanism that allows web applications to deterministically display different subsets of data based on a URL parameter (`v2-seed`).

### What is V2?

V2 (Version 2) is a data persistence and selection system where:

- A **master dataset** (200+ records) is stored in JSON files
- A **seed value** in the URL determines which subset of data to display
- The **same seed always returns the same data** (deterministic)
- Different seeds show **different content**, not just reordered data

### Real-World Analogy

Think of v2 like a **deck of cards**:

- The master dataset = full deck (200 cards)
- The seed = how you shuffle the deck
- What you see = first 50 cards after shuffle
- Same shuffle method (seed) = same 50 cards every time
- Different shuffle method (different seed) = different 50 cards

## ⚡ Quick Start

**1. Start a project with v2 enabled:**

```bash
cd web_4_autodining
ENABLE_DYNAMIC_V2_DB_MODE=true \
NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true \
NEXT_PUBLIC_API_URL=http://localhost:8090 \
WEB_PORT=8003 \
  docker compose -p autodining_8003 up -d --build
```

**2. Visit with different seeds:**

```bash
# Open in browser
http://localhost:8003/?v2-seed=1
http://localhost:8003/?v2-seed=23
http://localhost:8003/?v2-seed=99

# See different restaurants each time!
```

**That's it!** 🎉

## 🎯 How It Works

### 1. Data Storage

Data is stored in the `webs_server` container:

```
~/webs_data/
├── web_4_autodining/
│   ├── main.json                    # Index file pointing to data files
│   └── data/
│       └── restaurants_1.json       # 200 restaurant records
├── web_5_autocrm/
│   ├── main.json
│   └── data/
│       ├── clients_1.json           # 200 client records
│       ├── matters_1.json           # 200 matter records
│       ├── events_1.json            # 200 event records
│       ├── files_1.json             # 200 file records
│       └── logs_1.json              # 200 log records
├── web_6_automail/
│   └── data/
│       └── emails_1.json            # 200 email records
└── ... (other projects)
```

### 2. Seed-Based Selection

When you visit a URL with `?v2-seed=X`:

```
http://localhost:8003/?v2-seed=4    # Seed 4 data
http://localhost:8003/?v2-seed=22   # Seed 22 data (different)
```

**What happens behind the scenes:**

```
┌─────────────────────────────────────────────────────────┐
│  1. User visits: /?v2-seed=4                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. Frontend reads seed from URL                        │
│     seed = 4                                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. API call to backend                                 │
│     GET /datasets/load?seed_value=4&limit=50            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. Backend loads 200 restaurants from JSON             │
│     Uses Python's random.Random(4) for selection        │
│     Ensures variety across cuisines (distribute)        │
│     Returns 50 restaurants                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. Frontend displays those 50 restaurants              │
│     Same 50 every time seed=4 is used ✅                │
└─────────────────────────────────────────────────────────┘
```

### 3. Selection Methods

The system supports multiple selection methods:

#### **distribute** (Recommended for most cases)

- Ensures proportional distribution across categories
- Example: If you have restaurants with cuisines [Italian, Mexican, Asian], it will pick some from each category
- Then shuffles the result

```python
# Example: 200 restaurants → select 50 with distribution
seeded_distribution(
    data=all_restaurants,
    seed=4,
    limit=50,
    category_key="cuisine"  # Distribute across cuisines
)
```

#### **shuffle**

- Randomly shuffles all data using the seed
- Takes the first N items

#### **select**

- Randomly selects N items using the seed
- No guarantee of category distribution

#### **filter**

- Filters by specific values, then selects

## 🏗️ Architecture

### Simple View

```
Browser                 Backend                Data Files
  │                       │                       │
  │  1. /?v2-seed=4       │                       │
  ├──────────────────────>│                       │
  │                       │                       │
  │                       │  2. Load 200 items    │
  │                       ├──────────────────────>│
  │                       │  restaurants_1.json   │
  │                       │<──────────────────────┤
  │                       │                       │
  │                       │  3. Use seed=4        │
  │                       │     Select 50 items   │
  │                       │                       │
  │  4. Return 50 items   │                       │
  │<──────────────────────┤                       │
  │                       │                       │
  │  5. Display           │                       │
  │                       │                       │
```

### Technical View

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Read ?v2-seed=X from URL                        │   │
│  │  2. Call fetchSeededSelection()                     │   │
│  │  3. Display data                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP GET
                         │ /datasets/load?seed_value=X
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend (FastAPI - webs_server)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Load data from JSON files                       │   │
│  │  2. Apply seed-based selection                      │   │
│  │  3. Return subset                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Data Storage (~/webs_data/)                      │
│  • Persistent JSON files                                    │
│  • Master datasets (200+ records per entity)                │
│  • Organized by project and entity type                     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Usage

### Enabling V2 in a Project

1. **Build with v2 enabled:**

```bash
cd web_4_autodining

ENABLE_DYNAMIC_V2_DB_MODE=true \
NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true \
NEXT_PUBLIC_API_URL=http://localhost:8090 \
WEB_PORT=8003 \
  docker compose -p autodining_8003 up -d --build
```

2. **Access with different seeds:**

```bash
# Seed 1
http://localhost:8003/?v2-seed=1

# Seed 23
http://localhost:8003/?v2-seed=23

# Seed 99
http://localhost:8003/?v2-seed=99
```

### Frontend Implementation

**Step 1: Read seed from URL**

```typescript
// src/hooks/useSeed.ts
export function useSeed() {
  const searchParams = useSearchParams();
  const v2Seed = searchParams.get("v2-seed");

  return {
    v2Seed: v2Seed ? parseInt(v2Seed) : null,
  };
}
```

**Step 2: Fetch data with seed**

```typescript
// src/data/restaurants-enhanced.ts
export async function initializeRestaurants(
  v2Seed?: number
): Promise<Restaurant[]> {
  const dbModeEnabled = isDbLoadModeEnabled();

  if (!dbModeEnabled) {
    // v2 not enabled, use default seed=1
    effectiveSeed = 1;
  } else {
    // v2 enabled, use provided seed or default to 1
    effectiveSeed = v2Seed ?? 1;
  }

  const data = await fetchSeededSelection<Restaurant>({
    projectKey: "web_4_autodining",
    entityType: "restaurants",
    seedValue: effectiveSeed,
    limit: 50,
    method: "distribute",
  });

  return data;
}
```

**Step 3: Use in component**

```typescript
// src/app/page.tsx
function RestaurantList() {
  const { v2Seed } = useSeed();
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await initializeRestaurants(v2Seed);
      setRestaurants(data);
    }
    loadData();
  }, [v2Seed]); // Reload when seed changes

  return (
    <div>
      {restaurants.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  );
}
```

## 🔄 Seed Persistence

The v2-seed is automatically preserved when navigating:

```typescript
// Use SeedLink component to preserve v2-seed in URLs
import { SeedLink } from "@/components/ui/SeedLink";

<SeedLink href="/restaurant/5">View Details</SeedLink>;

// This will preserve v2-seed:
// /restaurant/5?v2-seed=23
```

## 📊 Data Generation

### Smart Generation (AI-Powered)

Generate new data using OpenAI:

```bash
curl -X POST http://localhost:8090/datasets/generate-smart \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_4_autodining",
    "entity_type": "restaurants",
    "count": 200,
    "mode": "append"
  }'
```

**Modes:**

- `append`: Add to existing `_1.json` file
- `replace`: Create new timestamped file

### Initial Data Setup

The `setup.sh` script automatically copies initial data:

```bash
# Initial data is stored in:
webs_server/initial_data/
├── web_4_autodining/
│   ├── main.json
│   └── data/
│       └── restaurants_1.json  # 200 records

# Deployed to persistent volume:
~/webs_data/web_4_autodining/...
```

## 🎲 Why Seed-Based?

### Advantages

1. **Deterministic**: Same seed = same data every time
2. **Reproducible**: Demos can be replicated by sharing a seed
3. **No Database Required**: Works with JSON files
4. **Fast**: No complex queries or joins
5. **Testable**: QA can test specific scenarios with specific seeds

### Use Cases (Real Examples)

#### 1. Client Demos

```
Client A gets: ?v2-seed=10  (shows tech restaurants)
Client B gets: ?v2-seed=25  (shows family restaurants)
Client C gets: ?v2-seed=99  (shows fine dining)
```

Same app, different data for each client!

#### 2. Testing

```
QA Test 1: ?v2-seed=1   (test with restaurants A, B, C)
QA Test 2: ?v2-seed=50  (test with restaurants X, Y, Z)
Bug report: "Error with seed=50" → developer tests exact same data
```

#### 3. Training

```
Training Video: "Visit ?v2-seed=42 to follow along"
All trainees see exactly the same data → easier to teach
```

#### 4. Comparison

```
Manager: "Compare seed=10 vs seed=20, which looks better?"
Everyone sees the same two variations → easier decision
```

## 📁 Project Status

### Implemented Projects

| Project             | Entities                              | Records  | Port |
| ------------------- | ------------------------------------- | -------- | ---- |
| web_4_autodining    | restaurants                           | 200      | 8003 |
| web_5_autocrm       | clients, matters, events, files, logs | 200 each | 8004 |
| web_6_automail      | emails                                | 200      | 8005 |
| web_7_autodelivery  | restaurants                           | 200      | 8006 |
| web_8_autolodge     | hotels                                | 200      | 8007 |
| web_10_autowork     | experts, jobs, hires, skills          | 50-100   | 8009 |
| web_11_autocalendar | calendar_events                       | 10       | 8010 |

### Recommended Pool Size

For robust demos:

- **Minimum**: 200 records (pool 4x larger than typical limit of 50)
- **Optimal**: 2000 records (pool 20-40x larger than typical limit)

With 200+ records, different seeds will show genuinely different content, not just reordered data.

## 🛠️ Technical Details

### Seeded Selection Algorithm

```python
# Python implementation (webs_server/src/seeded_selector.py)

def seeded_distribution(
    data: List[Dict],
    seed: int,
    limit: int,
    category_key: str
) -> List[Dict]:
    """
    Select items with proportional distribution across categories
    """
    rng = random.Random(seed)

    # Group by category
    by_category = defaultdict(list)
    for item in data:
        category = item.get(category_key, "unknown")
        by_category[category].append(item)

    # Calculate proportional distribution
    total_items = len(data)
    selected = []

    for category, items in by_category.items():
        category_ratio = len(items) / total_items
        items_to_select = max(1, int(limit * category_ratio))

        # Randomly select from this category
        selected.extend(rng.sample(items, min(items_to_select, len(items))))

    # Shuffle final result
    rng.shuffle(selected)

    # Return exactly 'limit' items
    return selected[:limit]
```

### Frontend API Call

```typescript
// src/shared/seeded-loader.ts

export async function fetchSeededSelection<T>(options: {
  projectKey: string;
  entityType: string;
  seedValue: number;
  limit: number;
  method: "distribute" | "shuffle" | "select";
}): Promise<T[]> {
  const params = new URLSearchParams({
    project_key: options.projectKey,
    entity_type: options.entityType,
    seed_value: String(options.seedValue),
    limit: String(options.limit),
    method: options.method,
  });

  const response = await fetch(`http://localhost:8090/datasets/load?${params}`);

  const json = await response.json();
  return json.data as T[];
}
```

## 🐛 Troubleshooting

### "Same data for different seeds"

**Problem**: Different seeds show the same data (just reordered)

**Cause**: Master dataset is too small (< 50 records)

**Solution**: Generate more data (aim for 200+)

```bash
curl -X POST http://localhost:8090/datasets/generate-smart \
  -H "Content-Type: application/json" \
  -d '{
    "project_key": "web_X_project",
    "entity_type": "entity_name",
    "count": 200,
    "mode": "append"
  }'
```

### "v2-seed lost on navigation"

**Problem**: Seed parameter disappears when clicking links

**Cause**: Using regular `<Link>` instead of `<SeedLink>`

**Solution**: Use `SeedLink` component

```typescript
// ❌ Don't use regular Link for internal navigation
import Link from "next/link";
<Link href="/details">...</Link>;

// ✅ Use SeedLink to preserve v2-seed
import { SeedLink } from "@/components/ui/SeedLink";
<SeedLink href="/details">...</SeedLink>;
```

### "Data not loading"

**Problem**: 404 errors or empty data

**Cause**: Data files not present in container

**Solution**: Rebuild and ensure data is copied

```bash
# 1. Check if data exists
docker exec webs_server-app-1 ls -la /app/data/web_X_project/data/

# 2. If missing, rebuild webs_server
cd webs_server
docker compose down
docker compose up -d --build

# 3. Verify data copied
docker exec webs_server-app-1 cat /app/data/web_X_project/main.json
```

## 🔐 Environment Variables

### Required Variables

```bash
# Enable v2 mode
ENABLE_DYNAMIC_V2_DB_MODE=true
NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true

# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8090

# OpenAI (for smart generation)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

### Setting Variables

**In docker-compose.yml:**

```yaml
environment:
  - NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=${NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE}
  - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
```

**Or inline when building:**

```bash
ENABLE_DYNAMIC_V2_DB_MODE=true \
NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=true \
  docker compose up -d --build
```

## 📚 Related Documentation

- `webs_server/README_SMART_GENERATION.md` - Smart data generation guide
- `webs_server/initial_data/README.md` - Initial data structure
- `scripts/setup.sh` - Deployment script

## 🤝 Contributing

To add v2 support to a new project:

1. Create initial data JSON files in `webs_server/initial_data/web_X_project/`
2. Implement `initializeEntity()` function that uses `fetchSeededSelection()`
3. Use `useSeed()` hook to read v2-seed from URL
4. Replace `<Link>` with `<SeedLink>` for internal navigation
5. Add dynamic data loading with `useEffect([v2Seed])`
6. Test with different seeds to ensure variety

## 📈 Future Improvements

- [ ] Expand all projects to 2000 records each
- [ ] Add seed analytics (which seeds are most used)
- [ ] Implement seed "favorites" system
- [ ] Add seed preview/comparison UI
- [ ] Support for seed ranges (e.g., "give me data from seeds 10-20")
- [ ] Seed-based user preferences persistence

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Maintained By**: Autoppia Team
