# POE2Scout API Documentation

This document describes the POE2Scout API endpoints for retrieving Path of Exile 2 item and currency data.

## Base URL
```
https://poe2scout.com/api
```

## Endpoints

### 1. Get Categories
**Endpoint:** `GET /items/categories`

**Description:** Returns all available item categories including unique items and currency categories.

**Parameters:** None

**Response Structure:**
```json
{
  "unique_categories": [
    {
      "id": 1,
      "apiId": "accessory",
      "label": "Accessories",
      "icon": "https://web.poecdn.com/..."
    }
  ],
  "currency_categories": [
    {
      "id": 1,
      "apiId": "currency",
      "label": "Currency",
      "icon": "https://web.poecdn.com/..."
    }
  ]
}
```

**Example:**
```bash
curl "https://poe2scout.com/api/items/categories"
```

### 2. Get Leagues
**Endpoint:** `GET /leagues`

**Description:** Returns all available leagues with their divine and chaos orb prices.

**Parameters:** None

**Response Structure:**
```json
[
  {
    "value": "Rise of the Abyssal",
    "divinePrice": 277.77,
    "chaosDivinePrice": 38.32
  }
]
```

**Example:**
```bash
curl "https://poe2scout.com/api/leagues"
```

### 3. Get Filters
**Endpoint:** `GET /items/filters`

**Description:** Returns all available item filters for searching.

**Parameters:** None

**Response Structure:**
```json
[
  {
    "display_name": "Season of the Hunt",
    "category": "map",
    "identifier": "Season of the Hunt"
  }
]
```

**Example:**
```bash
curl "https://poe2scout.com/api/items/filters"
```

### 4. Currency Endpoints
All currency endpoints follow the same pattern with different category paths.

**Base Pattern:** `GET /items/currency/{category}`

**Available Categories:**
- `currency` - Standard currency items
- `ritual` - Ritual omens
- `fragments` - Map fragments and keys
- `runes` - Runes
- `talismans` - Talismans
- `essences` - Essences
- `ultimatum` - Soul cores
- `expedition` - Expedition coinage & artifacts
- `vaultkeys` - Reliquary keys
- `breach` - Breach items
- `abyss` - Abyssal bones
- `uncutgems` - Uncut gems
- `lineagesupportgems` - Lineage support gems
- `delirium` - Delirium items

**Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `perPage` (integer, optional) - Items per page (default: 100)
- `league` (string, required) - League name (URL encoded)
- `search` (string, optional) - Search term
- `referenceCurrency` (string, required) - Reference currency for pricing

**Response Structure:**
```json
{
  "currentPage": 1,
  "pages": 8,
  "total": 37,
  "items": [
    {
      "id": 18,
      "itemId": 295,
      "currencyCategoryId": 1,
      "apiId": "mirror",
      "text": "Mirror of Kalandra",
      "categoryApiId": "currency",
      "iconUrl": "https://web.poecdn.com/...",
      "itemMetadata": {
        "name": "Mirror of Kalandra",
        "base_type": "Mirror of Kalandra",
        "icon": "https://web.poecdn.com/...",
        "stack_size": 1,
        "max_stack_size": 10,
        "description": "Right click this item...",
        "effect": ["Creates a Mirrored copy of an item"]
      },
      "priceLogs": [
        {
          "price": 212221.73,
          "time": "2025-09-20T06:00:00",
          "quantity": 11
        }
      ],
      "currentPrice": 212221.73
    }
  ]
}
```

**Examples:**

**Standard Currency:**
```bash
curl "https://poe2scout.com/api/items/currency/currency?page=1&perPage=100&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted"
```

**Ritual Omens:**
```bash
curl "https://poe2scout.com/api/items/currency/ritual?page=1&perPage=100&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted"
```

**Fragments:**
```bash
curl "https://poe2scout.com/api/items/currency/fragments?page=1&perPage=100&league=Rise%20of%20the%20Abyssal&search=&referenceCurrency=exalted"
```

## Common Parameters

### League Names
Common league names (URL encode spaces as `%20`):
- `Rise of the Abyssal`
- `HC Rise of the Abyssal`
- `Dawn of the Hunt`
- `HC Dawn of the Hunt`
- `Standard`
- `Hardcore`

### Reference Currencies
Common reference currencies:
- `exalted` - Exalted Orb
- `divine` - Divine Orb
- `chaos` - Chaos Orb

## Rate Limiting
The API doesn't specify rate limits, but it's recommended to be respectful with request frequency.

## Error Handling
The API returns standard HTTP status codes. Successful requests return 200 OK with JSON data.

## TypeScript Client

A TypeScript client is available at `src/lib/poe2scout.ts` that provides a convenient interface for the API.

### Installation

```bash
npm install axios
```

### Basic Usage

```typescript
import { poe2scout, LEAGUES, REFERENCE_CURRENCIES } from './lib/poe2scout';

// Get all categories
const categories = await poe2scout.getCategories();

// Get leagues
const leagues = await poe2scout.getLeagues();

// Get standard currency (using defaults)
const currency = await poe2scout.getStandardCurrency();

// Get standard currency with custom parameters
const customCurrency = await poe2scout.getStandardCurrency({
  league: LEAGUES.STANDARD,
  referenceCurrency: REFERENCE_CURRENCIES.DIVINE,
  perPage: 50,
});

// Search across multiple categories (using defaults)
const results = await poe2scout.searchItems('chaos');

// Search with custom parameters
const customResults = await poe2scout.searchItems(
  'chaos',
  {
    league: LEAGUES.STANDARD,
    referenceCurrency: REFERENCE_CURRENCIES.DIVINE,
  },
  ['currency', 'ritual']
);
```

### Default Parameters

The client uses the following defaults:
- `page`: 1
- `perPage`: 100
- `league`: 'Rise of the Abyssal'
- `referenceCurrency`: 'exalted'

You can override any of these by passing them in the parameters object.

### Available Methods

- `getCategories()` - Get all item categories
- `getLeagues()` - Get all leagues
- `getFilters()` - Get search filters
- `getStandardCurrency(params)` - Get standard currency
- `getRitualOmens(params)` - Get ritual omens
- `getFragments(params)` - Get fragments
- `getRunes(params)` - Get runes
- `getTalismans(params)` - Get talismans
- `getEssences(params)` - Get essences
- `getUltimatum(params)` - Get ultimatum items
- `getExpedition(params)` - Get expedition items
- `getVaultKeys(params)` - Get vault keys
- `getBreach(params)` - Get breach items
- `getAbyss(params)` - Get abyss items
- `getUncutGems(params)` - Get uncut gems
- `getLineageSupportGems(params)` - Get lineage support gems
- `getDelirium(params)` - Get delirium items
- `searchItems(term, league, currency, categories)` - Search across categories

See `src/examples/poe2scout-usage.ts` for detailed usage examples.

## Notes
- All prices are returned as floating-point numbers
- Timestamps are in ISO 8601 format
- Some items may have `null` itemMetadata
- Price logs show historical pricing data with timestamps and quantities
- Icons are hosted on web.poecdn.com
