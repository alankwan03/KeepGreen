// KeepGreen Bundle - Clean React 18 Architecture
(function() {
  'use strict';
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useState, useEffect, useCallback, useMemo, useRef } = React;

  // --- 1. Constants & Presets & 80+ Plant Reference Database ---
  // Helper to compute a dynamic date relative to today (YYYY-MM-DD)
// This ensures that whenever the app is first opened, the starter demo plants
// showcase all 3 status badge states (Green, Amber, Red).
function getRelativeDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const VERSION_KEY = 'keepgreen_data_version';
const CURRENT_VERSION = '0.2-alpha-1';
const STORAGE_KEY = 'keepgreen_plants';

const INITIAL_PLANTS = [
  {
    id: 'starter-monstera-deliciosa',
    name: 'Monstera Deliciosa',
    nickname: null,
    subtitle: 'Swiss Cheese Plant',
    scientificName: 'Monstera deliciosa',
    category: 'foliage',
    location: 'Living Room',
    waterIntervalDays: 7,
    // Watered 2 days ago -> 5 days remaining (Healthy / Green)
    lastWateredDate: getRelativeDate(2),
    sunlightLevel: 'medium',
    sunlightLabel: 'Bright / Indirect Light',
    waterAmount: 'medium',
    waterAmountLabel: 'Regular Water',
    careTips: 'Likes bright indirect light. Water when top 2 inches of soil feel dry.',
    colorTheme: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    id: 'starter-golden-pothos',
    name: 'Golden Pothos',
    nickname: null,
    subtitle: "Devil's Ivy",
    scientificName: 'Epipremnum aureum',
    category: 'foliage',
    location: 'Kitchen Shelf',
    waterIntervalDays: 6,
    // Watered 6 days ago -> 0 days remaining (Due Today / Amber-Red)
    lastWateredDate: getRelativeDate(6),
    sunlightLevel: 'medium',
    sunlightLabel: 'Medium / Indirect',
    waterAmount: 'medium',
    waterAmountLabel: 'Regular Water',
    careTips: 'Trailing vines grow quickly. Very forgiving if watering is delayed slightly.',
    colorTheme: 'teal',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75',
    image: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    id: 'starter-peace-lily',
    name: 'Peace Lily',
    nickname: null,
    subtitle: 'Spathiphyllum',
    scientificName: 'Spathiphyllum wallisii',
    category: 'flowering',
    location: 'Bedroom Corner',
    waterIntervalDays: 5,
    // Watered 8 days ago -> 3 days overdue (Needs Water Today / Red)
    lastWateredDate: getRelativeDate(8),
    sunlightLevel: 'low',
    sunlightLabel: 'Low / Shade Light',
    waterAmount: 'medium',
    waterAmountLabel: 'Medium Water',
    careTips: 'Loves moisture and high humidity. Will droop dramatically when thirsty, but perks up quickly after watering.',
    colorTheme: 'purple',
    imageUrl: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=400&q=75',
    image: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=400&q=75'
  },
  {
    id: 'starter-snake-plant',
    name: 'Snake Plant',
    nickname: null,
    subtitle: "Mother-in-Law's Tongue",
    scientificName: 'Sansevieria trifasciata',
    category: 'succulent',
    location: 'Office Desk',
    waterIntervalDays: 14,
    // Watered 4 days ago -> 10 days remaining (Healthy / Green)
    lastWateredDate: getRelativeDate(4),
    sunlightLevel: 'low',
    sunlightLabel: 'Low to Bright Light',
    waterAmount: 'low',
    waterAmountLabel: 'Low Water',
    careTips: 'Extremely resilient. Water sparingly; thrives even with low light and infrequent care.',
    colorTheme: 'emerald',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75'
  }
];

const STARTER_PRESETS = INITIAL_PLANTS;


  /**
 * KeepGreen Comprehensive Plant Reference Database (231 Varieties)
 * Curated house and garden library scaled across 5 core categories:
 * Foliage (68), Succulents & Cacti (52), Ferns & Palms (32), Flowering (45), Herbs & Edibles (34).
 *
 * ZERO LOCALSTORAGE BLOAT: Static source reference only.
 * Remote CDN image URLs are pre-optimized (?auto=format&fit=crop&w=400&q=75).
 */

const CATEGORY_FALLBACKS = {
  foliage: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75',
  succulent: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75',
  herb: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75',
  flowering: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75',
  palm: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75',
  // Backward compatibility keys
  leafy: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75',
  'Indoor Foliage': 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75',
  'Succulents & Cacti': 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75',
  'Herbs & Edibles': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75',
  'Outdoor & Flowering': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75',
  'Ferns & Palms': 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
};

function getCategoryFallback(category) {
  if (!category) return CATEGORY_FALLBACKS.foliage;
  const cat = String(category).toLowerCase();
  if (cat.includes('succulent') || cat.includes('cacti') || cat.includes('cactus')) return CATEGORY_FALLBACKS.succulent;
  if (cat.includes('herb') || cat.includes('edible') || cat.includes('vegetable')) return CATEGORY_FALLBACKS.herb;
  if (cat.includes('flower') || cat.includes('bloom')) return CATEGORY_FALLBACKS.flowering;
  if (cat.includes('palm') || cat.includes('fern')) return CATEGORY_FALLBACKS.palm;
  return CATEGORY_FALLBACKS.foliage;
}

const PLANT_DATABASE = [
  {
    "id": "preset-monstera-deliciosa",
    "name": "Monstera Deliciosa",
    "commonName": "Monstera Deliciosa",
    "scientificName": "Monstera deliciosa",
    "botanicalName": "Monstera deliciosa",
    "alternateNames": "Swiss Cheese Plant / Split-Leaf Philodendron",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room",
    "notes": "Iconic fenestrated leaves. Allow top 2 inches of soil to dry out between waterings.",
    "noviceTip": "Iconic fenestrated leaves. Allow top 2 inches of soil to dry out between waterings.",
    "imageUrl": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-monstera-adansonii",
    "name": "Monstera Adansonii",
    "commonName": "Monstera Adansonii",
    "scientificName": "Monstera adansonii",
    "botanicalName": "Monstera adansonii",
    "alternateNames": "Monkey Mask / Swiss Cheese Vine",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Perforated trailing vine; loves high humidity and a moss pole or hanging basket.",
    "noviceTip": "Perforated trailing vine; loves high humidity and a moss pole or hanging basket.",
    "imageUrl": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-monstera-standleyana",
    "name": "Monstera Standleyana",
    "commonName": "Monstera Standleyana",
    "scientificName": "Monstera standleyana",
    "botanicalName": "Monstera standleyana",
    "alternateNames": "Five Holes Plant / Variegated Cobra",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Lance-shaped leaves with white or yellow speckles; avoid harsh direct afternoon sun.",
    "noviceTip": "Lance-shaped leaves with white or yellow speckles; avoid harsh direct afternoon sun.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-monstera-peru",
    "name": "Monstera Peru",
    "commonName": "Monstera Peru",
    "scientificName": "Monstera karstenianum",
    "botanicalName": "Monstera karstenianum",
    "alternateNames": "Karstenianum / Corrugated Monstera",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bedroom Shelf",
    "notes": "Thick corrugated textured leaves; more drought-tolerant than standard monsteras.",
    "noviceTip": "Thick corrugated textured leaves; more drought-tolerant than standard monsteras.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-monstera-dubia",
    "name": "Monstera Dubia",
    "commonName": "Monstera Dubia",
    "scientificName": "Monstera dubia",
    "botanicalName": "Monstera dubia",
    "alternateNames": "Shingle Plant",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Wall",
    "notes": "Lies flat against wooden support planks when young; appreciates consistent humidity.",
    "noviceTip": "Lies flat against wooden support planks when young; appreciates consistent humidity.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-golden-pothos",
    "name": "Golden Pothos",
    "commonName": "Golden Pothos",
    "scientificName": "Epipremnum aureum",
    "botanicalName": "Epipremnum aureum",
    "alternateNames": "Devil's Ivy / Money Plant",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Office Desk",
    "notes": "Virtually indestructible; leaves droop softly when it is thirsty and perk right back up.",
    "noviceTip": "Virtually indestructible; leaves droop softly when it is thirsty and perk right back up.",
    "imageUrl": "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-marble-queen-pothos",
    "name": "Marble Queen Pothos",
    "commonName": "Marble Queen Pothos",
    "scientificName": "Epipremnum aureum Marble Queen",
    "botanicalName": "Epipremnum aureum Marble Queen",
    "alternateNames": "Variegated Pothos",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Heavily marbled cream-and-green foliage; requires brighter indirect light to keep variegation.",
    "noviceTip": "Heavily marbled cream-and-green foliage; requires brighter indirect light to keep variegation.",
    "imageUrl": "https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-neon-pothos",
    "name": "Neon Pothos",
    "commonName": "Neon Pothos",
    "scientificName": "Epipremnum aureum Neon",
    "botanicalName": "Epipremnum aureum Neon",
    "alternateNames": "Lime Pothos",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Counter",
    "notes": "Vibrant chartreuse foliage; thrives in medium to bright indirect light without scorching.",
    "noviceTip": "Vibrant chartreuse foliage; thrives in medium to bright indirect light without scorching.",
    "imageUrl": "https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-cebu-blue-pothos",
    "name": "Cebu Blue Pothos",
    "commonName": "Cebu Blue Pothos",
    "scientificName": "Epipremnum pinnatum Cebu Blue",
    "botanicalName": "Epipremnum pinnatum Cebu Blue",
    "alternateNames": "Blue Pothos",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bedroom Hanging Pot",
    "notes": "Silvery blue-green elongated foliage; can produce natural splits when climbing upwards.",
    "noviceTip": "Silvery blue-green elongated foliage; can produce natural splits when climbing upwards.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-manjula-pothos",
    "name": "Manjula Pothos",
    "commonName": "Manjula Pothos",
    "scientificName": "Epipremnum aureum Manjula",
    "botanicalName": "Epipremnum aureum Manjula",
    "alternateNames": "Happy Leaf Pothos",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Bookshelf",
    "notes": "Wide wavy heart-shaped leaves splashed with shades of cream, mint, and deep emerald.",
    "noviceTip": "Wide wavy heart-shaped leaves splashed with shades of cream, mint, and deep emerald.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-satin-pothos",
    "name": "Satin Pothos",
    "commonName": "Satin Pothos",
    "scientificName": "Scindapsus pictus Argyraeus",
    "botanicalName": "Scindapsus pictus Argyraeus",
    "alternateNames": "Silver Satin Vine / Silver Pothos",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bedroom Hanging Basket",
    "notes": "Velvety matte leaves with reflective silver speckles; leaves curl gently when underwatered.",
    "noviceTip": "Velvety matte leaves with reflective silver speckles; leaves curl gently when underwatered.",
    "imageUrl": "https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-scindapsus-trebie",
    "name": "Scindapsus Trebie",
    "commonName": "Scindapsus Trebie",
    "scientificName": "Scindapsus pictus Trebie",
    "botanicalName": "Scindapsus pictus Trebie",
    "alternateNames": "Exotica Satin Pothos",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Large heart-shaped leaves with dramatic, heavy silver variegation patches.",
    "noviceTip": "Large heart-shaped leaves with dramatic, heavy silver variegation patches.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-scindapsus-moonlight",
    "name": "Scindapsus Moonlight",
    "commonName": "Scindapsus Moonlight",
    "scientificName": "Scindapsus treubii Moonlight",
    "botanicalName": "Scindapsus treubii Moonlight",
    "alternateNames": "Sterling Silver Scindapsus",
    "category": "foliage",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Coffee Table",
    "notes": "Sleek leathery leaves washed with a metallic silver-green sheen; loves warmth and moderate watering.",
    "noviceTip": "Sleek leathery leaves washed with a metallic silver-green sheen; loves warmth and moderate watering.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-fiddle-leaf-fig",
    "name": "Fiddle Leaf Fig",
    "commonName": "Fiddle Leaf Fig",
    "scientificName": "Ficus lyrata",
    "botanicalName": "Ficus lyrata",
    "alternateNames": "Violin Fig / Banjo Fig",
    "category": "foliage",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Showstopping violin-shaped leathery leaves; prefers stable positions away from cold drafts.",
    "noviceTip": "Showstopping violin-shaped leathery leaves; prefers stable positions away from cold drafts.",
    "imageUrl": "https://images.unsplash.com/photo-1597055181300-e3633a917c9c?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1597055181300-e3633a917c9c?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-rubber-plant-burgundy",
    "name": "Rubber Plant Burgundy",
    "commonName": "Rubber Plant Burgundy",
    "scientificName": "Ficus elastica Burgundy",
    "botanicalName": "Ficus elastica Burgundy",
    "alternateNames": "Indian Rubber Tree / Black Prince",
    "category": "foliage",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Glossy deep burgundy-bronze leaves. Wipe foliage with a damp cloth to keep pores breathing.",
    "noviceTip": "Glossy deep burgundy-bronze leaves. Wipe foliage with a damp cloth to keep pores breathing.",
    "imageUrl": "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-rubber-plant-tineke",
    "name": "Rubber Plant Tineke",
    "commonName": "Rubber Plant Tineke",
    "scientificName": "Ficus elastica Tineke",
    "botanicalName": "Ficus elastica Tineke",
    "alternateNames": "Variegated Rubber Tree",
    "category": "foliage",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bright Window Corner",
    "notes": "Camo-patterned green, cream, and pink tones; water thoroughly when the top half of soil dries.",
    "noviceTip": "Camo-patterned green, cream, and pink tones; water thoroughly when the top half of soil dries.",
    "imageUrl": "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-ficus-audrey",
    "name": "Ficus Audrey",
    "commonName": "Ficus Audrey",
    "scientificName": "Ficus benghalensis",
    "botanicalName": "Ficus benghalensis",
    "alternateNames": "Banyan Tree / Audrey Fig",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Velvety emerald leaves with striking pale veins; far more forgiving of routine changes than Fiddle Leaf Fig.",
    "noviceTip": "Velvety emerald leaves with striking pale veins; far more forgiving of routine changes than Fiddle Leaf Fig.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-weeping-fig",
    "name": "Weeping Fig",
    "commonName": "Weeping Fig",
    "scientificName": "Ficus benjamina",
    "botanicalName": "Ficus benjamina",
    "alternateNames": "Benjamin Fig / Ficus Tree",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hallway Nook",
    "notes": "Graceful weeping branches with glossy pointed leaves; dislikes sudden environmental transitions.",
    "noviceTip": "Graceful weeping branches with glossy pointed leaves; dislikes sudden environmental transitions.",
    "imageUrl": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-philodendron-birkin",
    "name": "Philodendron Birkin",
    "commonName": "Philodendron Birkin",
    "scientificName": "Philodendron Birkin",
    "botanicalName": "Philodendron Birkin",
    "alternateNames": "White Wave Philodendron",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Compact rosette featuring pin-stripe white variegation across glossy dark green leaves.",
    "noviceTip": "Compact rosette featuring pin-stripe white variegation across glossy dark green leaves.",
    "imageUrl": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-philodendron-pink-princess",
    "name": "Pink Princess Philodendron",
    "commonName": "Pink Princess Philodendron",
    "scientificName": "Philodendron erubescens Pink Princess",
    "botanicalName": "Philodendron erubescens Pink Princess",
    "alternateNames": "PPP / Blushing Philodendron",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Sought-after black leaves marked with electric bubblegum-pink sectoral splashes.",
    "noviceTip": "Sought-after black leaves marked with electric bubblegum-pink sectoral splashes.",
    "imageUrl": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-philodendron-heartleaf",
    "name": "Heartleaf Philodendron",
    "commonName": "Heartleaf Philodendron",
    "scientificName": "Philodendron hederaceum",
    "botanicalName": "Philodendron hederaceum",
    "alternateNames": "Sweetheart Plant",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Bookshelf Edge",
    "notes": "Tender heart-shaped cascading foliage; thrives in lower light conditions and forgives missed waterings.",
    "noviceTip": "Tender heart-shaped cascading foliage; thrives in lower light conditions and forgives missed waterings.",
    "imageUrl": "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-philodendron-brasil",
    "name": "Philodendron Brasil",
    "commonName": "Philodendron Brasil",
    "scientificName": "Philodendron hederaceum Brasil",
    "botanicalName": "Philodendron hederaceum Brasil",
    "alternateNames": "Variegated Heartleaf",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Kitchen Shelf",
    "notes": "Heartleaf variety featuring lively lime-green painted brushstrokes down each leaf center.",
    "noviceTip": "Heartleaf variety featuring lively lime-green painted brushstrokes down each leaf center.",
    "imageUrl": "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-philodendron-micans",
    "name": "Philodendron Micans",
    "commonName": "Philodendron Micans",
    "scientificName": "Philodendron hederaceum var. micranthum",
    "botanicalName": "Philodendron hederaceum var. micranthum",
    "alternateNames": "Velvet Leaf Philodendron",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bedroom Hanging Planter",
    "notes": "Lush iridescent velvet leaves that shimmer in bronze, rust, and emerald tones.",
    "noviceTip": "Lush iridescent velvet leaves that shimmer in bronze, rust, and emerald tones.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-philodendron-prince-of-orange",
    "name": "Prince of Orange",
    "commonName": "Prince of Orange",
    "scientificName": "Philodendron Prince of Orange",
    "botanicalName": "Philodendron Prince of Orange",
    "alternateNames": "Orange Philodendron",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "New leaves emerge in bright apricot orange before shifting to amber-yellow and green.",
    "noviceTip": "New leaves emerge in bright apricot orange before shifting to amber-yellow and green.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-philodendron-white-knight",
    "name": "White Knight Philodendron",
    "commonName": "White Knight Philodendron",
    "scientificName": "Philodendron White Knight",
    "botanicalName": "Philodendron White Knight",
    "alternateNames": "Variegated Erubescens",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Distinct purple-tinged climbing stems with crisp bright white blocks across dark foliage.",
    "noviceTip": "Distinct purple-tinged climbing stems with crisp bright white blocks across dark foliage.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-philodendron-lemon-lime",
    "name": "Lemon Lime Philodendron",
    "commonName": "Lemon Lime Philodendron",
    "scientificName": "Philodendron hederaceum Lemon Lime",
    "botanicalName": "Philodendron hederaceum Lemon Lime",
    "alternateNames": "Neon Heartleaf",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Electric chartreuse heart foliage that brightens dimly lit corners instantly.",
    "noviceTip": "Electric chartreuse heart foliage that brightens dimly lit corners instantly.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-philodendron-rojo-congo",
    "name": "Rojo Congo Philodendron",
    "commonName": "Rojo Congo Philodendron",
    "scientificName": "Philodendron Rojo Congo",
    "botanicalName": "Philodendron Rojo Congo",
    "alternateNames": "Red Congo",
    "category": "foliage",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Floor Planter",
    "notes": "Self-heading upright plant with massive copper-red new leaves maturing into leathery deep green.",
    "noviceTip": "Self-heading upright plant with massive copper-red new leaves maturing into leathery deep green.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-philodendron-xanadu",
    "name": "Philodendron Xanadu",
    "commonName": "Philodendron Xanadu",
    "scientificName": "Thaumatophyllum xanadu",
    "botanicalName": "Thaumatophyllum xanadu",
    "alternateNames": "Winterbourn / Cut-Leaf Philodendron",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Dense clump-forming habit with deeply lobed, finger-like architectural leaves.",
    "noviceTip": "Dense clump-forming habit with deeply lobed, finger-like architectural leaves.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-alocasia-polly",
    "name": "Alocasia Polly",
    "commonName": "Alocasia Polly",
    "scientificName": "Alocasia x amazonica Polly",
    "botanicalName": "Alocasia x amazonica Polly",
    "alternateNames": "African Mask / Elephant Ear",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Warm Humid Room",
    "notes": "Dramatic scalloped arrow leaves with bold silver veins; thrives in warm, humid rooms.",
    "noviceTip": "Dramatic scalloped arrow leaves with bold silver veins; thrives in warm, humid rooms.",
    "imageUrl": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-alocasia-zebrina",
    "name": "Alocasia Zebrina",
    "commonName": "Alocasia Zebrina",
    "scientificName": "Alocasia zebrina",
    "botanicalName": "Alocasia zebrina",
    "alternateNames": "Zebra Stalk Elephant Ear",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bright Window Corner",
    "notes": "Striking zebra-striped petioles topped with spear-shaped foliage; water when the top inch dries.",
    "noviceTip": "Striking zebra-striped petioles topped with spear-shaped foliage; water when the top inch dries.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-alocasia-black-velvet",
    "name": "Alocasia Black Velvet",
    "commonName": "Alocasia Black Velvet",
    "scientificName": "Alocasia reginula",
    "botanicalName": "Alocasia reginula",
    "alternateNames": "Little Queen Alocasia",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Terrarium / Office Desk",
    "notes": "Thick velvety nearly black leaves with pale silver veins; avoid water pooling on foliage.",
    "noviceTip": "Thick velvety nearly black leaves with pale silver veins; avoid water pooling on foliage.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-alocasia-silver-dragon",
    "name": "Alocasia Silver Dragon",
    "commonName": "Alocasia Silver Dragon",
    "scientificName": "Alocasia baginda Silver Dragon",
    "botanicalName": "Alocasia baginda Silver Dragon",
    "alternateNames": "Dragon Scale Alocasia",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Plant Stand",
    "notes": "Embossed silvery-sage textured leaves with deep emerald veining resembling mythical dragon scales.",
    "noviceTip": "Embossed silvery-sage textured leaves with deep emerald veining resembling mythical dragon scales.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-calathea-medallion",
    "name": "Calathea Medallion",
    "commonName": "Calathea Medallion",
    "scientificName": "Goeppertia veitchiana",
    "botanicalName": "Goeppertia veitchiana",
    "alternateNames": "Medallion Prayer Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bedroom Shelf",
    "notes": "Round feathered leaves with deep emerald halos and rich burgundy undersides; enjoys filtered water.",
    "noviceTip": "Round feathered leaves with deep emerald halos and rich burgundy undersides; enjoys filtered water.",
    "imageUrl": "https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-calathea-orbifolia",
    "name": "Calathea Orbifolia",
    "commonName": "Calathea Orbifolia",
    "scientificName": "Goeppertia orbifolia",
    "botanicalName": "Goeppertia orbifolia",
    "alternateNames": "Round-Leaf Calathea",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Side Table",
    "notes": "Large saucer-sized rounded leaves with silver metallic brush strokes; prefers moist, humid air.",
    "noviceTip": "Large saucer-sized rounded leaves with silver metallic brush strokes; prefers moist, humid air.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-calathea-rattlesnake",
    "name": "Rattlesnake Plant",
    "commonName": "Rattlesnake Plant",
    "scientificName": "Goeppertia insignis",
    "botanicalName": "Goeppertia insignis",
    "alternateNames": "Calathea Lancifolia",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bedroom Nightstand",
    "notes": "Wavy elongated leaves with dark green spots and purple undersides; leaves fold upright at dusk.",
    "noviceTip": "Wavy elongated leaves with dark green spots and purple undersides; leaves fold upright at dusk.",
    "imageUrl": "https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-calathea-makoyana",
    "name": "Peacock Plant",
    "commonName": "Peacock Plant",
    "scientificName": "Goeppertia makoyana",
    "botanicalName": "Goeppertia makoyana",
    "alternateNames": "Calathea Makoyana / Cathedral Windows",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Humid Bathroom Shelf",
    "notes": "Thin paper-like leaves with feather patterns resembling a peacock tail; use rain or distilled water.",
    "noviceTip": "Thin paper-like leaves with feather patterns resembling a peacock tail; use rain or distilled water.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-calathea-ornata",
    "name": "Pinstripe Calathea",
    "commonName": "Pinstripe Calathea",
    "scientificName": "Goeppertia ornata",
    "botanicalName": "Goeppertia ornata",
    "alternateNames": "Pinstripe Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "Dark glossy leaves detailed with delicate candy-pink pinstripes; keep soil evenly moist.",
    "noviceTip": "Dark glossy leaves detailed with delicate candy-pink pinstripes; keep soil evenly moist.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-maranta-red-prayer",
    "name": "Red Prayer Plant",
    "commonName": "Red Prayer Plant",
    "scientificName": "Maranta leuconeura var. erythroneura",
    "botanicalName": "Maranta leuconeura var. erythroneura",
    "alternateNames": "Herringbone Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Coffee Table",
    "notes": "Prominent crimson veins across satin leaves; folds its leaves upward like praying hands at night.",
    "noviceTip": "Prominent crimson veins across satin leaves; folds its leaves upward like praying hands at night.",
    "imageUrl": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-maranta-lemon-lime",
    "name": "Lemon Lime Prayer Plant",
    "commonName": "Lemon Lime Prayer Plant",
    "scientificName": "Maranta leuconeura Lemon Lime",
    "botanicalName": "Maranta leuconeura Lemon Lime",
    "alternateNames": "Neon Prayer Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "Vivid chartreuse leaf ribbing on dark green velvety foliage; easy to propagate in water.",
    "noviceTip": "Vivid chartreuse leaf ribbing on dark green velvety foliage; easy to propagate in water.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-aglaonema-silver-bay",
    "name": "Chinese Evergreen Silver Bay",
    "commonName": "Chinese Evergreen Silver Bay",
    "scientificName": "Aglaonema commutatum Silver Bay",
    "botanicalName": "Aglaonema commutatum Silver Bay",
    "alternateNames": "Silver Chinese Evergreen",
    "category": "foliage",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Dim Hallway",
    "notes": "Super tough plant with wide silver and green leaves; thrives in offices and lower-light corners.",
    "noviceTip": "Super tough plant with wide silver and green leaves; thrives in offices and lower-light corners.",
    "imageUrl": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-aglaonema-red-siam",
    "name": "Aglaonema Red Siam",
    "commonName": "Aglaonema Red Siam",
    "scientificName": "Aglaonema Red Siam Aurora",
    "botanicalName": "Aglaonema Red Siam Aurora",
    "alternateNames": "Red Chinese Evergreen",
    "category": "foliage",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Stunning bright red edges and pink stems; needs slightly more light than green aglaonemas.",
    "noviceTip": "Stunning bright red edges and pink stems; needs slightly more light than green aglaonemas.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-dieffenbachia-camille",
    "name": "Dumb Cane Camille",
    "commonName": "Dumb Cane Camille",
    "scientificName": "Dieffenbachia seguine Camille",
    "botanicalName": "Dieffenbachia seguine Camille",
    "alternateNames": "Camille Dieffenbachia",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Broad cream-white centers with deep green margins; water when top inch of soil feels dry.",
    "noviceTip": "Broad cream-white centers with deep green margins; water when top inch of soil feels dry.",
    "imageUrl": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-chinese-money-plant",
    "name": "Chinese Money Plant",
    "commonName": "Chinese Money Plant",
    "scientificName": "Pilea peperomioides",
    "botanicalName": "Pilea peperomioides",
    "alternateNames": "Pancake Plant / UFO Plant / Friendship Plant",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Window Sill",
    "notes": "Round coin-shaped leaves on slim petioles; rotates toward light and sprouts sweet baby pups.",
    "noviceTip": "Round coin-shaped leaves on slim petioles; rotates toward light and sprouts sweet baby pups.",
    "imageUrl": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-peperomia-watermelon",
    "name": "Watermelon Peperomia",
    "commonName": "Watermelon Peperomia",
    "scientificName": "Peperomia argyreia",
    "botanicalName": "Peperomia argyreia",
    "alternateNames": "Watermelon Begonia",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Coffee Table",
    "notes": "Miniature leaves patterned just like watermelon rind on contrasting red stems.",
    "noviceTip": "Miniature leaves patterned just like watermelon rind on contrasting red stems.",
    "imageUrl": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-peperomia-obtusifolia",
    "name": "Baby Rubber Plant",
    "commonName": "Baby Rubber Plant",
    "scientificName": "Peperomia obtusifolia",
    "botanicalName": "Peperomia obtusifolia",
    "alternateNames": "American Rubber Plant",
    "category": "foliage",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Thick succulent-like cupped leaves; stores water and tolerates dry indoor air easily.",
    "noviceTip": "Thick succulent-like cupped leaves; stores water and tolerates dry indoor air easily.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-peperomia-hope",
    "name": "Peperomia Hope",
    "commonName": "Peperomia Hope",
    "scientificName": "Peperomia deppeana x tetraphylla",
    "botanicalName": "Peperomia deppeana x tetraphylla",
    "alternateNames": "Trailing Peperomia",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hanging Window Basket",
    "notes": "Cute coin-like succulent buttons along cascading stems; allow soil to dry between waterings.",
    "noviceTip": "Cute coin-like succulent buttons along cascading stems; allow soil to dry between waterings.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-string-of-turtles",
    "name": "String of Turtles",
    "commonName": "String of Turtles",
    "scientificName": "Peperomia prostrata",
    "botanicalName": "Peperomia prostrata",
    "alternateNames": "Turtle Vine",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Shelf",
    "notes": "Tiny fleshy trailing leaves patterned like miniature turtle shells; water bottom-up gently.",
    "noviceTip": "Tiny fleshy trailing leaves patterned like miniature turtle shells; water bottom-up gently.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-syngonium-white-butterfly",
    "name": "Arrowhead White Butterfly",
    "commonName": "Arrowhead White Butterfly",
    "scientificName": "Syngonium podophyllum White Butterfly",
    "botanicalName": "Syngonium podophyllum White Butterfly",
    "alternateNames": "Goosefoot Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bathroom Shelf",
    "notes": "Cream and pale green arrow foliage; adapts to either bushy tabletop or climbing habits.",
    "noviceTip": "Cream and pale green arrow foliage; adapts to either bushy tabletop or climbing habits.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-syngonium-neon-robusta",
    "name": "Pink Arrowhead",
    "commonName": "Pink Arrowhead",
    "scientificName": "Syngonium podophyllum Neon Robusta",
    "botanicalName": "Syngonium podophyllum Neon Robusta",
    "alternateNames": "Pink Syngonium",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Table",
    "notes": "Pastel dusty-pink spade foliage with light green undersides; easy and fast-growing.",
    "noviceTip": "Pastel dusty-pink spade foliage with light green undersides; easy and fast-growing.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-dracaena-marginata",
    "name": "Madagascar Dragon Tree",
    "commonName": "Madagascar Dragon Tree",
    "scientificName": "Dracaena marginata",
    "botanicalName": "Dracaena marginata",
    "alternateNames": "Red-Edged Dracaena",
    "category": "foliage",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Floor",
    "notes": "Slender architectural trunk topped with spiky ribbon leaves trimmed in thin crimson edges.",
    "noviceTip": "Slender architectural trunk topped with spiky ribbon leaves trimmed in thin crimson edges.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-dracaena-massangeana",
    "name": "Corn Plant",
    "commonName": "Corn Plant",
    "scientificName": "Dracaena fragrans Massangeana",
    "botanicalName": "Dracaena fragrans Massangeana",
    "alternateNames": "False Palm / Mass Cane",
    "category": "foliage",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Office Corner",
    "notes": "Thick woody cane crowned with cascading yellow-striped leaves; very tolerant of low light.",
    "noviceTip": "Thick woody cane crowned with cascading yellow-striped leaves; very tolerant of low light.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-schefflera-umbrella",
    "name": "Umbrella Tree",
    "commonName": "Umbrella Tree",
    "scientificName": "Schefflera arboricola",
    "botanicalName": "Schefflera arboricola",
    "alternateNames": "Dwarf Umbrella Tree",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Window",
    "notes": "Palmate leaves spreading out like tiny green umbrella spokes; responsive to seasonal pruning.",
    "noviceTip": "Palmate leaves spreading out like tiny green umbrella spokes; responsive to seasonal pruning.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-cast-iron-plant",
    "name": "Cast Iron Plant",
    "commonName": "Cast Iron Plant",
    "scientificName": "Aspidistra elatior",
    "botanicalName": "Aspidistra elatior",
    "alternateNames": "Bar-Room Plant",
    "category": "foliage",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Dark Hallway",
    "notes": "Named for its near-indestructible nature; endures shade, dust, dry air, and irregular waterings.",
    "noviceTip": "Named for its near-indestructible nature; endures shade, dust, dry air, and irregular waterings.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-tradescantia-zebrina",
    "name": "Wandering Dude Zebrina",
    "commonName": "Wandering Dude Zebrina",
    "scientificName": "Tradescantia zebrina",
    "botanicalName": "Tradescantia zebrina",
    "alternateNames": "Silver Inch Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hanging Pot by Window",
    "notes": "Metallic silver and deep purple striped vines; pinch tips regularly for bushier growth.",
    "noviceTip": "Metallic silver and deep purple striped vines; pinch tips regularly for bushier growth.",
    "imageUrl": "https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-tradescantia-nanouk",
    "name": "Tradescantia Nanouk",
    "commonName": "Tradescantia Nanouk",
    "scientificName": "Tradescantia albiflora Nanouk",
    "botanicalName": "Tradescantia albiflora Nanouk",
    "alternateNames": "Fantasy Venice Inch Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Window Sill",
    "notes": "Chunky upright stems with intense bubblegum-pink, white, and purple variegated leaves.",
    "noviceTip": "Chunky upright stems with intense bubblegum-pink, white, and purple variegated leaves.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-fittonia-red-nerve",
    "name": "Red Nerve Plant",
    "commonName": "Red Nerve Plant",
    "scientificName": "Fittonia albivenis Verschaffeltii",
    "botanicalName": "Fittonia albivenis Verschaffeltii",
    "alternateNames": "Mosaic Plant",
    "category": "foliage",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Terrarium / Desk",
    "notes": "Striking bright magenta-red net veins; faints dramatically when dry, reviving shortly after a drink.",
    "noviceTip": "Striking bright magenta-red net veins; faints dramatically when dry, reviving shortly after a drink.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-fittonia-white-anne",
    "name": "White Nerve Plant",
    "commonName": "White Nerve Plant",
    "scientificName": "Fittonia albivenis White Anne",
    "botanicalName": "Fittonia albivenis White Anne",
    "alternateNames": "Silver Nerve Plant",
    "category": "foliage",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bathroom Shelf",
    "notes": "Delicate lace-like white veins across miniature olive leaves; thrives in humid terrariums.",
    "noviceTip": "Delicate lace-like white veins across miniature olive leaves; thrives in humid terrariums.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-coleus-rainbow",
    "name": "Coleus Rainbow",
    "commonName": "Coleus Rainbow",
    "scientificName": "Plectranthus scutellarioides",
    "botanicalName": "Plectranthus scutellarioides",
    "alternateNames": "Painted Nettle",
    "category": "foliage",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Vibrant neon foliage in swirling shades of crimson, pink, lime, and copper.",
    "noviceTip": "Vibrant neon foliage in swirling shades of crimson, pink, lime, and copper.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-polka-dot-plant",
    "name": "Polka Dot Plant",
    "commonName": "Polka Dot Plant",
    "scientificName": "Hypoestes phyllostachya",
    "botanicalName": "Hypoestes phyllostachya",
    "alternateNames": "Freckle Face Plant",
    "category": "foliage",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bright Desk",
    "notes": "Compact bushy foliage splashed with confetti-like pink, red, or white polka dots.",
    "noviceTip": "Compact bushy foliage splashed with confetti-like pink, red, or white polka dots.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-oxalis-purple-shamrock",
    "name": "Purple Shamrock",
    "commonName": "Purple Shamrock",
    "scientificName": "Oxalis triangularis",
    "botanicalName": "Oxalis triangularis",
    "alternateNames": "False Shamrock / Love Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Kitchen Sill",
    "notes": "Geometrical deep purple clover leaves that open by day and fold closed like little butterflies at night.",
    "noviceTip": "Geometrical deep purple clover leaves that open by day and fold closed like little butterflies at night.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-cordyline-ti-plant",
    "name": "Hawaiian Ti Plant",
    "commonName": "Hawaiian Ti Plant",
    "scientificName": "Cordyline fruticosa",
    "botanicalName": "Cordyline fruticosa",
    "alternateNames": "Good Luck Plant",
    "category": "foliage",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Broad palm-like leaves in electric pink, burgundy, and green; loves warm moist air.",
    "noviceTip": "Broad palm-like leaves in electric pink, burgundy, and green; loves warm moist air.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-stromanthe-triostar",
    "name": "Stromanthe Triostar",
    "commonName": "Stromanthe Triostar",
    "scientificName": "Stromanthe thalia Triostar",
    "botanicalName": "Stromanthe thalia Triostar",
    "alternateNames": "Tricolor Prayer Plant",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "Showy leaves painted with cream, green, and vibrant glowing hot-pink undersides.",
    "noviceTip": "Showy leaves painted with cream, green, and vibrant glowing hot-pink undersides.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-ctenanthe-burle-marxii",
    "name": "Fishbone Prayer Plant",
    "commonName": "Fishbone Prayer Plant",
    "scientificName": "Ctenanthe burle-marxii",
    "botanicalName": "Ctenanthe burle-marxii",
    "alternateNames": "Burle Marx Ctenanthe",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bedroom Shelf",
    "notes": "Compact silver leaves marked with deep green chevron fishbone stripes and wine undersides.",
    "noviceTip": "Compact silver leaves marked with deep green chevron fishbone stripes and wine undersides.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-pilea-aluminum-plant",
    "name": "Aluminum Plant",
    "commonName": "Aluminum Plant",
    "scientificName": "Pilea cadierei",
    "botanicalName": "Pilea cadierei",
    "alternateNames": "Watermelon Pilea",
    "category": "foliage",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Textured emerald leaves with raised metallic aluminum patches that catch ambient room light.",
    "noviceTip": "Textured emerald leaves with raised metallic aluminum patches that catch ambient room light.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-schefflera-gold-capella",
    "name": "Variegated Umbrella Tree",
    "commonName": "Variegated Umbrella Tree",
    "scientificName": "Schefflera arboricola Gold Capella",
    "botanicalName": "Schefflera arboricola Gold Capella",
    "alternateNames": "Gold Capella Schefflera",
    "category": "foliage",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Golden-yellow splashes across miniature umbrella clusters; easy to shape and prune.",
    "noviceTip": "Golden-yellow splashes across miniature umbrella clusters; easy to shape and prune.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-dracaena-song-of-india",
    "name": "Song of India",
    "commonName": "Song of India",
    "scientificName": "Dracaena reflexa Song of India",
    "botanicalName": "Dracaena reflexa Song of India",
    "alternateNames": "Pleomele",
    "category": "foliage",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bright Living Room",
    "notes": "Whorled glossy leaves edged with bright golden borders; let soil dry partially before watering.",
    "noviceTip": "Whorled glossy leaves edged with bright golden borders; let soil dry partially before watering.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-dracaena-janet-craig",
    "name": "Janet Craig Dracaena",
    "commonName": "Janet Craig Dracaena",
    "scientificName": "Dracaena deremensis Janet Craig",
    "botanicalName": "Dracaena deremensis Janet Craig",
    "alternateNames": "Compacta Dracaena",
    "category": "foliage",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Office Hallway",
    "notes": "Glossy dark green pleated leaves; exceptional air-purifying capability in low-light environments.",
    "noviceTip": "Glossy dark green pleated leaves; exceptional air-purifying capability in low-light environments.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-aspidistra-milky-way",
    "name": "Spotted Cast Iron Plant",
    "commonName": "Spotted Cast Iron Plant",
    "scientificName": "Aspidistra elatior Milky Way",
    "botanicalName": "Aspidistra elatior Milky Way",
    "alternateNames": "Milky Way Aspidistra",
    "category": "foliage",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Dim Living Room Corner",
    "notes": "Dark green upright spear foliage dotted with starry white specks; extremely tough and drought hardy.",
    "noviceTip": "Dark green upright spear foliage dotted with starry white specks; extremely tough and drought hardy.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-snake-plant",
    "name": "Snake Plant",
    "commonName": "Snake Plant",
    "scientificName": "Dracaena trifasciata Laurentii",
    "botanicalName": "Dracaena trifasciata Laurentii",
    "alternateNames": "Mother-in-Law's Tongue / Sansevieria",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Bedroom Corner",
    "notes": "Indestructible architectural upright spears with gold borders; water only when completely dry.",
    "noviceTip": "Indestructible architectural upright spears with gold borders; water only when completely dry.",
    "imageUrl": "https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-snake-plant-zeylanica",
    "name": "Snake Plant Zeylanica",
    "commonName": "Snake Plant Zeylanica",
    "scientificName": "Dracaena trifasciata Zeylanica",
    "botanicalName": "Dracaena trifasciata Zeylanica",
    "alternateNames": "Bowstring Hemp",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Office Corner",
    "notes": "Classic dark green mottled horizontal bands; tolerates low light, neglect, and dry air.",
    "noviceTip": "Classic dark green mottled horizontal bands; tolerates low light, neglect, and dry air.",
    "imageUrl": "https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-snake-plant-moonshine",
    "name": "Moonshine Snake Plant",
    "commonName": "Moonshine Snake Plant",
    "scientificName": "Dracaena trifasciata Moonshine",
    "botanicalName": "Dracaena trifasciata Moonshine",
    "alternateNames": "Silver Snake Plant",
    "category": "succulent",
    "waterFrequencyDays": 16,
    "waterDays": 16,
    "wateringDays": 16,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Silvery pale mint-green broad upright leaves; darkens slightly in low light.",
    "noviceTip": "Silvery pale mint-green broad upright leaves; darkens slightly in low light.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-snake-plant-cylindrica",
    "name": "Cylindrical Snake Plant",
    "commonName": "Cylindrical Snake Plant",
    "scientificName": "Dracaena angolensis",
    "botanicalName": "Dracaena angolensis",
    "alternateNames": "African Spear / Spear Sansevieria",
    "category": "succulent",
    "waterFrequencyDays": 18,
    "waterDays": 18,
    "wateringDays": 18,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "Smooth round architectural spears that can be braided; extremely drought tolerant.",
    "noviceTip": "Smooth round architectural spears that can be braided; extremely drought tolerant.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-snake-plant-whale-fin",
    "name": "Whale Fin Snake Plant",
    "commonName": "Whale Fin Snake Plant",
    "scientificName": "Dracaena masoniana",
    "botanicalName": "Dracaena masoniana",
    "alternateNames": "Mason Congo Sansevieria",
    "category": "succulent",
    "waterFrequencyDays": 20,
    "waterDays": 20,
    "wateringDays": 20,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Entryway Table",
    "notes": "Solitary, massive paddle leaf resembling a whale fin; a sculptural statement specimen.",
    "noviceTip": "Solitary, massive paddle leaf resembling a whale fin; a sculptural statement specimen.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-birds-nest-snake-plant",
    "name": "Bird's Nest Snake Plant",
    "commonName": "Bird's Nest Snake Plant",
    "scientificName": "Dracaena trifasciata Hahnii",
    "botanicalName": "Dracaena trifasciata Hahnii",
    "alternateNames": "Golden Hahnii / Dwarf Snake Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Desk Shelf",
    "notes": "Compact rosette reaching just 6 inches tall; great for tight desk spaces and shelves.",
    "noviceTip": "Compact rosette reaching just 6 inches tall; great for tight desk spaces and shelves.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-zz-plant",
    "name": "ZZ Plant",
    "commonName": "ZZ Plant",
    "scientificName": "Zamioculcas zamiifolia",
    "botanicalName": "Zamioculcas zamiifolia",
    "alternateNames": "Zanzibar Gem / Eternity Plant",
    "category": "succulent",
    "waterFrequencyDays": 18,
    "waterDays": 18,
    "wateringDays": 18,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Bedroom",
    "notes": "Drought champion; tuberous bulb rhizomes store water for weeks, so underwatering is safest.",
    "noviceTip": "Drought champion; tuberous bulb rhizomes store water for weeks, so underwatering is safest.",
    "imageUrl": "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-zz-raven",
    "name": "Raven ZZ Plant",
    "commonName": "Raven ZZ Plant",
    "scientificName": "Zamioculcas zamiifolia Raven",
    "botanicalName": "Zamioculcas zamiifolia Raven",
    "alternateNames": "Black ZZ Plant",
    "category": "succulent",
    "waterFrequencyDays": 20,
    "waterDays": 20,
    "wateringDays": 20,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Modern Living Room",
    "notes": "New bright lime stems mature into deep glossy black-purple foliage; exceptionally low maintenance.",
    "noviceTip": "New bright lime stems mature into deep glossy black-purple foliage; exceptionally low maintenance.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-jade-plant",
    "name": "Jade Plant",
    "commonName": "Jade Plant",
    "scientificName": "Crassula ovata",
    "botanicalName": "Crassula ovata",
    "alternateNames": "Money Tree / Lucky Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window Sill",
    "notes": "Thick succulent woody stems with fleshy jade-green oval leaves; symbolized with prosperity.",
    "noviceTip": "Thick succulent woody stems with fleshy jade-green oval leaves; symbolized with prosperity.",
    "imageUrl": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-crassula-gollum-jade",
    "name": "Gollum Jade",
    "commonName": "Gollum Jade",
    "scientificName": "Crassula ovata Gollum",
    "botanicalName": "Crassula ovata Gollum",
    "alternateNames": "Ogre Ears / Finger Jade",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Window",
    "notes": "Curious tubular fleshy fingers with suction-cup tips that turn reddish in bright sunlight.",
    "noviceTip": "Curious tubular fleshy fingers with suction-cup tips that turn reddish in bright sunlight.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-aloe-vera",
    "name": "Aloe Vera",
    "commonName": "Aloe Vera",
    "scientificName": "Aloe barbadensis Miller",
    "botanicalName": "Aloe barbadensis Miller",
    "alternateNames": "Medicinal Aloe / Burn Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Counter",
    "notes": "Soothing succulent gel inside serrated thick leaves. Soak thoroughly, then allow complete drying.",
    "noviceTip": "Soothing succulent gel inside serrated thick leaves. Soak thoroughly, then allow complete drying.",
    "imageUrl": "https://images.unsplash.com/photo-1567689265664-1c48de61db0b?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1567689265664-1c48de61db0b?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-aloe-lace",
    "name": "Lace Aloe",
    "commonName": "Lace Aloe",
    "scientificName": "Aristaloe aristata",
    "botanicalName": "Aristaloe aristata",
    "alternateNames": "Guinea-Fowl Aloe",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Desk Window",
    "notes": "Dense rosette fringed with soft white teeth and slender thread-like leaf tips.",
    "noviceTip": "Dense rosette fringed with soft white teeth and slender thread-like leaf tips.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-zebra-haworthia",
    "name": "Zebra Haworthia",
    "commonName": "Zebra Haworthia",
    "scientificName": "Haworthiopsis fasciata",
    "botanicalName": "Haworthiopsis fasciata",
    "alternateNames": "Zebra Plant / Pearl Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Distinct white horizontal stripes on thick triangular leaves; slow growing and compact.",
    "noviceTip": "Distinct white horizontal stripes on thick triangular leaves; slow growing and compact.",
    "imageUrl": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-haworthia-cooperi",
    "name": "Haworthia Cooperi",
    "commonName": "Haworthia Cooperi",
    "scientificName": "Haworthia cooperi",
    "botanicalName": "Haworthia cooperi",
    "alternateNames": "Translucent Window Plant",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Window Shelf",
    "notes": "Clusters of translucent bulbous leaves that capture filtered sunlight like miniature jewels.",
    "noviceTip": "Clusters of translucent bulbous leaves that capture filtered sunlight like miniature jewels.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-string-of-pearls",
    "name": "String of Pearls",
    "commonName": "String of Pearls",
    "scientificName": "Curio rowleyanus",
    "botanicalName": "Curio rowleyanus",
    "alternateNames": "Pearl Vine / Bead Vine",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hanging Window",
    "notes": "Spherical pea-like cascading pearls; provide direct morning light across top of pot and avoid soggy soil.",
    "noviceTip": "Spherical pea-like cascading pearls; provide direct morning light across top of pot and avoid soggy soil.",
    "imageUrl": "https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-string-of-bananas",
    "name": "String of Bananas",
    "commonName": "String of Bananas",
    "scientificName": "Curio radicans",
    "botanicalName": "Curio radicans",
    "alternateNames": "Banana Vine",
    "category": "succulent",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Balcony Hanging Pot",
    "notes": "Fast-growing trailing vine with miniature curved banana-shaped foliage; faster grower than Pearls.",
    "noviceTip": "Fast-growing trailing vine with miniature curved banana-shaped foliage; faster grower than Pearls.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-string-of-dolphins",
    "name": "String of Dolphins",
    "commonName": "String of Dolphins",
    "scientificName": "Curio x peregrinus",
    "botanicalName": "Curio x peregrinus",
    "alternateNames": "Dolphin Necklace / Flying Dolphins",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Sill",
    "notes": "Adorable succulent leaves shaped exactly like miniature leaping dolphins.",
    "noviceTip": "Adorable succulent leaves shaped exactly like miniature leaping dolphins.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-string-of-hearts",
    "name": "String of Hearts",
    "commonName": "String of Hearts",
    "scientificName": "Ceropegia woodii",
    "botanicalName": "Ceropegia woodii",
    "alternateNames": "Rosary Vine / Sweetheart Vine",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hanging Window Planter",
    "notes": "Delicate heart-shaped patterned foliage; water only when the tuberous soil dries out completely.",
    "noviceTip": "Delicate heart-shaped patterned foliage; water only when the tuberous soil dries out completely.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-burros-tail",
    "name": "Burro's Tail",
    "commonName": "Burro's Tail",
    "scientificName": "Sedum morganianum",
    "botanicalName": "Sedum morganianum",
    "alternateNames": "Donkey's Tail / Trailing Sedum",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony",
    "notes": "Plump blue-green cascading bean leaves; extremely fragile, so place in a no-bump zone.",
    "noviceTip": "Plump blue-green cascading bean leaves; extremely fragile, so place in a no-bump zone.",
    "imageUrl": "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-sedum-jelly-bean",
    "name": "Jelly Bean Plant",
    "commonName": "Jelly Bean Plant",
    "scientificName": "Sedum rubrotinctum",
    "botanicalName": "Sedum rubrotinctum",
    "alternateNames": "Pork and Beans",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Chubby bean-shaped leaves that turn bright bronze-red in strong summer sunshine.",
    "noviceTip": "Chubby bean-shaped leaves that turn bright bronze-red in strong summer sunshine.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-echeveria-elegans",
    "name": "Mexican Snowball",
    "commonName": "Mexican Snowball",
    "scientificName": "Echeveria elegans",
    "botanicalName": "Echeveria elegans",
    "alternateNames": "White Mexican Rose",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window Shelf",
    "notes": "Pale blue-white tight rosette coated in farina powder; water soil directly, avoiding the center crown.",
    "noviceTip": "Pale blue-white tight rosette coated in farina powder; water soil directly, avoiding the center crown.",
    "imageUrl": "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-echeveria-perle-von-nurnberg",
    "name": "Echeveria Perle von Nurnberg",
    "commonName": "Echeveria Perle von Nurnberg",
    "scientificName": "Echeveria Perle von Nurnberg",
    "botanicalName": "Echeveria Perle von Nurnberg",
    "alternateNames": "Purple Pearl Echeveria",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Sill",
    "notes": "Iridescent metallic purple, pink, and silver rosette; needs full direct sun to maintain deep purple hues.",
    "noviceTip": "Iridescent metallic purple, pink, and silver rosette; needs full direct sun to maintain deep purple hues.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-echeveria-black-prince",
    "name": "Black Prince Echeveria",
    "commonName": "Black Prince Echeveria",
    "scientificName": "Echeveria Black Prince",
    "botanicalName": "Echeveria Black Prince",
    "alternateNames": "Black Hen and Chicks",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window",
    "notes": "Dark chocolate-brown to near black fleshy rosette with bright salmon-red late autumn flowers.",
    "noviceTip": "Dark chocolate-brown to near black fleshy rosette with bright salmon-red late autumn flowers.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-kalanchoe-panda-plant",
    "name": "Panda Plant",
    "commonName": "Panda Plant",
    "scientificName": "Kalanchoe tomentosa",
    "botanicalName": "Kalanchoe tomentosa",
    "alternateNames": "Pussy Ears / Chocolate Soldier",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bedroom Shelf",
    "notes": "Soft velvety plush fuzzy leaves tipped with rich chocolate-brown spots; very drought tolerant.",
    "noviceTip": "Soft velvety plush fuzzy leaves tipped with rich chocolate-brown spots; very drought tolerant.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-kalanchoe-flapjack",
    "name": "Flapjack Paddle Plant",
    "commonName": "Flapjack Paddle Plant",
    "scientificName": "Kalanchoe luciae",
    "botanicalName": "Kalanchoe luciae",
    "alternateNames": "Desert Cabbage / Paddle Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony",
    "notes": "Rounded paddle-like flat leaves that blush brilliant ruby red under bright sunshine.",
    "noviceTip": "Rounded paddle-like flat leaves that blush brilliant ruby red under bright sunshine.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-african-milk-tree",
    "name": "African Milk Tree",
    "commonName": "African Milk Tree",
    "scientificName": "Euphorbia trigona",
    "botanicalName": "Euphorbia trigona",
    "alternateNames": "Cathedral Cactus / Friendship Cactus",
    "category": "succulent",
    "waterFrequencyDays": 16,
    "waterDays": 16,
    "wateringDays": 16,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Living Room Corner",
    "notes": "Towering ridged candelabra stems lined with teardrop leaves and sharp spines; water sparingly.",
    "noviceTip": "Towering ridged candelabra stems lined with teardrop leaves and sharp spines; water sparingly.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-pencil-cactus",
    "name": "Firesticks Pencil Cactus",
    "commonName": "Firesticks Pencil Cactus",
    "scientificName": "Euphorbia tirucalli Rosea",
    "botanicalName": "Euphorbia tirucalli Rosea",
    "alternateNames": "Sticks on Fire",
    "category": "succulent",
    "waterFrequencyDays": 16,
    "waterDays": 16,
    "wateringDays": 16,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window",
    "notes": "Coral-like branched cylinders that turn bright fiery orange and pink in full direct sun.",
    "noviceTip": "Coral-like branched cylinders that turn bright fiery orange and pink in full direct sun.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-crown-of-thorns",
    "name": "Crown of Thorns",
    "commonName": "Crown of Thorns",
    "scientificName": "Euphorbia milii",
    "botanicalName": "Euphorbia milii",
    "alternateNames": "Christ Plant",
    "category": "succulent",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Table",
    "notes": "Woody thorny stems bearing constant clusters of delicate petal-like red or pink floral bracts.",
    "noviceTip": "Woody thorny stems bearing constant clusters of delicate petal-like red or pink floral bracts.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-golden-barrel-cactus",
    "name": "Golden Barrel Cactus",
    "commonName": "Golden Barrel Cactus",
    "scientificName": "Echinocactus grusonii",
    "botanicalName": "Echinocactus grusonii",
    "alternateNames": "Mother-in-Law's Cushion",
    "category": "succulent",
    "waterFrequencyDays": 24,
    "waterDays": 24,
    "wateringDays": 24,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Bright Sunny Sill",
    "notes": "Classic globe-shaped desert cactus covered in glowing golden spines; water monthly in winter.",
    "noviceTip": "Classic globe-shaped desert cactus covered in glowing golden spines; water monthly in winter.",
    "imageUrl": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-bunny-ears-cactus",
    "name": "Bunny Ears Cactus",
    "commonName": "Bunny Ears Cactus",
    "scientificName": "Opuntia microdasys",
    "botanicalName": "Opuntia microdasys",
    "alternateNames": "Polka-Dot Cactus / Angel Wings",
    "category": "succulent",
    "waterFrequencyDays": 20,
    "waterDays": 20,
    "wateringDays": 20,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Desk",
    "notes": "Paddle segments resembling rabbit ears studded with tiny golden glochids; avoid touching with bare hands.",
    "noviceTip": "Paddle segments resembling rabbit ears studded with tiny golden glochids; avoid touching with bare hands.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-fishbone-cactus",
    "name": "Fishbone Cactus",
    "commonName": "Fishbone Cactus",
    "scientificName": "Disocactus anguliger",
    "botanicalName": "Disocactus anguliger",
    "alternateNames": "Zigzag Cactus / Ric Rac Orchid Cactus",
    "category": "succulent",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Wavy zigzag trailing stems; being a jungle cactus, it enjoys slightly more humidity than desert cacti.",
    "noviceTip": "Wavy zigzag trailing stems; being a jungle cactus, it enjoys slightly more humidity than desert cacti.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-christmas-cactus",
    "name": "Christmas Cactus",
    "commonName": "Christmas Cactus",
    "scientificName": "Schlumbergera bridgesii",
    "botanicalName": "Schlumbergera bridgesii",
    "alternateNames": "Holiday Cactus",
    "category": "succulent",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Coffee Table",
    "notes": "Segmented flat spineless stems that burst into fiery fuchsia blossoms in early winter.",
    "noviceTip": "Segmented flat spineless stems that burst into fiery fuchsia blossoms in early winter.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-thanksgiving-cactus",
    "name": "Thanksgiving Cactus",
    "commonName": "Thanksgiving Cactus",
    "scientificName": "Schlumbergera truncata",
    "botanicalName": "Schlumbergera truncata",
    "alternateNames": "Claw Cactus",
    "category": "succulent",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Dining Room Table",
    "notes": "Pointed claw-like stem teeth with exotic multi-tiered blooms in salmon, pink, and white.",
    "noviceTip": "Pointed claw-like stem teeth with exotic multi-tiered blooms in salmon, pink, and white.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-moon-cactus",
    "name": "Moon Cactus",
    "commonName": "Moon Cactus",
    "scientificName": "Gymnocalycium mihanovichii",
    "botanicalName": "Gymnocalycium mihanovichii",
    "alternateNames": "Ruby Ball Cactus / Hibotan",
    "category": "succulent",
    "waterFrequencyDays": 16,
    "waterDays": 16,
    "wateringDays": 16,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Grafted neon orange, pink, or yellow sphere sitting atop a green hylocereus rootstock.",
    "noviceTip": "Grafted neon orange, pink, or yellow sphere sitting atop a green hylocereus rootstock.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-old-man-cactus",
    "name": "Old Man Cactus",
    "commonName": "Old Man Cactus",
    "scientificName": "Cephalocereus senilis",
    "botanicalName": "Cephalocereus senilis",
    "alternateNames": "White Beard Cactus",
    "category": "succulent",
    "waterFrequencyDays": 21,
    "waterDays": 21,
    "wateringDays": 21,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window",
    "notes": "Columnar cactus covered with long shaggy white hairs designed to shield it from harsh desert heat.",
    "noviceTip": "Columnar cactus covered with long shaggy white hairs designed to shield it from harsh desert heat.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-bishops-cap-cactus",
    "name": "Bishop's Cap Cactus",
    "commonName": "Bishop's Cap Cactus",
    "scientificName": "Astrophytum myriostigma",
    "botanicalName": "Astrophytum myriostigma",
    "alternateNames": "Bishop's Miter / Star Cactus",
    "category": "succulent",
    "waterFrequencyDays": 21,
    "waterDays": 21,
    "wateringDays": 21,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Shelf",
    "notes": "Spineless five-ribbed geometric cactus dusted with tiny white chalky scales; yellow spring blooms.",
    "noviceTip": "Spineless five-ribbed geometric cactus dusted with tiny white chalky scales; yellow spring blooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-ladyfinger-cactus",
    "name": "Ladyfinger Cactus",
    "commonName": "Ladyfinger Cactus",
    "scientificName": "Mammillaria elongata",
    "botanicalName": "Mammillaria elongata",
    "alternateNames": "Golden Lace Cactus",
    "category": "succulent",
    "waterFrequencyDays": 18,
    "waterDays": 18,
    "wateringDays": 18,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Window Sill",
    "notes": "Clusters of slender cylindrical stems covered with star-shaped golden-yellow spines.",
    "noviceTip": "Clusters of slender cylindrical stems covered with star-shaped golden-yellow spines.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-mistletoe-cactus",
    "name": "Mistletoe Cactus",
    "commonName": "Mistletoe Cactus",
    "scientificName": "Rhipsalis baccifera",
    "botanicalName": "Rhipsalis baccifera",
    "alternateNames": "Spaghetti Cactus",
    "category": "succulent",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bathroom Hanging Pot",
    "notes": "Cascading tangle of spineless pencil-thin green threads; a jungle epiphyte that likes ambient humidity.",
    "noviceTip": "Cascading tangle of spineless pencil-thin green threads; a jungle epiphyte that likes ambient humidity.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-elephant-bush",
    "name": "Elephant Bush",
    "commonName": "Elephant Bush",
    "scientificName": "Portulacaria afra",
    "botanicalName": "Portulacaria afra",
    "alternateNames": "Spekboom / Dwarf Jade",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Reddish-brown stems studded with tiny fleshy oval leaves; an exceptional carbon-absorbing succulent.",
    "noviceTip": "Reddish-brown stems studded with tiny fleshy oval leaves; an exceptional carbon-absorbing succulent.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-ghost-plant",
    "name": "Ghost Plant",
    "commonName": "Ghost Plant",
    "scientificName": "Graptopetalum paraguayense",
    "botanicalName": "Graptopetalum paraguayense",
    "alternateNames": "Mother of Pearl Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Rock Garden / Window Box",
    "notes": "Pastel opalescent rosettes that change color from bluish-gray to pinkish-yellow in sunny conditions.",
    "noviceTip": "Pastel opalescent rosettes that change color from bluish-gray to pinkish-yellow in sunny conditions.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-moonstones-succulent",
    "name": "Moonstones",
    "commonName": "Moonstones",
    "scientificName": "Pachyphytum oviferum",
    "botanicalName": "Pachyphytum oviferum",
    "alternateNames": "Sugar Almond Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Desk",
    "notes": "Chubby plump rounded leaves covered in silvery-lavender powdery bloom resembling smooth river pebbles.",
    "noviceTip": "Chubby plump rounded leaves covered in silvery-lavender powdery bloom resembling smooth river pebbles.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-sempervivum-hens-and-chicks",
    "name": "Hens and Chicks",
    "commonName": "Hens and Chicks",
    "scientificName": "Sempervivum tectorum",
    "botanicalName": "Sempervivum tectorum",
    "alternateNames": "Houseleek",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Outdoor Planter",
    "notes": "Extremely cold-hardy geometric rosette that multiplies continuously with baby offsets (chicks).",
    "noviceTip": "Extremely cold-hardy geometric rosette that multiplies continuously with baby offsets (chicks).",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lithops-living-stones",
    "name": "Living Stones",
    "commonName": "Living Stones",
    "scientificName": "Lithops pseudotruncatella",
    "botanicalName": "Lithops pseudotruncatella",
    "alternateNames": "Pebble Plants",
    "category": "succulent",
    "waterFrequencyDays": 28,
    "waterDays": 28,
    "wateringDays": 28,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window Sill",
    "notes": "Mimic desert stones to evade hungry animals; needs very minimal water, only when visibly puckered.",
    "noviceTip": "Mimic desert stones to evade hungry animals; needs very minimal water, only when visibly puckered.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-gasteria-ox-tongue",
    "name": "Ox Tongue Gasteria",
    "commonName": "Ox Tongue Gasteria",
    "scientificName": "Gasteria batesiana",
    "botanicalName": "Gasteria batesiana",
    "alternateNames": "Lawyer's Tongue",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Bookshelf Corner",
    "notes": "Rough, tongue-shaped textured leaves with white warty tubercles; handles deep shade with ease.",
    "noviceTip": "Rough, tongue-shaped textured leaves with white warty tubercles; handles deep shade with ease.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-tigers-jaws-succulent",
    "name": "Tiger's Jaws",
    "commonName": "Tiger's Jaws",
    "scientificName": "Faucaria tigrina",
    "botanicalName": "Faucaria tigrina",
    "alternateNames": "Shark's Jaws",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window",
    "notes": "Thick triangular leaves edged with soft claw-like white spines; bright yellow daisy-like blooms.",
    "noviceTip": "Thick triangular leaves edged with soft claw-like white spines; bright yellow daisy-like blooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-string-of-buttons",
    "name": "String of Buttons",
    "commonName": "String of Buttons",
    "scientificName": "Crassula perforata",
    "botanicalName": "Crassula perforata",
    "alternateNames": "Necklace Vine / Pagoda Plant",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Sill",
    "notes": "Square stacked leaves threaded along wiry stems like beads on a necklace; pinkish edges in high sun.",
    "noviceTip": "Square stacked leaves threaded along wiry stems like beads on a necklace; pinkish edges in high sun.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-echeveria-topsy-turvy",
    "name": "Topsy Turvy Echeveria",
    "commonName": "Topsy Turvy Echeveria",
    "scientificName": "Echeveria runyonii Topsy Turvy",
    "botanicalName": "Echeveria runyonii Topsy Turvy",
    "alternateNames": "Upside Down Echeveria",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony",
    "notes": "Fascinating spoon-shaped leaves that curl backward toward the center of the chalky-blue rosette.",
    "noviceTip": "Fascinating spoon-shaped leaves that curl backward toward the center of the chalky-blue rosette.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-sedum-autumn-joy",
    "name": "Sedum Autumn Joy",
    "commonName": "Sedum Autumn Joy",
    "scientificName": "Hylotelephium spectabile Autumn Joy",
    "botanicalName": "Hylotelephium spectabile Autumn Joy",
    "alternateNames": "Stonecrop",
    "category": "succulent",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Garden Patio",
    "notes": "Succulent upright perennial with broccoli-like flower heads that turn from pink to copper in autumn.",
    "noviceTip": "Succulent upright perennial with broccoli-like flower heads that turn from pink to copper in autumn.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-haworthia-limifolia",
    "name": "Fairy Washboard",
    "commonName": "Fairy Washboard",
    "scientificName": "Haworthiopsis limifolia",
    "botanicalName": "Haworthiopsis limifolia",
    "alternateNames": "File Haworthia",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Symmetrical pinwheel rosette with raised ridges resembling an antique washboard.",
    "noviceTip": "Symmetrical pinwheel rosette with raised ridges resembling an antique washboard.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-stapelia-carrion-flower",
    "name": "Starfish Flower",
    "commonName": "Starfish Flower",
    "scientificName": "Stapelia gigantea",
    "botanicalName": "Stapelia gigantea",
    "alternateNames": "Zulu Giant / Carrion Plant",
    "category": "succulent",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window",
    "notes": "Velvety four-angled cactus-like stems bearing massive, bizarre hairy starfish blooms.",
    "noviceTip": "Velvety four-angled cactus-like stems bearing massive, bizarre hairy starfish blooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-prickly-pear",
    "name": "Prickly Pear",
    "commonName": "Prickly Pear",
    "scientificName": "Opuntia ficus-indica",
    "botanicalName": "Opuntia ficus-indica",
    "alternateNames": "Indian Fig / Nopal",
    "category": "succulent",
    "waterFrequencyDays": 20,
    "waterDays": 20,
    "wateringDays": 20,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio",
    "notes": "Flat oval pads producing edible sweet fruits and vibrant yellow flowers; requires full sun.",
    "noviceTip": "Flat oval pads producing edible sweet fruits and vibrant yellow flowers; requires full sun.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-crassula-campfire",
    "name": "Campfire Crassula",
    "commonName": "Campfire Crassula",
    "scientificName": "Crassula capitella Campfire",
    "botanicalName": "Crassula capitella Campfire",
    "alternateNames": "Red Pagoda",
    "category": "succulent",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony",
    "notes": "Propeller-shaped stacked succulent leaves that ignite into fiery neon-red during cool sunny days.",
    "noviceTip": "Propeller-shaped stacked succulent leaves that ignite into fiery neon-red during cool sunny days.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-boston-fern",
    "name": "Boston Fern",
    "commonName": "Boston Fern",
    "scientificName": "Nephrolepis exaltata",
    "botanicalName": "Nephrolepis exaltata",
    "alternateNames": "Sword Fern",
    "category": "palm",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Humid Bathroom",
    "notes": "Feathery cascading green fronds. Keep soil consistently moist and mist fronds frequently.",
    "noviceTip": "Feathery cascading green fronds. Keep soil consistently moist and mist fronds frequently.",
    "imageUrl": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-birds-nest-fern",
    "name": "Bird's Nest Fern",
    "commonName": "Bird's Nest Fern",
    "scientificName": "Asplenium nidus",
    "botanicalName": "Asplenium nidus",
    "alternateNames": "Crispy Wave Fern",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Wavy apple-green undivided ribbons unfurling from a fuzzy central rosette nest.",
    "noviceTip": "Wavy apple-green undivided ribbons unfurling from a fuzzy central rosette nest.",
    "imageUrl": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-maidenhair-fern",
    "name": "Maidenhair Fern",
    "commonName": "Maidenhair Fern",
    "scientificName": "Adiantum raddianum",
    "botanicalName": "Adiantum raddianum",
    "alternateNames": "Delta Maidenhair",
    "category": "palm",
    "waterFrequencyDays": 3,
    "waterDays": 3,
    "wateringDays": 3,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Steamy Bathroom",
    "notes": "Airy, delicate fan-shaped leaflets along polished ebony stems; never allow root ball to dry out.",
    "noviceTip": "Airy, delicate fan-shaped leaflets along polished ebony stems; never allow root ball to dry out.",
    "imageUrl": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-staghorn-fern",
    "name": "Staghorn Fern",
    "commonName": "Staghorn Fern",
    "scientificName": "Platycerium bifurcatum",
    "botanicalName": "Platycerium bifurcatum",
    "alternateNames": "Elkhorn Fern / Antelope's Horn",
    "category": "palm",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Mounted Wall Display",
    "notes": "Antler-shaped architectural fronds; soak plaque thoroughly once a week and allow to drain.",
    "noviceTip": "Antler-shaped architectural fronds; soak plaque thoroughly once a week and allow to drain.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-blue-star-fern",
    "name": "Blue Star Fern",
    "commonName": "Blue Star Fern",
    "scientificName": "Phlebodium aureum",
    "botanicalName": "Phlebodium aureum",
    "alternateNames": "Golden Polypody",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Bathroom Shelf",
    "notes": "Silvery blue-green finger fronds with fuzzy golden creeping rhizomes; very beginner-friendly fern.",
    "noviceTip": "Silvery blue-green finger fronds with fuzzy golden creeping rhizomes; very beginner-friendly fern.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-kimberly-queen-fern",
    "name": "Kimberly Queen Fern",
    "commonName": "Kimberly Queen Fern",
    "scientificName": "Nephrolepis obliterata",
    "botanicalName": "Nephrolepis obliterata",
    "alternateNames": "Australian Sword Fern",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Covered Patio",
    "notes": "Upright, tidy sword fronds that shed far less than Boston Ferns; tolerates gentle outdoor sun.",
    "noviceTip": "Upright, tidy sword fronds that shed far less than Boston Ferns; tolerates gentle outdoor sun.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-crocodile-fern",
    "name": "Crocodile Fern",
    "commonName": "Crocodile Fern",
    "scientificName": "Microsorum musifolium Crocodyllus",
    "botanicalName": "Microsorum musifolium Crocodyllus",
    "alternateNames": "Alligator Fern",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Glossy long spear fronds tessellated with distinctive scales resembling crocodile hide.",
    "noviceTip": "Glossy long spear fronds tessellated with distinctive scales resembling crocodile hide.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-rabbits-foot-fern",
    "name": "Rabbit's Foot Fern",
    "commonName": "Rabbit's Foot Fern",
    "scientificName": "Davallia fejeensis",
    "botanicalName": "Davallia fejeensis",
    "alternateNames": "Hare's Foot Fern",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hanging Planter",
    "notes": "Lacy triangular foliage sprawling out from adorable furry creeping rhizomes that spill over the rim.",
    "noviceTip": "Lacy triangular foliage sprawling out from adorable furry creeping rhizomes that spill over the rim.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-button-fern",
    "name": "Button Fern",
    "commonName": "Button Fern",
    "scientificName": "Pellaea rotundifolia",
    "botanicalName": "Pellaea rotundifolia",
    "alternateNames": "New Zealand Button Fern",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Desk Shelf",
    "notes": "Dark green leathery round leaflets strung along arching fronds; prefers slightly less water than other ferns.",
    "noviceTip": "Dark green leathery round leaflets strung along arching fronds; prefers slightly less water than other ferns.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-kangaroo-paw-fern",
    "name": "Kangaroo Paw Fern",
    "commonName": "Kangaroo Paw Fern",
    "scientificName": "Microsorum pustulatum",
    "botanicalName": "Microsorum pustulatum",
    "alternateNames": "Hound Tongue Fern",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "Deeply lobed glossy leathery leaves with distinctive paw-like shapes; hardy and resilient.",
    "noviceTip": "Deeply lobed glossy leathery leaves with distinctive paw-like shapes; hardy and resilient.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lemon-button-fern",
    "name": "Lemon Button Fern",
    "commonName": "Lemon Button Fern",
    "scientificName": "Nephrolepis cordifolia 'Duffii'",
    "botanicalName": "Nephrolepis cordifolia 'Duffii'",
    "alternateNames": "Fishbone Fern",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Kitchen Counter",
    "notes": "Miniature rounded leaflets emitting a subtle fresh lemon scent when gently crushed.",
    "noviceTip": "Miniature rounded leaflets emitting a subtle fresh lemon scent when gently crushed.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-japanese-painted-fern",
    "name": "Japanese Painted Fern",
    "commonName": "Japanese Painted Fern",
    "scientificName": "Athyrium niponicum var. pictum",
    "botanicalName": "Athyrium niponicum var. pictum",
    "alternateNames": "Burgundy Lace Fern",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Shaded Patio Pot",
    "notes": "Breathtaking metallic silvery-gray fronds with contrasting wine-red central stems.",
    "noviceTip": "Breathtaking metallic silvery-gray fronds with contrasting wine-red central stems.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-foxtail-fern",
    "name": "Foxtail Fern",
    "commonName": "Foxtail Fern",
    "scientificName": "Asparagus densiflorus 'Meyeri'",
    "botanicalName": "Asparagus densiflorus 'Meyeri'",
    "alternateNames": "Fox Tail Asparagus",
    "category": "palm",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Plush emerald plumes resembling fluffy fox tails; stores moisture in tuberous subterranean roots.",
    "noviceTip": "Plush emerald plumes resembling fluffy fox tails; stores moisture in tuberous subterranean roots.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-asparagus-fern",
    "name": "Asparagus Fern",
    "commonName": "Asparagus Fern",
    "scientificName": "Asparagus setaceus",
    "botanicalName": "Asparagus setaceus",
    "alternateNames": "Lace Fern",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bookshelf Corner",
    "notes": "Feathery cloud-like horizontal branches; not a true fern, but enjoys bright filtered lighting.",
    "noviceTip": "Feathery cloud-like horizontal branches; not a true fern, but enjoys bright filtered lighting.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-autumn-fern",
    "name": "Autumn Fern",
    "commonName": "Autumn Fern",
    "scientificName": "Dryopteris erythrosora",
    "botanicalName": "Dryopteris erythrosora",
    "alternateNames": "Japanese Wood Fern / Copper Shield",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Shady Porch",
    "notes": "Young emerging fronds shine in vibrant coppery-bronze before maturing into rich woodland green.",
    "noviceTip": "Young emerging fronds shine in vibrant coppery-bronze before maturing into rich woodland green.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-ostrich-fern",
    "name": "Ostrich Fern",
    "commonName": "Ostrich Fern",
    "scientificName": "Matteuccia struthiopteris",
    "botanicalName": "Matteuccia struthiopteris",
    "alternateNames": "Fiddlehead Fern",
    "category": "palm",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Moist Garden Corner",
    "notes": "Grand architectural vase-shaped fern whose tender spring unfurling crosiers are prized fiddleheads.",
    "noviceTip": "Grand architectural vase-shaped fern whose tender spring unfurling crosiers are prized fiddleheads.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-silver-lace-fern",
    "name": "Silver Lace Fern",
    "commonName": "Silver Lace Fern",
    "scientificName": "Pteris ensiformis Evergemiensis",
    "botanicalName": "Pteris ensiformis Evergemiensis",
    "alternateNames": "Slender Brake Fern",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bathroom Sill",
    "notes": "Crisp bright white center stripes down every dainty emerald pinna; thrives in high humidity.",
    "noviceTip": "Crisp bright white center stripes down every dainty emerald pinna; thrives in high humidity.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-areca-palm",
    "name": "Areca Palm",
    "commonName": "Areca Palm",
    "scientificName": "Dypsis lutescens",
    "botanicalName": "Dypsis lutescens",
    "alternateNames": "Butterfly Palm / Golden Cane Palm",
    "category": "palm",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Corner",
    "notes": "Clumping golden-cane trunks with feathery arching fronds; effective natural indoor humidifier.",
    "noviceTip": "Clumping golden-cane trunks with feathery arching fronds; effective natural indoor humidifier.",
    "imageUrl": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-parlor-palm",
    "name": "Parlor Palm",
    "commonName": "Parlor Palm",
    "scientificName": "Chamaedorea elegans",
    "botanicalName": "Chamaedorea elegans",
    "alternateNames": "Neanthe Bella Palm",
    "category": "palm",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Office Desk",
    "notes": "Victorian parlor favorite; compact slow grower that tolerates low ambient light and air drafts.",
    "noviceTip": "Victorian parlor favorite; compact slow grower that tolerates low ambient light and air drafts.",
    "imageUrl": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-kentia-palm",
    "name": "Kentia Palm",
    "commonName": "Kentia Palm",
    "scientificName": "Howea forsteriana",
    "botanicalName": "Howea forsteriana",
    "alternateNames": "Sentry Palm / Thatch Palm",
    "category": "palm",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Living Room Corner",
    "notes": "Regal, durable architectural palm with arching dark green fronds; highly tolerant of shade.",
    "noviceTip": "Regal, durable architectural palm with arching dark green fronds; highly tolerant of shade.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-ponytail-palm",
    "name": "Ponytail Palm",
    "commonName": "Ponytail Palm",
    "scientificName": "Beaucarnea recurvata",
    "botanicalName": "Beaucarnea recurvata",
    "alternateNames": "Elephant's Foot / Bottle Palm",
    "category": "palm",
    "waterFrequencyDays": 16,
    "waterDays": 16,
    "wateringDays": 16,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Window Corner",
    "notes": "Swollen bulbous water-storing caudex topped with a fountain of curly ribbon-like foliage.",
    "noviceTip": "Swollen bulbous water-storing caudex topped with a fountain of curly ribbon-like foliage.",
    "imageUrl": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-majesty-palm",
    "name": "Majesty Palm",
    "commonName": "Majesty Palm",
    "scientificName": "Ravenea rivularis",
    "botanicalName": "Ravenea rivularis",
    "alternateNames": "River Palm",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bright Sunroom",
    "notes": "Graceful feathery palm native to riverbanks; requires consistent moisture and bright filtered light.",
    "noviceTip": "Graceful feathery palm native to riverbanks; requires consistent moisture and bright filtered light.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lady-palm",
    "name": "Lady Palm",
    "commonName": "Lady Palm",
    "scientificName": "Rhapis excelsa",
    "botanicalName": "Rhapis excelsa",
    "alternateNames": "Bamboo Palm / Broadleaf Lady Palm",
    "category": "palm",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Formal Dining Room",
    "notes": "Glossy fan-shaped leaves divided into finger segments on bamboo-like canes; thrives in dim light.",
    "noviceTip": "Glossy fan-shaped leaves divided into finger segments on bamboo-like canes; thrives in dim light.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-sago-palm",
    "name": "Sago Palm",
    "commonName": "Sago Palm",
    "scientificName": "Cycas revoluta",
    "botanicalName": "Cycas revoluta",
    "alternateNames": "King Sago / Cycad",
    "category": "palm",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Living Room",
    "notes": "Prehistoric cycad with stiff feather fronds crowning a rugged trunk; slow growing and drought hardy.",
    "noviceTip": "Prehistoric cycad with stiff feather fronds crowning a rugged trunk; slow growing and drought hardy.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-pygmy-date-palm",
    "name": "Pygmy Date Palm",
    "commonName": "Pygmy Date Palm",
    "scientificName": "Phoenix roebelenii",
    "botanicalName": "Phoenix roebelenii",
    "alternateNames": "Miniature Date Palm",
    "category": "palm",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bright Sunny Corner",
    "notes": "Gracefully curving crowns with fine-textured feathery fronds; water when top inch of soil dries.",
    "noviceTip": "Gracefully curving crowns with fine-textured feathery fronds; water when top inch of soil dries.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-bamboo-palm",
    "name": "Bamboo Palm",
    "commonName": "Bamboo Palm",
    "scientificName": "Chamaedorea seifrizii",
    "botanicalName": "Chamaedorea seifrizii",
    "alternateNames": "Reed Palm",
    "category": "palm",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Office Corner",
    "notes": "Dense clusters of slender bamboo-like stems with lush feathery foliage; excellent indoor air purifier.",
    "noviceTip": "Dense clusters of slender bamboo-like stems with lush feathery foliage; excellent indoor air purifier.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-cat-palm",
    "name": "Cat Palm",
    "commonName": "Cat Palm",
    "scientificName": "Chamaedorea cataractarum",
    "botanicalName": "Chamaedorea cataractarum",
    "alternateNames": "Cascade Palm / Cataract Palm",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Floor",
    "notes": "Trunkless clumping palm with deep green glossy fronds; likes evenly moist soil and bright filtered light.",
    "noviceTip": "Trunkless clumping palm with deep green glossy fronds; likes evenly moist soil and bright filtered light.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-chinese-fan-palm",
    "name": "Chinese Fan Palm",
    "commonName": "Chinese Fan Palm",
    "scientificName": "Livistona chinensis",
    "botanicalName": "Livistona chinensis",
    "alternateNames": "Fountain Palm",
    "category": "palm",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Living Room",
    "notes": "Large emerald fan leaves with weeping leaf tips that create an elegant fountain effect.",
    "noviceTip": "Large emerald fan leaves with weeping leaf tips that create an elegant fountain effect.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-european-fan-palm",
    "name": "Mediterranean Fan Palm",
    "commonName": "Mediterranean Fan Palm",
    "scientificName": "Chamaerops humilis",
    "botanicalName": "Chamaerops humilis",
    "alternateNames": "European Fan Palm",
    "category": "palm",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Hardy multi-stemmed palm with silver-green fan blades; withstands outdoor chilly breezes.",
    "noviceTip": "Hardy multi-stemmed palm with silver-green fan blades; withstands outdoor chilly breezes.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-harts-tongue-fern",
    "name": "Hart's Tongue Fern",
    "commonName": "Hart's Tongue Fern",
    "scientificName": "Asplenium scolopendrium",
    "botanicalName": "Asplenium scolopendrium",
    "alternateNames": "Horse Tongue Fern",
    "category": "palm",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Shaded Window Nook",
    "notes": "Solid strap-like undulating glossy fronds that remain evergreen; appreciates limestone-enriched soil.",
    "noviceTip": "Solid strap-like undulating glossy fronds that remain evergreen; appreciates limestone-enriched soil.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-maidenhair-spleenwort",
    "name": "Maidenhair Spleenwort",
    "commonName": "Maidenhair Spleenwort",
    "scientificName": "Asplenium trichomanes",
    "botanicalName": "Asplenium trichomanes",
    "alternateNames": "Rock Spleenwort",
    "category": "palm",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Rockery / Shelf",
    "notes": "Delicate tufts of miniature round green pinnae along glossy purplish-brown stems.",
    "noviceTip": "Delicate tufts of miniature round green pinnae along glossy purplish-brown stems.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-cinnamon-fern",
    "name": "Cinnamon Fern",
    "commonName": "Cinnamon Fern",
    "scientificName": "Osmundastrum cinnamomeum",
    "botanicalName": "Osmundastrum cinnamomeum",
    "alternateNames": "Buckhorn Fern",
    "category": "palm",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Garden Pond Edge",
    "notes": "Produces central cinnamon-colored fertile fronds surrounded by a vase of bright green plumes.",
    "noviceTip": "Produces central cinnamon-colored fertile fronds surrounded by a vase of bright green plumes.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-peace-lily",
    "name": "Peace Lily",
    "commonName": "Peace Lily",
    "scientificName": "Spathiphyllum wallisii",
    "botanicalName": "Spathiphyllum wallisii",
    "alternateNames": "White Sails / Spath",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Living Room Corner",
    "notes": "Pure white floral spathes and glossy dark leaves. Droops dramatically when thirsty and perks up fast.",
    "noviceTip": "Pure white floral spathes and glossy dark leaves. Droops dramatically when thirsty and perks up fast.",
    "imageUrl": "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-peace-lily-sensation",
    "name": "Giant Peace Lily Sensation",
    "commonName": "Giant Peace Lily Sensation",
    "scientificName": "Spathiphyllum Sensation",
    "botanicalName": "Spathiphyllum Sensation",
    "alternateNames": "King Peace Lily",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Living Room Floor",
    "notes": "Massive ribbed deep emerald leaves reaching 3-4 feet tall with giant porcelain-white blooms.",
    "noviceTip": "Massive ribbed deep emerald leaves reaching 3-4 feet tall with giant porcelain-white blooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-moth-orchid",
    "name": "Moth Orchid",
    "commonName": "Moth Orchid",
    "scientificName": "Phalaenopsis aphrodite",
    "botanicalName": "Phalaenopsis aphrodite",
    "alternateNames": "Phalaenopsis Orchid",
    "category": "flowering",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bathroom Sill",
    "notes": "Long-lasting blooms on arching sprays. Soak bark medium when root tips turn silvery gray.",
    "noviceTip": "Long-lasting blooms on arching sprays. Soak bark medium when root tips turn silvery gray.",
    "imageUrl": "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-dendrobium-orchid",
    "name": "Dendrobium Orchid",
    "commonName": "Dendrobium Orchid",
    "scientificName": "Dendrobium nobile",
    "botanicalName": "Dendrobium nobile",
    "alternateNames": "Bamboo Orchid",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Bright Window Table",
    "notes": "Sweetly fragrant blossoms sprouting along sturdy cane stems; needs bright filtered light.",
    "noviceTip": "Sweetly fragrant blossoms sprouting along sturdy cane stems; needs bright filtered light.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-anthurium-flamingo",
    "name": "Flamingo Flower",
    "commonName": "Flamingo Flower",
    "scientificName": "Anthurium andraeanum",
    "botanicalName": "Anthurium andraeanum",
    "alternateNames": "Tailflower / Painted Tongue",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "Glossy heart-shaped waxy red spathes with bright yellow spadix spikes; flowers nearly year-round.",
    "noviceTip": "Glossy heart-shaped waxy red spathes with bright yellow spadix spikes; flowers nearly year-round.",
    "imageUrl": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-african-violet",
    "name": "African Violet",
    "commonName": "African Violet",
    "scientificName": "Saintpaulia ionantha",
    "botanicalName": "Saintpaulia ionantha",
    "alternateNames": "Saintpaulia",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Kitchen Window Shelf",
    "notes": "Velvety scalloped leaves with clusters of violet, pink, or white flowers; water bottom-up with room-temp water.",
    "noviceTip": "Velvety scalloped leaves with clusters of violet, pink, or white flowers; water bottom-up with room-temp water.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-cyclamen-persicum",
    "name": "Persian Cyclamen",
    "commonName": "Persian Cyclamen",
    "scientificName": "Cyclamen persicum",
    "botanicalName": "Cyclamen persicum",
    "alternateNames": "Sowbread / Florist's Cyclamen",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Cool Bedroom Window",
    "notes": "Reflexed winged flowers hovering over patterned silver-marbled hearts; prefers cooler room temperatures.",
    "noviceTip": "Reflexed winged flowers hovering over patterned silver-marbled hearts; prefers cooler room temperatures.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-begonia-maculata",
    "name": "Polka Dot Begonia",
    "commonName": "Polka Dot Begonia",
    "scientificName": "Begonia maculata Wightii",
    "botanicalName": "Begonia maculata Wightii",
    "alternateNames": "Forel Begonia / Angel Wing Begonia",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Dining Table",
    "notes": "Angel-wing leaves dotted with silver polka dots and deep crimson undersides; delicate white floral clusters.",
    "noviceTip": "Angel-wing leaves dotted with silver polka dots and deep crimson undersides; delicate white floral clusters.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-begonia-rex",
    "name": "Rex Begonia",
    "commonName": "Rex Begonia",
    "scientificName": "Begonia rex-cultorum",
    "botanicalName": "Begonia rex-cultorum",
    "alternateNames": "King Begonia / Painted-Leaf Begonia",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Office Bookshelf",
    "notes": "Exquisite swirls of metallic silver, burgundy, and emerald; keep soil evenly moist without overwatering.",
    "noviceTip": "Exquisite swirls of metallic silver, burgundy, and emerald; keep soil evenly moist without overwatering.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-begonia-rieger",
    "name": "Rieger Begonia",
    "commonName": "Rieger Begonia",
    "scientificName": "Begonia x hiemalis",
    "botanicalName": "Begonia x hiemalis",
    "alternateNames": "Elatior Begonia",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Window",
    "notes": "Profusion of double rose-like blooms in shades of yellow, apricot, red, and pink.",
    "noviceTip": "Profusion of double rose-like blooms in shades of yellow, apricot, red, and pink.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-bromeliad-guzmania",
    "name": "Guzmania Bromeliad",
    "commonName": "Guzmania Bromeliad",
    "scientificName": "Guzmania lingulata",
    "botanicalName": "Guzmania lingulata",
    "alternateNames": "Scarlet Star",
    "category": "flowering",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Coffee Table",
    "notes": "Vibrant scarlet floral fountain bract lasting months. Keep fresh water in the central cup urn.",
    "noviceTip": "Vibrant scarlet floral fountain bract lasting months. Keep fresh water in the central cup urn.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-bromeliad-aechmea",
    "name": "Urn Plant",
    "commonName": "Urn Plant",
    "scientificName": "Aechmea fasciata",
    "botanicalName": "Aechmea fasciata",
    "alternateNames": "Silver Vase Plant",
    "category": "flowering",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Shelf",
    "notes": "Powdery silver-banded leaves holding an exotic spiky pink flower head with tiny purple florets.",
    "noviceTip": "Powdery silver-banded leaves holding an exotic spiky pink flower head with tiny purple florets.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-hoya-carnosa",
    "name": "Wax Plant Hoya",
    "commonName": "Wax Plant Hoya",
    "scientificName": "Hoya carnosa",
    "botanicalName": "Hoya carnosa",
    "alternateNames": "Porcelainflower",
    "category": "flowering",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Window Splay",
    "notes": "Clusters of fragrant, porcelain star-shaped blooms with red centers; thick succulent trailing vines.",
    "noviceTip": "Clusters of fragrant, porcelain star-shaped blooms with red centers; thick succulent trailing vines.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-hoya-kerrii",
    "name": "Sweetheart Hoya",
    "commonName": "Sweetheart Hoya",
    "scientificName": "Hoya kerrii",
    "botanicalName": "Hoya kerrii",
    "alternateNames": "Valentine Hoya / Lucky Heart",
    "category": "flowering",
    "waterFrequencyDays": 14,
    "waterDays": 14,
    "wateringDays": 14,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Desk",
    "notes": "Thick succulent foliage shaped like perfect emerald hearts; treat like a gentle succulent.",
    "noviceTip": "Thick succulent foliage shaped like perfect emerald hearts; treat like a gentle succulent.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-hoya-bella",
    "name": "Miniature Wax Plant",
    "commonName": "Miniature Wax Plant",
    "scientificName": "Hoya lanceolata subsp. bella",
    "botanicalName": "Hoya lanceolata subsp. bella",
    "alternateNames": "Beautiful Hoya",
    "category": "flowering",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hanging Planter",
    "notes": "Dainty pointed succulent foliage with nodding umbels of white flowers and purple star crowns.",
    "noviceTip": "Dainty pointed succulent foliage with nodding umbels of white flowers and purple star crowns.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-clivia-miniata",
    "name": "Kaffir Lily",
    "commonName": "Kaffir Lily",
    "scientificName": "Clivia miniata",
    "botanicalName": "Clivia miniata",
    "alternateNames": "Bush Lily / St. John’s Lily",
    "category": "flowering",
    "waterFrequencyDays": 12,
    "waterDays": 12,
    "wateringDays": 12,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Cool Living Room Corner",
    "notes": "Sturdy dark green strap leaves sending up glowing clusters of trumpet-shaped fiery orange flowers.",
    "noviceTip": "Sturdy dark green strap leaves sending up glowing clusters of trumpet-shaped fiery orange flowers.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-amaryllis-hippeastrum",
    "name": "Amaryllis",
    "commonName": "Amaryllis",
    "scientificName": "Hippeastrum hybrid",
    "botanicalName": "Hippeastrum hybrid",
    "alternateNames": "Barbados Lily / Winter Amaryllis",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Dining Room Table",
    "notes": "Massive trumpet blossoms atop tall hollow stalks in winter; water moderately until bloom spikes appear.",
    "noviceTip": "Massive trumpet blossoms atop tall hollow stalks in winter; water moderately until bloom spikes appear.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-gardenia-jasminoides",
    "name": "Cape Jasmine Gardenia",
    "commonName": "Cape Jasmine Gardenia",
    "scientificName": "Gardenia jasminoides",
    "botanicalName": "Gardenia jasminoides",
    "alternateNames": "Gardenia",
    "category": "flowering",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Window",
    "notes": "Intoxicating sweet perfume from creamy white double blossoms; loves acidic, moist soil and warm air.",
    "noviceTip": "Intoxicating sweet perfume from creamy white double blossoms; loves acidic, moist soil and warm air.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-arabian-jasmine",
    "name": "Arabian Jasmine",
    "commonName": "Arabian Jasmine",
    "scientificName": "Jasminum sambac",
    "botanicalName": "Jasminum sambac",
    "alternateNames": "Sampaguita / Maid of Orleans",
    "category": "flowering",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony Sill",
    "notes": "Sweetly fragrant star-shaped white blossoms used in jasmine tea; blooms throughout warm months.",
    "noviceTip": "Sweetly fragrant star-shaped white blossoms used in jasmine tea; blooms throughout warm months.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-madagascar-jasmine",
    "name": "Madagascar Jasmine",
    "commonName": "Madagascar Jasmine",
    "scientificName": "Stephanotis floribunda",
    "botanicalName": "Stephanotis floribunda",
    "alternateNames": "Bridal Wreath / Hawaiian Wedding Flower",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunroom Trellis",
    "notes": "Glossy leathery vine with pure white waxy tubular blooms producing a heavenly sweet fragrance.",
    "noviceTip": "Glossy leathery vine with pure white waxy tubular blooms producing a heavenly sweet fragrance.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-gloxinia",
    "name": "Gloxinia",
    "commonName": "Gloxinia",
    "scientificName": "Sinningia speciosa",
    "botanicalName": "Sinningia speciosa",
    "alternateNames": "Florist’s Gloxinia",
    "category": "flowering",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Tabletop Display",
    "notes": "Velvety ruffled bell flowers in rich royal purple, crimson, and two-tone ruffles; water soil directly.",
    "noviceTip": "Velvety ruffled bell flowers in rich royal purple, crimson, and two-tone ruffles; water soil directly.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lipstick-plant",
    "name": "Lipstick Plant",
    "commonName": "Lipstick Plant",
    "scientificName": "Aeschynanthus radicans",
    "botanicalName": "Aeschynanthus radicans",
    "alternateNames": "Basket Vine",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Hanging Window Planter",
    "notes": "Bright scarlet tubular flowers emerging from dark maroon calyces resembling tubes of lipstick.",
    "noviceTip": "Bright scarlet tubular flowers emerging from dark maroon calyces resembling tubes of lipstick.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-goldfish-plant",
    "name": "Goldfish Plant",
    "commonName": "Goldfish Plant",
    "scientificName": "Nematanthus gregarius",
    "botanicalName": "Nematanthus gregarius",
    "alternateNames": "Clog Plant",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Window Basket",
    "notes": "Trailing waxy stems with cheerful puffy orange blooms shaped exactly like swimming goldfish.",
    "noviceTip": "Trailing waxy stems with cheerful puffy orange blooms shaped exactly like swimming goldfish.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-hibiscus-rosa-sinensis",
    "name": "Tropical Hibiscus",
    "commonName": "Tropical Hibiscus",
    "scientificName": "Hibiscus rosa-sinensis",
    "botanicalName": "Hibiscus rosa-sinensis",
    "alternateNames": "China Rose / Hawaiian Hibiscus",
    "category": "flowering",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Spectacular flared blooms with prominent pollen stamens; thirsty plant requiring bright full sun.",
    "noviceTip": "Spectacular flared blooms with prominent pollen stamens; thirsty plant requiring bright full sun.",
    "imageUrl": "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-geranium-zonale",
    "name": "Zonal Geranium",
    "commonName": "Zonal Geranium",
    "scientificName": "Pelargonium x hortorum",
    "botanicalName": "Pelargonium x hortorum",
    "alternateNames": "Garden Geranium",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Window Box",
    "notes": "Classic rounded scalloped foliage with dark horseshoe zones; bright clusters of red, pink, and coral.",
    "noviceTip": "Classic rounded scalloped foliage with dark horseshoe zones; bright clusters of red, pink, and coral.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-petunia-wave",
    "name": "Wave Petunia",
    "commonName": "Wave Petunia",
    "scientificName": "Petunia x hybrida",
    "botanicalName": "Petunia x hybrida",
    "alternateNames": "Trailing Petunia",
    "category": "flowering",
    "waterFrequencyDays": 3,
    "waterDays": 3,
    "wateringDays": 3,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Hanging Basket",
    "notes": "Prolific trumpet-shaped blooms spilling over planters all summer long; water daily in hot weather.",
    "noviceTip": "Prolific trumpet-shaped blooms spilling over planters all summer long; water daily in hot weather.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-calibrachoa-million-bells",
    "name": "Million Bells",
    "commonName": "Million Bells",
    "scientificName": "Calibrachoa hybrid",
    "botanicalName": "Calibrachoa hybrid",
    "alternateNames": "Mini Petunia",
    "category": "flowering",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Porch Hanging Basket",
    "notes": "Hundreds of miniature petunia-like blossoms that self-clean without needing deadheading.",
    "noviceTip": "Hundreds of miniature petunia-like blossoms that self-clean without needing deadheading.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-hydrangea-macrophylla",
    "name": "Bigleaf Hydrangea",
    "commonName": "Bigleaf Hydrangea",
    "scientificName": "Hydrangea macrophylla",
    "botanicalName": "Hydrangea macrophylla",
    "alternateNames": "French Hydrangea / Mophead",
    "category": "flowering",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Shaded Patio",
    "notes": "Enormous spherical flower globes whose color shifts from pink to blue depending on soil pH.",
    "noviceTip": "Enormous spherical flower globes whose color shifts from pink to blue depending on soil pH.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-bougainvillea",
    "name": "Bougainvillea",
    "commonName": "Bougainvillea",
    "scientificName": "Bougainvillea spectabilis",
    "botanicalName": "Bougainvillea spectabilis",
    "alternateNames": "Paper Flower",
    "category": "flowering",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony Trellis",
    "notes": "Explosion of vibrant papery magenta or orange bracts; drought champion that loves hot blazing sun.",
    "noviceTip": "Explosion of vibrant papery magenta or orange bracts; drought champion that loves hot blazing sun.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-fuchsia-trailing",
    "name": "Trailing Fuchsia",
    "commonName": "Trailing Fuchsia",
    "scientificName": "Fuchsia magellanica hybrid",
    "botanicalName": "Fuchsia magellanica hybrid",
    "alternateNames": "Lady's Eardrops",
    "category": "flowering",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "Shaded Porch Basket",
    "notes": "Intricate pendulous bi-colored ballerina blooms; loves cool shade and moist potting soil.",
    "noviceTip": "Intricate pendulous bi-colored ballerina blooms; loves cool shade and moist potting soil.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-zinnia-elegans",
    "name": "Zinnia",
    "commonName": "Zinnia",
    "scientificName": "Zinnia elegans",
    "botanicalName": "Zinnia elegans",
    "alternateNames": "Common Zinnia",
    "category": "flowering",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Garden Pot",
    "notes": "Cheerful multi-petaled daisy blooms that attract butterflies all summer; water base to avoid powdery mildew.",
    "noviceTip": "Cheerful multi-petaled daisy blooms that attract butterflies all summer; water base to avoid powdery mildew.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-french-marigold",
    "name": "French Marigold",
    "commonName": "French Marigold",
    "scientificName": "Tagetes patula",
    "botanicalName": "Tagetes patula",
    "alternateNames": "Marigold",
    "category": "flowering",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Herb & Garden Border",
    "notes": "Fiery gold and mahogany aromatic blooms; natural companion plant that repels garden pests.",
    "noviceTip": "Fiery gold and mahogany aromatic blooms; natural companion plant that repels garden pests.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-pansy-viola",
    "name": "Garden Pansy",
    "commonName": "Garden Pansy",
    "scientificName": "Viola x wittrockiana",
    "botanicalName": "Viola x wittrockiana",
    "alternateNames": "Johnny Jump Up",
    "category": "flowering",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Cool Window Box",
    "notes": "Velvety face-patterned edible petals that flourish in cool spring and autumn weather.",
    "noviceTip": "Velvety face-patterned edible petals that flourish in cool spring and autumn weather.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-impatiens-walleriana",
    "name": "Busy Lizzie",
    "commonName": "Busy Lizzie",
    "scientificName": "Impatiens walleriana",
    "botanicalName": "Impatiens walleriana",
    "alternateNames": "Touch-Me-Not",
    "category": "flowering",
    "waterFrequencyDays": 3,
    "waterDays": 3,
    "wateringDays": 3,
    "lightLevel": "Low Light",
    "light": "Low / Shade",
    "defaultLocation": "Shaded Patio Planter",
    "notes": "Non-stop colorful blooms that light up shady patios and porches; needs consistently moist soil.",
    "noviceTip": "Non-stop colorful blooms that light up shady patios and porches; needs consistently moist soil.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-miniature-rose",
    "name": "Miniature Rose",
    "commonName": "Miniature Rose",
    "scientificName": "Rosa chinensis minima",
    "botanicalName": "Rosa chinensis minima",
    "alternateNames": "Patio Rose",
    "category": "flowering",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony Pot",
    "notes": "Perfect dwarf rose blooms with delicate fragrance; requires 6+ hours of direct sun daily.",
    "noviceTip": "Perfect dwarf rose blooms with delicate fragrance; requires 6+ hours of direct sun daily.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-mandevilla",
    "name": "Mandevilla",
    "commonName": "Mandevilla",
    "scientificName": "Mandevilla sanderi",
    "botanicalName": "Mandevilla sanderi",
    "alternateNames": "Dipladenia / Brazilian Jasmine",
    "category": "flowering",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Patio Trellis Pot",
    "notes": "Vigorous climber boasting trumpet flowers in vibrant pink, crimson, and white all summer.",
    "noviceTip": "Vigorous climber boasting trumpet flowers in vibrant pink, crimson, and white all summer.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-plumeria-frangipani",
    "name": "Frangipani",
    "commonName": "Frangipani",
    "scientificName": "Plumeria rubra",
    "botanicalName": "Plumeria rubra",
    "alternateNames": "Temple Tree / Plumeria",
    "category": "flowering",
    "waterFrequencyDays": 9,
    "waterDays": 9,
    "wateringDays": 9,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Deck",
    "notes": "Unforgettably fragrant pinwheel blooms used in Hawaiian leis; let soil dry between waterings.",
    "noviceTip": "Unforgettably fragrant pinwheel blooms used in Hawaiian leis; let soil dry between waterings.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-kalanchoe-calandiva",
    "name": "Calandiva Kalanchoe",
    "commonName": "Calandiva Kalanchoe",
    "scientificName": "Kalanchoe blossfeldiana Calandiva",
    "botanicalName": "Kalanchoe blossfeldiana Calandiva",
    "alternateNames": "Flaming Katy Rose",
    "category": "flowering",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Counter",
    "notes": "Succulent dark green foliage crowned with clusters of tiny double rose-like blossoms for weeks.",
    "noviceTip": "Succulent dark green foliage crowned with clusters of tiny double rose-like blossoms for weeks.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-crossandra-firecracker",
    "name": "Firecracker Flower",
    "commonName": "Firecracker Flower",
    "scientificName": "Crossandra infundibuliformis",
    "botanicalName": "Crossandra infundibuliformis",
    "alternateNames": "Kanakambaram",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunny Room Shelf",
    "notes": "Glossy leaves with salmon-apricot fan petals; thrives in warm humid indoor environments.",
    "noviceTip": "Glossy leaves with salmon-apricot fan petals; thrives in warm humid indoor environments.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-streptocarpus-cape-primrose",
    "name": "Cape Primrose",
    "commonName": "Cape Primrose",
    "scientificName": "Streptocarpus hybrid",
    "botanicalName": "Streptocarpus hybrid",
    "alternateNames": "False African Violet",
    "category": "flowering",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Medium Light",
    "light": "Medium / Indirect",
    "defaultLocation": "East-Facing Window Sill",
    "notes": "Trumpet-shaped blossoms on slender stems rising above quilted leaves; long-blooming houseplant.",
    "noviceTip": "Trumpet-shaped blossoms on slender stems rising above quilted leaves; long-blooming houseplant.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-medinilla-magnifica",
    "name": "Showy Medinilla",
    "commonName": "Showy Medinilla",
    "scientificName": "Medinilla magnifica",
    "botanicalName": "Medinilla magnifica",
    "alternateNames": "Rose Grape / Chandelier Plant",
    "category": "flowering",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Feature Table Display",
    "notes": "Spectacular pendulous pink flower chandeliers cascading from bold tiered winged stems.",
    "noviceTip": "Spectacular pendulous pink flower chandeliers cascading from bold tiered winged stems.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-cattleya-orchid",
    "name": "Cattleya Orchid",
    "commonName": "Cattleya Orchid",
    "scientificName": "Cattleya labiata",
    "botanicalName": "Cattleya labiata",
    "alternateNames": "Corsage Orchid",
    "category": "flowering",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Sunlit Bathroom",
    "notes": "Exotic, intensely fragrant large blossoms with ruffled lips; allow potting medium to dry between soakings.",
    "noviceTip": "Exotic, intensely fragrant large blossoms with ruffled lips; allow potting medium to dry between soakings.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-oncidium-orchid",
    "name": "Dancing Lady Orchid",
    "commonName": "Dancing Lady Orchid",
    "scientificName": "Oncidium hybrid",
    "botanicalName": "Oncidium hybrid",
    "alternateNames": "Golden Shower Orchid",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Living Room Table",
    "notes": "Clouds of tiny golden-yellow blossoms resembling skirted dancing ladies; light, cheerful fragrance.",
    "noviceTip": "Clouds of tiny golden-yellow blossoms resembling skirted dancing ladies; light, cheerful fragrance.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-tillandsia-pink-quill",
    "name": "Pink Quill Bromeliad",
    "commonName": "Pink Quill Bromeliad",
    "scientificName": "Wallisia cyanea",
    "botanicalName": "Wallisia cyanea",
    "alternateNames": "Tillandsia Cyanea",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Office Desk",
    "notes": "Feathery foliage supporting a flat bright pink paddle bract from which royal blue florets emerge.",
    "noviceTip": "Feathery foliage supporting a flat bright pink paddle bract from which royal blue florets emerge.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-crown-imperial",
    "name": "Crown Imperial",
    "commonName": "Crown Imperial",
    "scientificName": "Fritillaria imperialis",
    "botanicalName": "Fritillaria imperialis",
    "alternateNames": "Kaiser's Crown",
    "category": "flowering",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Spring Garden Border",
    "notes": "Nodding bell flowers crowned by an upright tuft of glossy green leaves; majestic spring feature.",
    "noviceTip": "Nodding bell flowers crowned by an upright tuft of glossy green leaves; majestic spring feature.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-sweet-basil",
    "name": "Sweet Basil",
    "commonName": "Sweet Basil",
    "scientificName": "Ocimum basilicum",
    "botanicalName": "Ocimum basilicum",
    "alternateNames": "Genovese Basil / Italian Basil",
    "category": "herb",
    "waterFrequencyDays": 3,
    "waterDays": 3,
    "wateringDays": 3,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Window Sill",
    "notes": "Thirsty aromatic culinary staple. Water whenever the topsoil feels dry and pinch flower buds.",
    "noviceTip": "Thirsty aromatic culinary staple. Water whenever the topsoil feels dry and pinch flower buds.",
    "imageUrl": "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-thai-basil",
    "name": "Thai Basil",
    "commonName": "Thai Basil",
    "scientificName": "Ocimum basilicum var. thyrsiflora",
    "botanicalName": "Ocimum basilicum var. thyrsiflora",
    "alternateNames": "Horapha / Asian Basil",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Window",
    "notes": "Anise-scented foliage with purple stems and pink blossoms; essential for curries and noodle soups.",
    "noviceTip": "Anise-scented foliage with purple stems and pink blossoms; essential for curries and noodle soups.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-holy-basil-tulsi",
    "name": "Holy Basil (Tulsi)",
    "commonName": "Holy Basil (Tulsi)",
    "scientificName": "Ocimum tenuiflorum",
    "botanicalName": "Ocimum tenuiflorum",
    "alternateNames": "Tulsi / Sacred Basil",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Revered Ayurvedic herbal tea plant with spicy peppery clove notes; thrives in warm sunny rooms.",
    "noviceTip": "Revered Ayurvedic herbal tea plant with spicy peppery clove notes; thrives in warm sunny rooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-rosemary",
    "name": "Rosemary",
    "commonName": "Rosemary",
    "scientificName": "Salvia rosmarinus",
    "botanicalName": "Salvia rosmarinus",
    "alternateNames": "Dew of the Sea",
    "category": "herb",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Kitchen Window",
    "notes": "Woody Mediterranean pine-scented needles. Allow soil to dry moderately and provide direct sun.",
    "noviceTip": "Woody Mediterranean pine-scented needles. Allow soil to dry moderately and provide direct sun.",
    "imageUrl": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-spearmint",
    "name": "Spearmint",
    "commonName": "Spearmint",
    "scientificName": "Mentha spicata",
    "botanicalName": "Mentha spicata",
    "alternateNames": "Garden Mint",
    "category": "herb",
    "waterFrequencyDays": 3,
    "waterDays": 3,
    "wateringDays": 3,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Counter Pot",
    "notes": "Vigorous sweet mint; best grown in its own isolated container to prevent spreading into other plants.",
    "noviceTip": "Vigorous sweet mint; best grown in its own isolated container to prevent spreading into other plants.",
    "imageUrl": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-peppermint",
    "name": "Peppermint",
    "commonName": "Peppermint",
    "scientificName": "Mentha x piperita",
    "botanicalName": "Mentha x piperita",
    "alternateNames": "Brandy Mint",
    "category": "herb",
    "waterFrequencyDays": 3,
    "waterDays": 3,
    "wateringDays": 3,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Balcony Herb Planter",
    "notes": "High menthol content cooling leaves; perfect for fresh teas. Keep soil consistently moist.",
    "noviceTip": "High menthol content cooling leaves; perfect for fresh teas. Keep soil consistently moist.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-apple-mint",
    "name": "Apple Mint",
    "commonName": "Apple Mint",
    "scientificName": "Mentha suaveolens",
    "botanicalName": "Mentha suaveolens",
    "alternateNames": "Woolly Mint",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Patio Herb Pot",
    "notes": "Velvety round fuzzy leaves with gentle fruity apple notes; delightful in iced teas and fruit salads.",
    "noviceTip": "Velvety round fuzzy leaves with gentle fruity apple notes; delightful in iced teas and fruit salads.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-english-thyme",
    "name": "English Thyme",
    "commonName": "English Thyme",
    "scientificName": "Thymus vulgaris",
    "botanicalName": "Thymus vulgaris",
    "alternateNames": "Common Thyme / Garden Thyme",
    "category": "herb",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Window",
    "notes": "Tiny aromatic culinary leaves on woody sprigs; water when soil surface feels dry and provide bright sun.",
    "noviceTip": "Tiny aromatic culinary leaves on woody sprigs; water when soil surface feels dry and provide bright sun.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lemon-thyme",
    "name": "Lemon Thyme",
    "commonName": "Lemon Thyme",
    "scientificName": "Thymus citriodorus",
    "botanicalName": "Thymus citriodorus",
    "alternateNames": "Citrus Thyme",
    "category": "herb",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window Sill",
    "notes": "Wonderful tangy lemon-scented foliage with golden-green margins; fantastic with roast vegetables and poultry.",
    "noviceTip": "Wonderful tangy lemon-scented foliage with golden-green margins; fantastic with roast vegetables and poultry.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-flat-leaf-parsley",
    "name": "Flat-Leaf Italian Parsley",
    "commonName": "Flat-Leaf Italian Parsley",
    "scientificName": "Petroselinum crispum var. neapolitanum",
    "botanicalName": "Petroselinum crispum var. neapolitanum",
    "alternateNames": "Italian Parsley",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Counter",
    "notes": "Robust culinary flavor for sauces and marinades; prefers consistent moisture and rich well-drained soil.",
    "noviceTip": "Robust culinary flavor for sauces and marinades; prefers consistent moisture and rich well-drained soil.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-curly-parsley",
    "name": "Curly Parsley",
    "commonName": "Curly Parsley",
    "scientificName": "Petroselinum crispum",
    "botanicalName": "Petroselinum crispum",
    "alternateNames": "Crisped Parsley",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Shelf",
    "notes": "Frizzled emerald ruffled fronds ideal for table garnishes and soups; easy to snip as needed.",
    "noviceTip": "Frizzled emerald ruffled fronds ideal for table garnishes and soups; easy to snip as needed.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-cilantro-coriander",
    "name": "Cilantro (Coriander)",
    "commonName": "Cilantro (Coriander)",
    "scientificName": "Coriandrum sativum",
    "botanicalName": "Coriandrum sativum",
    "alternateNames": "Chinese Parsley / Coriander",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Window",
    "notes": "Fresh pungent leaves for salsas and curries; prefers cooler conditions to prevent premature bolting.",
    "noviceTip": "Fresh pungent leaves for salsas and curries; prefers cooler conditions to prevent premature bolting.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-greek-oregano",
    "name": "Greek Oregano",
    "commonName": "Greek Oregano",
    "scientificName": "Origanum vulgare hirtum",
    "botanicalName": "Origanum vulgare hirtum",
    "alternateNames": "Wild Marjoram",
    "category": "herb",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window Sill",
    "notes": "Intense peppery Mediterranean herb for pizza and pasta; allow soil to dry between waterings.",
    "noviceTip": "Intense peppery Mediterranean herb for pizza and pasta; allow soil to dry between waterings.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-sweet-marjoram",
    "name": "Sweet Marjoram",
    "commonName": "Sweet Marjoram",
    "scientificName": "Origanum majorana",
    "botanicalName": "Origanum majorana",
    "alternateNames": "Knotted Marjoram",
    "category": "herb",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Kitchen Sill",
    "notes": "Delicate floral citrus notes milder and sweeter than oregano; tender perennial in warm sunny rooms.",
    "noviceTip": "Delicate floral citrus notes milder and sweeter than oregano; tender perennial in warm sunny rooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-garden-sage",
    "name": "Garden Sage",
    "commonName": "Garden Sage",
    "scientificName": "Salvia officinalis",
    "botanicalName": "Salvia officinalis",
    "alternateNames": "Common Sage / Culinary Sage",
    "category": "herb",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony",
    "notes": "Velvety grayish-green aromatic leaves; highly drought-hardy once established in a sunny spot.",
    "noviceTip": "Velvety grayish-green aromatic leaves; highly drought-hardy once established in a sunny spot.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-purple-sage",
    "name": "Purple Sage",
    "commonName": "Purple Sage",
    "scientificName": "Salvia officinalis Purpurascens",
    "botanicalName": "Salvia officinalis Purpurascens",
    "alternateNames": "Red Sage",
    "category": "herb",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Ornamental smoky purple-tinted foliage with the same rich earthy flavor as traditional culinary sage.",
    "noviceTip": "Ornamental smoky purple-tinted foliage with the same rich earthy flavor as traditional culinary sage.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-chives",
    "name": "Garden Chives",
    "commonName": "Garden Chives",
    "scientificName": "Allium schoenoprasum",
    "botanicalName": "Allium schoenoprasum",
    "alternateNames": "Common Chives",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Window Box",
    "notes": "Slender hollow grassy blades with delicate onion flavor; cut at base and enjoy pretty purple edible blooms.",
    "noviceTip": "Slender hollow grassy blades with delicate onion flavor; cut at base and enjoy pretty purple edible blooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-garlic-chives",
    "name": "Garlic Chives",
    "commonName": "Garlic Chives",
    "scientificName": "Allium tuberosum",
    "botanicalName": "Allium tuberosum",
    "alternateNames": "Chinese Chives",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Window",
    "notes": "Flat strap-like foliage boasting a pleasant mild garlic taste; wonderful in stir-fries and dumplings.",
    "noviceTip": "Flat strap-like foliage boasting a pleasant mild garlic taste; wonderful in stir-fries and dumplings.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-dill",
    "name": "Dill",
    "commonName": "Dill",
    "scientificName": "Anethum graveolens",
    "botanicalName": "Anethum graveolens",
    "alternateNames": "Dill Weed",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Patio Herb Planter",
    "notes": "Feathery blue-green fronds with signature pickle aroma; keep soil evenly moist in deep pots.",
    "noviceTip": "Feathery blue-green fronds with signature pickle aroma; keep soil evenly moist in deep pots.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-french-tarragon",
    "name": "French Tarragon",
    "commonName": "French Tarragon",
    "scientificName": "Artemisia dracunculus",
    "botanicalName": "Artemisia dracunculus",
    "alternateNames": "True Tarragon",
    "category": "herb",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Kitchen Window Sill",
    "notes": "Subtle sweet anise and licorice flavor essential for classic French Béarnaise and mustard dressings.",
    "noviceTip": "Subtle sweet anise and licorice flavor essential for classic French Béarnaise and mustard dressings.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lemon-balm",
    "name": "Lemon Balm",
    "commonName": "Lemon Balm",
    "scientificName": "Melissa officinalis",
    "botanicalName": "Melissa officinalis",
    "alternateNames": "Sweet Balm",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Herb Garden Table",
    "notes": "Scalloped leaves with zesty lemon fragrance; soothing herb for evening teas and herbal infusions.",
    "noviceTip": "Scalloped leaves with zesty lemon fragrance; soothing herb for evening teas and herbal infusions.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lemongrass",
    "name": "West Indian Lemongrass",
    "commonName": "West Indian Lemongrass",
    "scientificName": "Cymbopogon citratus",
    "botanicalName": "Cymbopogon citratus",
    "alternateNames": "Oil Grass / Fever Grass",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Balcony Planter",
    "notes": "Tall citrus-scented stalks for Southeast Asian broths and teas; thrives in warm sunny spots with ample water.",
    "noviceTip": "Tall citrus-scented stalks for Southeast Asian broths and teas; thrives in warm sunny spots with ample water.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-chamomile-german",
    "name": "German Chamomile",
    "commonName": "German Chamomile",
    "scientificName": "Matricaria chamomilla",
    "botanicalName": "Matricaria chamomilla",
    "alternateNames": "Wild Chamomile",
    "category": "herb",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Apple-scented feathery foliage bearing miniature daisy blossoms prized for calming herbal sleep teas.",
    "noviceTip": "Apple-scented feathery foliage bearing miniature daisy blossoms prized for calming herbal sleep teas.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-bay-laurel",
    "name": "Bay Laurel",
    "commonName": "Bay Laurel",
    "scientificName": "Laurus nobilis",
    "botanicalName": "Laurus nobilis",
    "alternateNames": "Sweet Bay / Bay Leaf Tree",
    "category": "herb",
    "waterFrequencyDays": 8,
    "waterDays": 8,
    "wateringDays": 8,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Patio Door",
    "notes": "Slow-growing woody shrub yielding glossy aromatic bay leaves for slow-cooked stews and stocks.",
    "noviceTip": "Slow-growing woody shrub yielding glossy aromatic bay leaves for slow-cooked stews and stocks.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lavender-english",
    "name": "English Lavender",
    "commonName": "English Lavender",
    "scientificName": "Lavandula angustifolia",
    "botanicalName": "Lavandula angustifolia",
    "alternateNames": "Common Lavender / True Lavender",
    "category": "herb",
    "waterFrequencyDays": 10,
    "waterDays": 10,
    "wateringDays": 10,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Window Sill",
    "notes": "Silvery needle foliage crowned by calming purple floral spikes. Loves dry, lean soil and full sunshine.",
    "noviceTip": "Silvery needle foliage crowned by calming purple floral spikes. Loves dry, lean soil and full sunshine.",
    "imageUrl": "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=400&q=75",
    "image": "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=400&q=75"
  },
  {
    "id": "preset-catnip",
    "name": "Catnip",
    "commonName": "Catnip",
    "scientificName": "Nepeta cataria",
    "botanicalName": "Nepeta cataria",
    "alternateNames": "Catmint",
    "category": "herb",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Balcony Corner",
    "notes": "Aromatic heart-shaped scalloped leaves containing nepetalactone that delights feline friends.",
    "noviceTip": "Aromatic heart-shaped scalloped leaves containing nepetalactone that delights feline friends.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-bronze-fennel",
    "name": "Bronze Fennel",
    "commonName": "Bronze Fennel",
    "scientificName": "Foeniculum vulgare Rubrum",
    "botanicalName": "Foeniculum vulgare Rubrum",
    "alternateNames": "Sweet Fennel",
    "category": "herb",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Planter",
    "notes": "Smoky bronze feathery cloud foliage with sweet anise-flavored leaves and seeds.",
    "noviceTip": "Smoky bronze feathery cloud foliage with sweet anise-flavored leaves and seeds.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-borage",
    "name": "Borage",
    "commonName": "Borage",
    "scientificName": "Borago officinalis",
    "botanicalName": "Borago officinalis",
    "alternateNames": "Starflower",
    "category": "herb",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Herb Garden Bed",
    "notes": "Hairy leaves with cool cucumber taste and bright star-shaped blue edible flowers that bees adore.",
    "noviceTip": "Hairy leaves with cool cucumber taste and bright star-shaped blue edible flowers that bees adore.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-winter-savory",
    "name": "Winter Savory",
    "commonName": "Winter Savory",
    "scientificName": "Satureja montana",
    "botanicalName": "Satureja montana",
    "alternateNames": "Mountain Savory",
    "category": "herb",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Sill",
    "notes": "Evergreen peppery herb with woody stems; classic spice for hearty bean dishes and roasts.",
    "noviceTip": "Evergreen peppery herb with woody stems; classic spice for hearty bean dishes and roasts.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-french-sorrel",
    "name": "French Sorrel",
    "commonName": "French Sorrel",
    "scientificName": "Rumex acetosa",
    "botanicalName": "Rumex acetosa",
    "alternateNames": "Garden Sorrel",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Kitchen Box",
    "notes": "Juicy green spear leaves with a tart lemon-green apple tang; delicious in spring soups and salads.",
    "noviceTip": "Juicy green spear leaves with a tart lemon-green apple tang; delicious in spring soups and salads.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-lovage",
    "name": "Lovage",
    "commonName": "Lovage",
    "scientificName": "Levisticum officinale",
    "botanicalName": "Levisticum officinale",
    "alternateNames": "Maggi Herb",
    "category": "herb",
    "waterFrequencyDays": 4,
    "waterDays": 4,
    "wateringDays": 4,
    "lightLevel": "Bright Indirect",
    "light": "Bright / Indirect",
    "defaultLocation": "Garden Pot",
    "notes": "Tall celery-like foliage with rich umami flavor; a single leaf imparts immense savory depth to broth.",
    "noviceTip": "Tall celery-like foliage with rich umami flavor; a single leaf imparts immense savory depth to broth.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-pineapple-sage",
    "name": "Pineapple Sage",
    "commonName": "Pineapple Sage",
    "scientificName": "Salvia elegans",
    "botanicalName": "Salvia elegans",
    "alternateNames": "Tangerine Sage",
    "category": "herb",
    "waterFrequencyDays": 5,
    "waterDays": 5,
    "wateringDays": 5,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Patio Pot",
    "notes": "Crushed leaves smell unmistakably like fresh ripe pineapple; sends up fiery red autumn tubular blooms.",
    "noviceTip": "Crushed leaves smell unmistakably like fresh ripe pineapple; sends up fiery red autumn tubular blooms.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-tarragon-russian",
    "name": "Russian Tarragon",
    "commonName": "Russian Tarragon",
    "scientificName": "Artemisia dracunculoides",
    "botanicalName": "Artemisia dracunculoides",
    "alternateNames": "False Tarragon",
    "category": "herb",
    "waterFrequencyDays": 7,
    "waterDays": 7,
    "wateringDays": 7,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Patio Herb Pot",
    "notes": "Hardy and vigorous perennial with subtle grassy flavor; exceptionally tolerant of summer heat and drought.",
    "noviceTip": "Hardy and vigorous perennial with subtle grassy flavor; exceptionally tolerant of summer heat and drought.",
    "imageUrl": null,
    "image": null
  },
  {
    "id": "preset-golden-oregano",
    "name": "Golden Oregano",
    "commonName": "Golden Oregano",
    "scientificName": "Origanum vulgare Aureum",
    "botanicalName": "Origanum vulgare Aureum",
    "alternateNames": "Golden Marjoram",
    "category": "herb",
    "waterFrequencyDays": 6,
    "waterDays": 6,
    "wateringDays": 6,
    "lightLevel": "Direct Sun",
    "light": "Bright / Full Sun",
    "defaultLocation": "Sunny Sill",
    "notes": "Luminous chartreuse-gold carpeting foliage with delicious mild oregano seasoning flavor.",
    "noviceTip": "Luminous chartreuse-gold carpeting foliage with delicious mild oregano seasoning flavor.",
    "imageUrl": null,
    "image": null
  }
];


  // --- 2. Status & Date Engine & Client-Side Image Compressor ---
  /**
 * Computes difference in calendar days between two dates.
 * Ignores exact hours/minutes so day transitions are clean and predictable.
 */
function getDaysDifference(pastDateStr, today = new Date()) {
  if (!pastDateStr) return 0;
  
  const [year, month, day] = pastDateStr.split('-').map(Number);
  const past = new Date(year, month - 1, day);
  
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffMs = current.getTime() - past.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates watering status for a plant according to the care rules:
 * - Green ("Healthy / Good"): more than 2 days remain before watering is due
 * - Amber ("Due Soon"): 1-2 days remain
 * - Red ("Needs Water Today" / "Overdue by X days"): due today or past due
 */
function getPlantStatus(lastWateredDate, waterIntervalDays) {
  const daysElapsed = Math.max(0, getDaysDifference(lastWateredDate));
  const daysRemaining = waterIntervalDays - daysElapsed;
  const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / waterIntervalDays) * 100)));

  // Formulate clear elapsed description
  const elapsedText =
    daysElapsed === 0
      ? 'Watered today'
      : daysElapsed === 1
      ? 'Watered 1 day ago'
      : `Watered ${daysElapsed} days ago`;

  // 1. Red status: Due today or overdue
  if (daysRemaining <= 0) {
    const overdueDays = Math.abs(daysRemaining);
    const dueText = overdueDays === 0 ? 'Due today' : `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
    const badgeLabel = overdueDays === 0 ? 'Needs Water Today' : `Overdue by ${overdueDays}d`;

    return {
      category: 'danger',
      label: badgeLabel,
      shortLabel: 'Needs Water',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      pillBg: 'bg-rose-500',
      accentColor: 'rose',
      daysElapsed,
      daysRemaining,
      progressPercent: 100,
      elapsedText,
      dueText,
      indicatorText: `${elapsedText} • ${dueText}`,
      timingText: dueText,
      actionUrgent: true,
      hint: 'Give this plant a thorough drink today'
    };
  }

  // 2. Amber status: 1-2 days remaining
  if (daysRemaining <= 2) {
    const dueText = daysRemaining === 1 ? 'Due tomorrow' : 'Due in 2 days';

    return {
      category: 'warning',
      label: 'Due Soon',
      shortLabel: 'Due Soon',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      pillBg: 'bg-amber-500',
      accentColor: 'amber',
      daysElapsed,
      daysRemaining,
      progressPercent,
      elapsedText,
      dueText,
      indicatorText: `${elapsedText} • Due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`,
      timingText: dueText,
      actionUrgent: false,
      hint: 'Check topsoil moisture before watering'
    };
  }

  // 3. Green status: more than 2 days remaining
  const dueText = `Due in ${daysRemaining} days`;
  return {
    category: 'healthy',
    label: 'Healthy / Good',
    shortLabel: 'Healthy',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    pillBg: 'bg-emerald-500',
    accentColor: 'emerald',
    daysElapsed,
    daysRemaining,
    progressPercent,
    elapsedText,
    dueText,
    indicatorText: `${elapsedText} • ${dueText}`,
    timingText: `Water in ${daysRemaining} days`,
    actionUrgent: false,
    hint: 'Moisture is looking good, no action needed'
  };
}

function formatFriendlyDate(dateStr) {
  if (!dateStr) return 'Never';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });
}


  /**
 * Client-Side Image Compression Utility
 * Resizes and compresses user-uploaded images via HTML5 Canvas
 * Output: Compressed Base64 JPEG data URL suitable for localStorage
 */

function compressImageFile(file, maxWidth = 600, maxHeight = 600, quality = 0.70) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'));
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error('Failed to load image for processing.'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate scaling ratio while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create offscreen canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Could not initialize canvas context.'));
          }

          // Draw image smoothly
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG base64 data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
}


  // --- 3. Local Storage Reactive Hook ---
  
function usePlantStorage() {
  const [plants, setPlants] = useState(() => {
    try {
      const storedVersion = window.localStorage.getItem(VERSION_KEY);
      // Migration bump: If version doesn't match or is unversioned, overwrite keepgreen_plants with updated INITIAL_PLANTS array
      if (storedVersion !== CURRENT_VERSION) {
        window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
        return INITIAL_PLANTS;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Reconcile starter plant image updates so starter cards always display crisp, verified photos
          return parsed.map((p) => {
            const starterMatch = INITIAL_PLANTS.find((sp) => sp.id === p.id);
            if (starterMatch && starterMatch.imageUrl && p.imageUrl !== starterMatch.imageUrl) {
              return { ...p, imageUrl: starterMatch.imageUrl, image: starterMatch.image };
            }
            return p;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to parse localStorage plant data, using defaults:', err);
    }
    // Seed default presets on first run or empty
    try {
      window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
    } catch (e) {
      // ignore
    }
    return INITIAL_PLANTS;
  });

  // Persist to localStorage whenever plants state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
    }
  }, [plants]);

  // One-click quick action: mark as watered today (or custom past date)
  const waterPlant = useCallback((id, customDate = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dateToUse = customDate || todayStr;
    setPlants((prev) =>
      prev.map((plant) =>
        plant.id === id ? { ...plant, lastWateredDate: dateToUse } : plant
      )
    );
  }, []);

  // Add new custom plant
  const addPlant = useCallback((plantData) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = Date.now();
    const newPlant = {
      id: 'plant-' + now + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: now,
      name: plantData.name.trim(),
      nickname: plantData.nickname?.trim() || null,
      subtitle: plantData.subtitle?.trim() || 'Custom Plant',
      location: plantData.location?.trim() || 'Home',
      waterIntervalDays: Number(plantData.waterIntervalDays) || 7,
      lastWateredDate: plantData.lastWateredDate || todayStr,
      sunlightLevel: plantData.sunlightLevel || 'medium',
      sunlightLabel: plantData.sunlightLabel || (
        plantData.sunlightLevel === 'low' ? 'Low / Shade Light' :
        plantData.sunlightLevel === 'high' ? 'Full Sun' : 'Bright / Indirect Light'
      ),
      waterAmount: plantData.waterAmount || 'medium',
      waterAmountLabel: plantData.waterAmountLabel || 'Medium Water',
      careTips: plantData.careTips?.trim() || 'Water when topsoil feels dry to touch.',
      imageUrl: plantData.imageUrl?.trim() || null,
      colorTheme: plantData.colorTheme || 'emerald'
    };
    setPlants((prev) => [newPlant, ...prev]);
  }, []);

  // Update existing plant
  const updatePlant = useCallback((updatedPlant) => {
    setPlants((prev) =>
      prev.map((plant) =>
        plant.id === updatedPlant.id
          ? {
              ...plant,
              ...updatedPlant,
              name: updatedPlant.name.trim(),
              nickname: updatedPlant.nickname?.trim() || null,
              subtitle: updatedPlant.subtitle?.trim() || plant.subtitle,
              location: updatedPlant.location?.trim() || plant.location,
              waterIntervalDays: Number(updatedPlant.waterIntervalDays) || plant.waterIntervalDays,
              lastWateredDate: updatedPlant.lastWateredDate || plant.lastWateredDate,
              sunlightLevel: updatedPlant.sunlightLevel || plant.sunlightLevel,
              sunlightLabel: updatedPlant.sunlightLabel || plant.sunlightLabel,
              careTips: updatedPlant.careTips?.trim() || plant.careTips,
              imageUrl: updatedPlant.imageUrl?.trim() || null
            }
          : plant
      )
    );
  }, []);

  // Remove a plant
  const deletePlant = useCallback((id) => {
    setPlants((prev) => prev.filter((plant) => plant.id !== id));
  }, []);

  // Reset back to starter preset library
  const resetToPresets = useCallback(() => {
    setPlants(INITIAL_PLANTS);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
      window.localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    } catch (e) {
      // ignore
    }
  }, []);

  return {
    plants,
    waterPlant,
    addPlant,
    updatePlant,
    deletePlant,
    resetToPresets
  };
}

function getOrCreateAnonymousId() {
  const KEY = 'keepgreen_user_id';
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = 'KG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    return 'KG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
}



  // --- 4. Lucide Icons Library ---
  
function Sprout({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m7 20 5-10m0 0 5 10m-5-10v10" />
      <path d="M12 10a5 5 0 0 0-5-5H5v2a5 5 0 0 0 5 5" />
      <path d="M12 7a5 5 0 0 1 5-5h2v2a5 5 0 0 1-5 5" />
    </svg>
  );
}

function Droplet({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function Droplets({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
    </svg>
  );
}

function Sun({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function Clock({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircle2({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function Check({ className = "w-4 h-4", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertCircle({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function AlertTriangle({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function Plus({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

function Minus({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

function RotateCcw({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function MapPin({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Calendar({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function Sparkles({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function Leaf({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function Search({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BookOpen({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function Lightbulb({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function Pencil({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function Trash2({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function X({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function Info({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  );
}

function LayoutGrid({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function Grid2X2({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 12h18" />
      <path d="M12 3v18" />
    </svg>
  );
}

function List({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function Camera({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function Upload({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function ImageIcon({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function ArrowRight({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ArrowLeft({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" x2="5" y1="12" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowUpDown({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m21 16-4 4-4-4" />
      <path d="M17 20V4" />
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
    </svg>
  );
}

function HelpCircle({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function MessageSquare({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Send({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function Copy({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function Loader2({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// --- Category Fallback SVG Matrix ---
function Cactus({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 22V6a2 2 0 0 1 4 0v16" />
      <path d="M14 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
      <path d="M10 13H8a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" />
      <path d="M5 22h14" />
    </svg>
  );
}

function Succulent({ className = "w-5 h-5", ...props }) {
  return <Cactus className={className} {...props} />;
}

function Flower({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5" />
      <path d="M12 7.5V3" />
      <path d="M7.5 12H3" />
      <path d="M16.5 12H21" />
      <path d="M12 16.5V21" />
    </svg>
  );
}

function Herb({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3c0 3-2 6-6 7" />
      <path d="M7 10c4 1 6 4 6 7" />
      <path d="M12 21A12 12 0 0 1 7 4" />
      <path d="M12 14c3-1 6-3 7-6" />
      <path d="M4 17c3-1 6-3 7-6" />
    </svg>
  );
}

function Palmtree({ className = "w-5 h-5", ...props }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h11Z" />
      <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-9" />
      <path d="M5.89 15.5c-1.5 1.5-2.5 3.5-2.89 6.5" />
      <path d="M2 13h10" />
      <path d="M12 10v12" />
    </svg>
  );
}

function Palm({ className = "w-5 h-5", ...props }) {
  return <Palmtree className={className} {...props} />;
}

function CategoryIcon({ category = '', className = "w-6 h-6", ...props }) {
  const cat = String(category || '').toLowerCase();
  if (cat.includes('succulent') || cat.includes('cacti') || cat.includes('cactus')) {
    return <Cactus className={className} {...props} />;
  }
  if (cat.includes('flower') || cat.includes('bloom')) {
    return <Flower className={className} {...props} />;
  }
  if (cat.includes('herb') || cat.includes('edible') || cat.includes('vegetable')) {
    return <Herb className={className} {...props} />;
  }
  if (cat.includes('palm') || cat.includes('fern')) {
    return <Palmtree className={className} {...props} />;
  }
  if (cat.includes('foliage') || cat.includes('leaf')) {
    return <Leaf className={className} {...props} />;
  }
  return <Sprout className={className} {...props} />;
}

function getCategoryStyle(category = '') {
  const cat = String(category || '').toLowerCase();
  if (cat.includes('succulent') || cat.includes('cacti') || cat.includes('cactus')) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
      icon: Cactus
    };
  }
  if (cat.includes('flower') || cat.includes('bloom')) {
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40',
      icon: Flower
    };
  }
  if (cat.includes('herb') || cat.includes('edible') || cat.includes('vegetable')) {
    return {
      bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/40',
      icon: Herb
    };
  }
  if (cat.includes('palm') || cat.includes('fern')) {
    return {
      bg: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/40',
      icon: Palmtree
    };
  }
  if (cat.includes('foliage') || cat.includes('leaf')) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
      icon: Leaf
    };
  }
  return {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
    icon: Sprout
  };
}

function CategoryAvatar({
  category = '',
  className = "w-full h-full",
  iconClassName = "w-6 h-6",
  label = null,
  ...props
}) {
  const { bg, icon: IconComponent } = getCategoryStyle(category);
  return (
    <div className={`flex flex-col items-center justify-center border ${bg} ${className}`} {...props}>
      <IconComponent className={iconClassName} />
      {label && (
        <span className="text-[9px] font-bold text-center px-1 truncate max-w-full mt-0.5 opacity-90">
          {label}
        </span>
      )}
    </div>
  );
}




  // --- 5. Components ---
  

function StatusBadge({ status }) {
  const { category, label, badgeClass } = status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${badgeClass}`}
    >
      {category === 'danger' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <AlertCircle className="w-3.5 h-3.5" />
        </>
      )}

      {category === 'warning' && (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      )}

      {category === 'healthy' && (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      )}

      <span>{label}</span>
    </span>
  );
}


  
function PlantCard({ plant, onWater, onEdit, onDelete, viewMode = 'comfortable' }) {
  const [justWatered, setJustWatered] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dateInputRef = useRef(null);
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  // Reset image error state whenever plant image URL changes
  useEffect(() => {
    setImgError(false);
  }, [plant.imageUrl]);
  const status = getPlantStatus(plant.lastWateredDate, plant.waterIntervalDays);

  // Single-tap quick action: Water today
  const handleWaterToday = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onWater(plant.id, plant.name);
    setJustWatered(true);
    setTimeout(() => {
      setJustWatered(false);
    }, 1800);
  };

  // Secondary calendar trigger: opens native OS date picker
  const handleCalendarClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        try {
          dateInputRef.current.showPicker();
        } catch (err) {
          dateInputRef.current.focus();
        }
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  // Date selection change: logs custom/backdated watering
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      onWater(plant.id, plant.name, selectedDate);
      setJustWatered(true);
      setTimeout(() => {
        setJustWatered(false);
      }, 1800);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(plant.id, plant.name);
    setConfirmingDelete(false);
  };

  // Border class based on status category: heavier 3px rose border for overdue plants
  const cardBorderClass =
    status.category === 'danger'
      ? 'border-[3px] border-rose-500 dark:border-rose-600 shadow-md shadow-rose-100 dark:shadow-rose-950/30'
      : status.category === 'warning'
      ? 'border-2 border-amber-300 dark:border-amber-900 shadow-amber-50 dark:shadow-none'
      : 'border-2 border-emerald-100 dark:border-zinc-800 shadow-emerald-50/50 dark:shadow-none';

  // ==========================================
  // VIEW MODE 1: LIST / ROWS
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div
        className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 rounded-xl p-3 sm:px-4 sm:py-2.5 transition-all duration-200 hover:shadow-md w-full max-w-full overflow-hidden ${cardBorderClass}`}
      >
        {/* Left: Avatar + Title & Location */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            {plant.imageUrl && !imgError ? (
              <img
                src={plant.imageUrl}
                alt={plant.name}
                onError={() => setImgError(true)}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            ) : (
              <CategoryAvatar category={plant.category} iconClassName="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                {plant.name}
              </h3>

              {plant.nickname && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                  {plant.nickname}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
              <span className="truncate">{plant.location}</span>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span>Every {plant.waterIntervalDays} days</span>
            </div>
          </div>
        </div>

        {/* Center: Urgency Badge & Countdown */}
        <div className="flex items-center sm:justify-center gap-2.5 shrink-0 sm:px-2">
          <StatusBadge status={status} />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{status.indicatorText}</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0 justify-end">
          {confirmingDelete ? (
            <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg animate-fade-in">
              <span className="text-xs text-rose-700 dark:text-rose-300 font-medium px-1 truncate max-w-[120px]">
                Remove {plant.name}?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2 py-1 text-xs rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2 py-1 text-xs rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold transition"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Button 1: Primary Action ("💧 Today") */}
              <button
                type="button"
                onClick={handleWaterToday}
                title="Mark as watered today"
                className={`min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                  justWatered
                    ? 'bg-emerald-600 ring-2 ring-emerald-400'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {justWatered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce text-emerald-100 shrink-0" />
                    <span>Watered!</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 fill-current shrink-0" />
                    <span>Today</span>
                  </>
                )}
              </button>

              {/* Button 2: Secondary Action ("📅 Pick Date") */}
              <button
                type="button"
                onClick={handleCalendarClick}
                title="Pick custom or past watering date"
                aria-label="Pick custom watering date"
                className="relative min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>Pick Date</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  max={getTodayStr()}
                  defaultValue={plant.lastWateredDate || getTodayStr()}
                  onChange={handleDateChange}
                  className="absolute inset-0 opacity-0 pointer-events-none -z-10"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(plant)}
                  title="Edit plant"
                  aria-label="Edit plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  title="Delete plant"
                  aria-label="Delete plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE 2: COMPACT (DENSER CARDS)
  // ==========================================
  if (viewMode === 'compact') {
    return (
      <div
        className={`relative flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-3.5 transition-all duration-300 hover:shadow-md w-full max-w-full overflow-hidden ${cardBorderClass}`}
      >
        <div>
          {/* Top Row: Square Thumbnail + Plant Details */}
          <div className="flex gap-3 items-start mb-2.5">
            {/* Square Thumbnail on Left */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
              {plant.imageUrl && !imgError ? (
                <img
                  src={plant.imageUrl}
                  alt={plant.name}
                  onError={() => setImgError(true)}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <CategoryAvatar
                  category={plant.category}
                  iconClassName="w-7 h-7 mb-0.5"
                  label={plant.name}
                />
              )}
            </div>

            {/* Title, Badge & Location */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1 mb-1">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                    {plant.name}
                  </h3>
                  {plant.nickname && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 mt-0.5 truncate max-w-full">
                      {plant.nickname}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{plant.location}</span>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span>{plant.waterIntervalDays}d interval</span>
              </div>

              <div className="mt-1.5">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>

          {/* Condensed Status Indicator & Mini Progress Bar */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-lg p-2 mb-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-zinc-700 dark:text-zinc-200 mb-1">
              <span className="flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{status.indicatorText}</span>
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  status.category === 'danger'
                    ? 'bg-rose-500'
                    : status.category === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${status.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Compact Action Footer */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center">
          {confirmingDelete ? (
            <div className="w-full flex items-center justify-between gap-1.5 p-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg animate-fade-in">
              <span className="text-xs text-rose-700 dark:text-rose-300 font-medium truncate">
                Delete?
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-2 py-0.5 text-xs rounded bg-rose-600 text-white font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center gap-2">
              <div className="grid grid-cols-2 gap-2 flex-1">
                {/* Button 1: Primary Action ("💧 Today") */}
                <button
                  type="button"
                  onClick={handleWaterToday}
                  title="Mark as watered today"
                  className={`min-h-[40px] px-2.5 py-1.5 rounded-xl font-semibold text-xs text-white shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                    justWatered
                      ? 'bg-emerald-600 ring-2 ring-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {justWatered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 animate-bounce text-emerald-100 shrink-0" />
                      <span>Watered!</span>
                    </>
                  ) : (
                    <>
                      <Droplet className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>Today</span>
                    </>
                  )}
                </button>

                {/* Button 2: Secondary Action ("📅 Pick Date") */}
                <button
                  type="button"
                  onClick={handleCalendarClick}
                  title="Pick custom or past watering date"
                  aria-label="Pick custom watering date"
                  className="relative min-h-[40px] px-2.5 py-1.5 rounded-xl font-semibold text-xs border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                  <span>Pick Date</span>
                  <input
                    ref={dateInputRef}
                    type="date"
                    max={getTodayStr()}
                    defaultValue={plant.lastWateredDate || getTodayStr()}
                    onChange={handleDateChange}
                    className="absolute inset-0 opacity-0 pointer-events-none -z-10"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(plant)}
                  title="Edit plant"
                  aria-label="Edit plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  title="Delete plant"
                  aria-label="Delete plant"
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE 3: COMFORTABLE (DEFAULT LARGE CARD)
  // ==========================================
  return (
    <div
      className={`relative flex flex-col justify-between bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg w-full max-w-full overflow-hidden ${cardBorderClass}`}
    >
      <div>
        {/* Plant Image Header with Status Badge Overlay */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3.5 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
          {plant.imageUrl && !imgError ? (
            <img
              src={plant.imageUrl}
              alt={plant.name}
              onError={() => setImgError(true)}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <CategoryAvatar
              category={plant.category}
              iconClassName="w-12 h-12 mb-1"
              label={plant.name}
            />
          )}
          <div className="absolute top-2.5 right-2.5 shadow-sm">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Title & Location Header: Primary Heading is ALWAYS Plant Variety */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {plant.name}
              </h3>

              {/* Styled Accent Pill for Nickname / Tag */}
              {plant.nickname ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
                  {plant.nickname}
                </span>
              ) : plant.subtitle ? (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal truncate hidden sm:inline">
                  ({plant.subtitle})
                </span>
              ) : null}
            </div>

            {/* Room / Location Row */}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{plant.location}</span>
            </div>
          </div>
        </div>

        {/* Visual Care Info Cards */}
        <div className="grid grid-cols-2 gap-2 my-3.5">
          <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-lg">
              <Sun className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Sunlight</p>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {plant.sunlightLabel || `${plant.sunlightLevel} Sun`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg">
              <Droplet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Water Every</p>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {plant.waterIntervalDays} days
              </p>
            </div>
          </div>
        </div>

        {/* Status Timing & Progress Bar */}
        <div className="bg-zinc-50/80 dark:bg-zinc-800/40 rounded-xl p-3.5 mb-3">
          {/* Dynamic Urgency Text Indicator */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{status.indicatorText}</span>
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline-block">
              {formatFriendlyDate(plant.lastWateredDate)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                status.category === 'danger'
                  ? 'bg-rose-500'
                  : status.category === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${status.progressPercent}%` }}
            />
          </div>

          {/* Novice hint */}
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 italic flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{status.hint}</span>
          </p>
        </div>

        {/* Plant Care Tip / Notes Field */}
        {plant.careTips && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl mb-3 text-zinc-700 dark:text-zinc-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight line-clamp-2">
              <span className="font-semibold text-amber-900 dark:text-amber-200">Tip: </span>
              {plant.careTips}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions: Quick Water, Edit & Delete */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 min-h-[48px] flex items-center">
        {confirmingDelete ? (
          <div className="w-full flex items-center justify-between gap-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl animate-fade-in">
            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium truncate">
              Remove {plant.name}?
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2">
            <div className="grid grid-cols-2 gap-2 flex-1">
              {/* Button 1: Primary Action ("💧 Today") */}
              <button
                type="button"
                onClick={handleWaterToday}
                title="Mark as watered today"
                className={`min-h-[42px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                  justWatered
                    ? 'bg-emerald-600 ring-2 ring-emerald-400'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {justWatered ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce text-emerald-100 shrink-0" />
                    <span className="font-semibold">Watered! ✨</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 fill-current shrink-0" />
                    <span>Today</span>
                  </>
                )}
              </button>

              {/* Button 2: Secondary Action ("📅 Pick Date") */}
              <button
                type="button"
                onClick={handleCalendarClick}
                title="Pick custom or past watering date"
                aria-label="Pick custom watering date"
                className="relative min-h-[42px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                <span>Pick Date</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  max={getTodayStr()}
                  defaultValue={plant.lastWateredDate || getTodayStr()}
                  onChange={handleDateChange}
                  className="absolute inset-0 opacity-0 pointer-events-none -z-10"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(plant)}
                  title="Edit plant schedule & details"
                  aria-label="Edit plant schedule & details"
                  className="p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  title="Remove plant from schedule"
                  aria-label="Remove plant from schedule"
                  className="p-2.5 min-h-[42px] min-w-[42px] flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


  
// Category filter pills for Step 1
const CATEGORY_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'foliage', label: '🌿 Foliage' },
  { id: 'succulent', label: '🌵 Succulents' },
  { id: 'flowering', label: '🌸 Flowering' },
  { id: 'herb', label: '🍃 Herbs' },
  { id: 'palm', label: '🌴 Palms' }
];

// Top popular starter varieties for empty/focused search state
const POPULAR_PRESET_SLUGS = [
  'preset-monstera-deliciosa',
  'preset-golden-pothos',
  'preset-snake-plant',
  'preset-zz-plant',
  'preset-peace-lily',
  'preset-fiddle-leaf-fig',
  'preset-jade-plant',
  'preset-sweet-basil'
];

function AddPlantModal({ isOpen, onClose, onAdd, existingPlants = [] }) {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const comboboxRef = useRef(null);

  // 3-Step Wizard: 1 = Identity, 2 = Care & Schedule, 3 = Photo & Save
  const [currentStep, setCurrentStep] = useState(1);
  const [nameError, setNameError] = useState(false);

  // Smart Combobox State
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isComboboxFocused, setIsComboboxFocused] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [rowImgErrors, setRowImgErrors] = useState({});

  // Form Fields
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [roomPreset, setRoomPreset] = useState('Living Room');
  const [customRoom, setCustomRoom] = useState('');
  const [waterIntervalDays, setWaterIntervalDays] = useState(7);
  const [sunlightLevel, setSunlightLevel] = useState('medium');
  const [lastWateredDate, setLastWateredDate] = useState(getTodayStr());
  const [careTips, setCareTips] = useState('');
  const [category, setCategory] = useState('foliage');

  // Image & Custom Upload State (Three-Tier Visual System)
  const [visualMode, setVisualMode] = useState('category'); // 'preset' | 'category' | 'custom'
  const [imageUrl, setImageUrl] = useState('');
  const [defaultImageUrl, setDefaultImageUrl] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setNameError(false);
      setIsComboboxOpen(false);
      setIsComboboxFocused(false);
      setSelectedCategoryFilter('all');
      setRowImgErrors({});
    }
  }, [isOpen]);

  // Handle click outside combobox to close suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setIsComboboxOpen(false);
        setIsComboboxFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isComboboxOpen) {
          setIsComboboxOpen(false);
          setIsComboboxFocused(false);
        } else {
          handleExplicitClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isComboboxOpen, currentStep, name, nickname]);

  // Popular starter plants (8 varieties) for empty search state
  const popularPresets = useMemo(() => {
    return POPULAR_PRESET_SLUGS
      .map((slug) => PLANT_DATABASE.find((p) => p.id === slug))
      .filter(Boolean);
  }, []);

  // Bulletproof Combobox search/autocomplete logic
  // Queries ONLY: plant.name, plant.scientificName, and aliases
  // Strictly EXCLUDES: notes, lightLevel, category, id, imageUrl
  const matchingPresets = useMemo(() => {
    const query = name.trim().toLowerCase();

    // 1. Filter by category pill if not 'all'
    let baseList = PLANT_DATABASE;
    if (selectedCategoryFilter !== 'all') {
      baseList = baseList.filter((p) => p.category === selectedCategoryFilter);
    }

    // 2. When empty query, return top 8 items (or popular starters if 'all')
    if (!query) {
      if (selectedCategoryFilter === 'all') {
        return popularPresets.slice(0, 8);
      }
      return baseList.slice(0, 8);
    }

    const matches = baseList.filter((plant) => {
      const commonName = (plant.name || plant.commonName || '').toLowerCase();
      const scientificName = (plant.scientificName || plant.botanicalName || '').toLowerCase();
      const aliases = plant.alternateNames || plant.alternativeNames || plant.aka;

      if (commonName.includes(query)) return true;
      if (scientificName.includes(query)) return true;

      if (Array.isArray(aliases)) {
        return aliases.some((a) => String(a).toLowerCase().includes(query));
      } else if (typeof aliases === 'string' && aliases) {
        return aliases.toLowerCase().includes(query);
      }

      return false;
    });

    // Rank results for intuitive display:
    // 1. Exact start of common name (e.g., "Mon..." -> "Monstera")
    // 2. Word start in common name (e.g., "pothos" -> "Golden Pothos")
    // 3. Exact start of scientific name (e.g., "epi..." -> "Epipremnum aureum")
    // 4. Alphabetical tie-breaker
    return matches.sort((a, b) => {
      const aName = (a.name || a.commonName || '').toLowerCase();
      const bName = (b.name || b.commonName || '').toLowerCase();

      const aStarts = aName.startsWith(query);
      const bStarts = bName.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aWord = aName.split(/\s+/).some((w) => w.startsWith(query));
      const bWord = bName.split(/\s+/).some((w) => w.startsWith(query));
      if (aWord && !bWord) return -1;
      if (!aWord && bWord) return 1;

      const aSci = (a.scientificName || a.botanicalName || '').toLowerCase().startsWith(query);
      const bSci = (b.scientificName || b.botanicalName || '').toLowerCase().startsWith(query);
      if (aSci && !bSci) return -1;
      if (!aSci && bSci) return 1;

      return aName.localeCompare(bName);
    }).slice(0, 8);
  }, [name, selectedCategoryFilter, popularPresets]);

  // Exact match detection across full catalogue
  const hasExactMatch = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return false;
    return PLANT_DATABASE.some(
      (p) => (p.name || p.commonName || '').trim().toLowerCase() === q
    );
  }, [name]);

  // Smart duplicate detection
  const duplicateInstances = useMemo(() => {
    if (!name.trim()) return [];
    return existingPlants.filter(
      (p) => p.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  }, [name, existingPlants]);

  if (!isOpen) return null;

  const roomOptions = [
    'Living Room',
    'Bedroom',
    'Balcony',
    'Kitchen',
    'Kitchen Window',
    'Sunny Balcony',
    'Outdoor / Patio',
    'Bathroom',
    'Office',
    'Other'
  ];

  const sunlightOptions = [
    {
      value: 'low',
      label: 'Low / Shade',
      desc: 'Ambient light, away from direct windows'
    },
    {
      value: 'medium',
      label: 'Medium / Indirect',
      desc: 'Bright filtered sunlight or gentle morning sun'
    },
    {
      value: 'high',
      label: 'Direct Sun',
      desc: 'Thrives in direct sunshine on a bright sill'
    }
  ];

  const quickIntervals = [3, 5, 7, 10, 14, 21];

  const mapLightToLevel = (lightStr) => {
    if (!lightStr) return 'medium';
    if (lightStr.includes('Low')) return 'low';
    if (lightStr.includes('Full') || lightStr.includes('Direct') || lightStr.includes('Bright')) return 'high';
    return 'medium';
  };

  // Selecting a plant preset from the catalog
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    const chosenName = preset.name || preset.commonName;
    setName(chosenName);
    setNameError(false);
    setSubtitle(preset.botanicalName || preset.alternateNames || '');
    setWaterIntervalDays(preset.waterFrequencyDays || preset.waterDays || preset.wateringDays || 7);
    setSunlightLevel(mapLightToLevel(preset.light || preset.lightLevel));
    setCareTips(preset.notes || preset.noviceTip || '');
    setCategory(preset.category || 'foliage');

    // Populate catalog stock image if verified or leave empty for CategoryAvatar
    const stockImg = preset.imageUrl || preset.image || '';
    setDefaultImageUrl(stockImg);
    if (stockImg) {
      setImageUrl(stockImg);
      setVisualMode('preset');
    } else {
      setImageUrl('');
      setVisualMode('category');
    }
    setIsCustomPhoto(false);
    setImgPreviewError(false);
    setIsComboboxOpen(false);
    setIsComboboxFocused(false);

    // Smart duplicate recommendation on selection
    const duplicates = existingPlants.filter(
      (p) => (p.name || '').toLowerCase().trim() === chosenName.toLowerCase().trim()
    );
    if (duplicates.length > 0) {
      setNickname(`${chosenName} #${duplicates.length + 1}`);
    } else {
      setNickname('');
    }

    if (preset.defaultLocation) {
      if (roomOptions.includes(preset.defaultLocation)) {
        setRoomPreset(preset.defaultLocation);
        setCustomRoom('');
      } else {
        setRoomPreset('Other');
        setCustomRoom(preset.defaultLocation);
      }
    }
  };

  // Selecting custom plant from combobox option
  const handleSelectCustom = (customName) => {
    const trimmed = (customName || name).trim();
    setName(trimmed);
    setSelectedPresetId(null);
    setSubtitle('Custom Plant');
    setDefaultImageUrl('');
    setImageUrl('');
    setCustomImageUrl('');
    setVisualMode('category');
    setIsCustomPhoto(false);
    setNameError(false);
    setIsComboboxOpen(false);
    setIsComboboxFocused(false);
  };

  // Reset to empty custom plant
  const handleClearToCustom = () => {
    setSelectedPresetId(null);
    setName('');
    setNameError(false);
    setNickname('');
    setSubtitle('');
    setWaterIntervalDays(7);
    setSunlightLevel('medium');
    setCareTips('');
    setCategory('foliage');
    setSelectedCategoryFilter('all');
    setImageUrl('');
    setDefaultImageUrl('');
    setCustomImageUrl('');
    setVisualMode('category');
    setIsCustomPhoto(false);
    setImgPreviewError(false);
    setIsComboboxOpen(true);
    setIsComboboxFocused(true);
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  // Step 1 -> Step 2 validation
  const handleProceedToStep2 = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    // If not a preset and no image set yet, assign default fallback
    if (!selectedPresetId && !imageUrl) {
      setDefaultImageUrl('');
      setVisualMode('category');
    }
    setNameError(false);
    setIsComboboxOpen(false);
    setIsComboboxFocused(false);
    setCurrentStep(2);
  };

  // Step 2 -> Step 3 transition
  const handleProceedToStep3 = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep(3);
  };

  // Handle custom photo upload & compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedBase64 = await compressImageFile(file, 600, 600, 0.70);
      setImageUrl(compressedBase64);
      setCustomImageUrl(compressedBase64);
      setVisualMode('custom');
      setIsCustomPhoto(true);
      setImgPreviewError(false);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert(err.message || 'Could not process the selected image. Please try another image.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // STRICT: Only save when on Step 3
    if (currentStep === 1) {
      handleProceedToStep2(e);
      return;
    }
    if (currentStep === 2) {
      handleProceedToStep3(e);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setCurrentStep(1);
      setNameError(true);
      return;
    }

    const interval = Math.max(1, Number(waterIntervalDays) || 1);

    const finalLocation =
      roomPreset === 'Other' && customRoom.trim()
        ? customRoom.trim()
        : roomPreset;

    const sunlightObj = sunlightOptions.find((s) => s.value === sunlightLevel);

    onAdd({
      name: trimmedName,
      nickname: nickname.trim() || null,
      subtitle: subtitle || (roomPreset === 'Other' ? 'Custom Plant' : `${roomPreset} Plant`),
      location: finalLocation || 'Living Room',
      waterIntervalDays: interval,
      lastWateredDate: lastWateredDate || getTodayStr(),
      sunlightLevel,
      sunlightLabel: sunlightObj ? sunlightObj.label : 'Medium / Indirect',
      waterAmount: interval <= 5 ? 'high' : interval <= 9 ? 'medium' : 'low',
      waterAmountLabel:
        interval <= 5
          ? 'Frequent Water'
          : interval <= 9
          ? 'Regular Water'
          : 'Low / Dry Between',
      careTips: careTips.trim() || 'Check soil moisture before watering.',
      category: category || 'foliage',
      imageUrl: imageUrl ? imageUrl.trim() || null : null
    });

    handleClearToCustom();
    setCurrentStep(1);
    onClose();
  };

  // Explicit exit handler with confirmation safeguard if user has entered data
  const handleExplicitClose = () => {
    const hasEdits = currentStep > 1 || name.trim() || nickname.trim();
    if (hasEdits) {
      if (!window.confirm("Discard unsaved changes?")) {
        return;
      }
    }
    handleClearToCustom();
    setCurrentStep(1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in w-full max-w-full overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-plant-title"
    >
      <div className="relative w-full max-w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-plant-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Add New Plant
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                Step {currentStep} of 3: {currentStep === 1 ? 'Plant Identity' : currentStep === 2 ? 'Care & Schedule' : 'Plant Photo & Save'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExplicitClose}
            aria-label="Close dialog"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Step Progress Header (3 Steps) */}
        <div className="px-4 py-2 sm:px-6 bg-zinc-50/50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 1
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : currentStep > 1
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 1
                    ? 'bg-white text-emerald-700'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span className="truncate">1. Identity</span>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setNameError(true);
                  return;
                }
                setCurrentStep(2);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 2
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : currentStep > 2
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 2
                    ? 'bg-white text-emerald-700'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span className="truncate">2. Care</span>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setNameError(true);
                  return;
                }
                setCurrentStep(3);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 3
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 3
                    ? 'bg-white text-emerald-700'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                3
              </span>
              <span className="truncate">3. Photo</span>
            </button>
          </div>
        </div>

        {/* Scrollable Wizard Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
          <form
            id="add-plant-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 1) {
                handleProceedToStep2(e);
              } else if (currentStep === 2) {
                handleProceedToStep3(e);
              } else {
                handleSubmit(e);
              }
            }}
          >
            {/* ========================================================= */}
            {/* STEP 1: PLANT IDENTITY ONLY (SMART COMBOBOX & LOCATION)   */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                {/* Unified Smart "Search & Create" Combobox */}
                <div ref={comboboxRef} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Plant Name or Variety <span className="text-rose-500">*</span>
                    </label>
                    {selectedPresetId && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Preset loaded</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleClearToCustom}
                          className="text-[10px] font-semibold text-zinc-500 hover:text-emerald-600 underline"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Category Filter Pills (Horizontal scroll, zero-vertical bloat) */}
                  <div
                    className="w-full max-w-full min-w-0 flex items-center gap-1.5 overflow-x-auto py-1 mb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                  >
                    {CATEGORY_PILLS.map((cat) => {
                      const isSelected = selectedCategoryFilter === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter(cat.id);
                            setIsComboboxOpen(true);
                          }}
                          className={`whitespace-nowrap flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input field with embedded search icon and clear button */}
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 pointer-events-none text-zinc-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="Search preset plants or type a custom name..."
                      value={name}
                      onFocus={() => {
                        setIsComboboxOpen(true);
                        setIsComboboxFocused(true);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setName(val);
                        setIsComboboxOpen(true);
                        if (selectedPresetId) {
                          const currentPreset = PLANT_DATABASE.find((p) => p.id === selectedPresetId);
                          if (currentPreset && (currentPreset.name || currentPreset.commonName) !== val) {
                            setSelectedPresetId(null);
                          }
                        }
                        if (nameError && val.trim()) {
                          setNameError(false);
                        }
                      }}
                      className={`w-full pl-10 pr-9 py-2.5 rounded-xl border bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm transition ${
                        nameError
                          ? 'border-rose-400 ring-2 ring-rose-400 bg-rose-50/20'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    />
                    {name && (
                      <button
                        type="button"
                        onClick={handleClearToCustom}
                        aria-label="Clear plant name"
                        className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {nameError && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">
                      Please enter or choose a plant name to proceed.
                    </p>
                  )}

                  {/* Floating Suggestions Dropdown */}
                  {isComboboxOpen && (name.trim().length > 0 || isComboboxFocused) && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-zinc-700/90 p-2 z-30 max-h-64 overflow-y-auto space-y-1 animate-fade-in overscroll-contain">
                      {name.trim().length === 0 && (
                        <div className="px-2 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          {selectedCategoryFilter === 'all'
                            ? 'Popular Plants'
                            : `${CATEGORY_PILLS.find((c) => c.id === selectedCategoryFilter)?.label || 'Category'} Plants`}
                        </div>
                      )}

                      {/* Matching Preset Rows (Up to 8) */}
                      {matchingPresets.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        const pName = preset.name || preset.commonName;
                        const pSub = preset.scientificName || preset.botanicalName || preset.alternateNames || '';
                        const pImg = preset.imageUrl || preset.image;

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between gap-2.5 group ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-800'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {/* 32x32 Rounded Thumbnail with Category Avatar Fallback */}
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center">
                                {pImg && !rowImgErrors[preset.id] ? (
                                  <img
                                    src={pImg}
                                    alt={pName}
                                    onError={() => setRowImgErrors((prev) => ({ ...prev, [preset.id]: true }))}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <CategoryAvatar category={preset.category} iconClassName="w-4 h-4" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold truncate leading-tight group-hover:text-emerald-600 transition-colors">
                                  {pName}
                                </p>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate leading-tight mt-0.5">
                                  {pSub}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 group-hover:border-emerald-300'
                              }`}
                            >
                              {isSelected ? 'Selected' : 'Use Preset →'}
                            </span>
                          </button>
                        );
                      })}

                      {/* No Matches Found Prompt */}
                      {matchingPresets.length === 0 && (
                        <div className="p-3 text-center rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 my-1">
                          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            No matching presets found{selectedCategoryFilter !== 'all' ? ' in this category' : ''}. Tap 'Use custom plant' or continue typing your own name.
                          </p>
                        </div>
                      )}

                      {/* Custom Plant Option (Never a zero-results dead end!) */}
                      {name.trim().length > 0 && !hasExactMatch && (
                        <button
                          type="button"
                          onClick={() => handleSelectCustom(name.trim())}
                          className="w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/50 group mt-1"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                              ➕ Use "{name.trim()}" as custom plant
                            </p>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate">
                              Configure your own watering schedule & photo on next steps
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                            Select →
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Duplicate Variety Alert */}
                {duplicateInstances.length > 0 && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <p className="truncate">
                      You have {duplicateInstances.length} {name.trim()} already. Add a unique nickname below!
                    </p>
                  </div>
                )}

                {/* Custom Nickname / Location Tag */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Custom Nickname / Location Tag (optional)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">e.g. Hallway Pot</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hallway Pot, Bookshelf, Master Bed"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm"
                  />
                </div>

                {/* Room / Location Picker */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Room / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={roomPreset}
                      onChange={(e) => setRoomPreset(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm cursor-pointer"
                    >
                      {roomOptions.map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>

                  {roomPreset === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom location (e.g. Balcony Planter)"
                      value={customRoom}
                      onChange={(e) => setCustomRoom(e.target.value)}
                      className="w-full mt-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs shadow-sm"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: CARE & SCHEDULE ONLY                               */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Plant reference badge */}
                <div className="px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {name} {nickname ? `• ${nickname}` : ''}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                      Location: {roomPreset === 'Other' && customRoom ? customRoom : roomPreset}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                  >
                    Edit Identity
                  </button>
                </div>

                {/* Watering Interval in days with [-] and [+] Stepper Controls */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Watering Frequency <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Water every {waterIntervalDays} {waterIntervalDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setWaterIntervalDays((prev) => Math.max(1, Number(prev) - 1))}
                      disabled={waterIntervalDays <= 1}
                      aria-label="Decrease interval"
                      className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={waterIntervalDays}
                        onChange={(e) => setWaterIntervalDays(Math.max(1, Number(e.target.value)))}
                        className="w-full text-center py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none hidden sm:inline">
                        days
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWaterIntervalDays((prev) => Math.min(90, Number(prev) + 1))}
                      disabled={waterIntervalDays >= 90}
                      aria-label="Increase interval"
                      className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Quick Pick Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-zinc-400 mr-1">Quick pick:</span>
                    {quickIntervals.map((days) => (
                      <button
                        type="button"
                        key={days}
                        onClick={() => setWaterIntervalDays(days)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                          waterIntervalDays === days
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sunlight Requirement Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Sunlight Requirement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {sunlightOptions.map((opt) => {
                      const isSelected = sunlightLevel === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setSunlightLevel(opt.value)}
                          className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[64px] ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400 shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300 bg-zinc-50/30 dark:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-zinc-400'}`} />
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{opt.label}</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Last Watered */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Date Last Watered
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      max={getTodayStr()}
                      value={lastWateredDate}
                      onChange={(e) => setLastWateredDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Care Notes / Novice Tip Field */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Care Notes & Novice Tips (Optional)</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Sensitive to overwatering; allow soil to dry between waterings."
                    value={careTips}
                    onChange={(e) => setCareTips(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: PHOTO & THREE-TIER VISUAL SELECTION               */}
            {/* ========================================================= */}
            {currentStep === 3 && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Summary card */}
                <div className="p-2.5 sm:p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {name} {nickname ? `• ${nickname}` : ''}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                      {roomPreset === 'Other' && customRoom ? customRoom : roomPreset} • Water every {waterIntervalDays} days
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                    Step 3: Visual Style
                  </span>
                </div>

                {/* Live Central Preview Card */}
                <div className="bg-zinc-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col items-center text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {/* Live Central Preview Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-200/80 dark:border-zinc-700 shadow-md flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 mb-2.5">
                    {imageUrl && !imgPreviewError && visualMode !== 'category' ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        onError={() => setImgPreviewError(true)}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CategoryAvatar
                        category={category}
                        iconClassName="w-10 h-10 mb-1"
                        label={imgPreviewError ? 'Image Error' : (name || 'New Plant')}
                      />
                    )}

                    {isCompressing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-medium p-1">
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-1" />
                        <span>Compressing</span>
                      </div>
                    )}

                    {/* Active Visual Mode Pill */}
                    <span className="absolute bottom-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs shadow-xs">
                      {visualMode === 'preset'
                        ? '🖼️ Preset Photo'
                        : visualMode === 'category'
                        ? '🌿 Category SVG'
                        : '📷 Custom Photo'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-2.5">
                    Choose how this plant appears on your dashboard:
                  </p>

                  {/* Three Distinct Option Tabs/Buttons */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    {/* Option A: Preset Photo */}
                    <button
                      type="button"
                      disabled={!defaultImageUrl}
                      onClick={() => {
                        if (!defaultImageUrl) return;
                        setVisualMode('preset');
                        setImageUrl(defaultImageUrl);
                        setIsCustomPhoto(false);
                        setImgPreviewError(false);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'preset'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : !defaultImageUrl
                          ? 'opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 cursor-not-allowed'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">🖼️</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Preset Photo</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {defaultImageUrl ? 'Catalogue' : 'Unavailable'}
                      </span>
                    </button>

                    {/* Option B: Category Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        setVisualMode('category');
                        setImageUrl('');
                        setIsCustomPhoto(false);
                        setImgPreviewError(false);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'category'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">🌿</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Category Icon</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Stylized SVG
                      </span>
                    </button>

                    {/* Option C: Take Photo / Upload */}
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => {
                        if (visualMode === 'custom' && customImageUrl) {
                          fileInputRef.current?.click();
                        } else if (customImageUrl) {
                          setVisualMode('custom');
                          setImageUrl(customImageUrl);
                          setIsCustomPhoto(true);
                          setImgPreviewError(false);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'custom'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">📷</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">
                        {visualMode === 'custom' && customImageUrl ? 'Replace Photo' : 'Take / Upload'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Camera / File
                      </span>
                    </button>
                  </div>

                  {/* Helper text & optional URL input */}
                  <div className="w-full max-w-md mt-2 flex flex-col items-center">
                    {!showUrlInput ? (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline font-normal py-0.5"
                      >
                        Or paste web image link
                      </button>
                    ) : (
                      <div className="w-full flex items-center gap-1.5 pt-1 animate-fade-in">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={imageUrl && !imageUrl.startsWith('data:image/') ? imageUrl : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImageUrl(val);
                            setVisualMode('custom');
                            setIsCustomPhoto(true);
                            setImgPreviewError(false);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="p-1 text-zinc-400 hover:text-zinc-600 text-xs rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Wizard Footer Navigation (Strict type="button" for all except final Save) */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={handleExplicitClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToStep2}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <span>Next: Care Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : currentStep === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <span>Next: Photo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                form="add-plant-form"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Plant</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


  
function EditPlantModal({ isOpen, plant, onClose, onSave }) {
  if (!isOpen || !plant) return null;

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  // 3-Step Wizard: 1 = Identity, 2 = Care & Schedule, 3 = Photo & Save
  const [currentStep, setCurrentStep] = useState(1);
  const [nameError, setNameError] = useState(false);

  const [name, setName] = useState(plant.name || '');
  const [nickname, setNickname] = useState(plant.nickname || '');
  const [subtitle, setSubtitle] = useState(plant.subtitle || '');
  const [roomPreset, setRoomPreset] = useState(plant.location || 'Living Room');
  const [customRoom, setCustomRoom] = useState('');
  const [waterIntervalDays, setWaterIntervalDays] = useState(plant.waterIntervalDays || 7);
  const [sunlightLevel, setSunlightLevel] = useState(plant.sunlightLevel || 'medium');
  const [lastWateredDate, setLastWateredDate] = useState(plant.lastWateredDate || '');
  const [careTips, setCareTips] = useState(plant.careTips || '');

  // Look up catalog default image if matching plant exists in database
  const stockPreset = useMemo(() => {
    if (!plant || !plant.name) return null;
    return PLANT_DATABASE.find(
      (p) => (p.commonName || p.name || '').toLowerCase().trim() === plant.name.toLowerCase().trim()
    );
  }, [plant]);

  const defaultImageUrl = stockPreset ? (stockPreset.imageUrl || stockPreset.image || '') : '';
  const initialCategory = plant.category || stockPreset?.category || 'foliage';
  const [category, setCategory] = useState(initialCategory);

  // Three-Tier Visual System State ('preset' | 'category' | 'custom')
  const [visualMode, setVisualMode] = useState(() => {
    if (!plant.imageUrl) return 'category';
    if (defaultImageUrl && plant.imageUrl === defaultImageUrl) return 'preset';
    return 'custom';
  });
  const [imageUrl, setImageUrl] = useState(plant.imageUrl || '');
  const [customImageUrl, setCustomImageUrl] = useState(() => {
    if (plant.imageUrl && plant.imageUrl !== defaultImageUrl) return plant.imageUrl;
    return '';
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const roomOptions = [
    'Living Room',
    'Bedroom',
    'Balcony',
    'Kitchen',
    'Kitchen Window',
    'Sunny Balcony',
    'Outdoor / Patio',
    'Bathroom',
    'Office',
    'Other'
  ];

  // Initialize room dropdown vs custom room and reset states
  useEffect(() => {
    if (plant) {
      setCurrentStep(1);
      setNameError(false);
      setName(plant.name || '');
      setNickname(plant.nickname || '');
      setSubtitle(plant.subtitle || '');
      setWaterIntervalDays(plant.waterIntervalDays || 7);
      setSunlightLevel(plant.sunlightLevel || 'medium');
      setLastWateredDate(plant.lastWateredDate || '');
      setCareTips(plant.careTips || '');
      setCategory(plant.category || stockPreset?.category || 'foliage');
      setImageUrl(plant.imageUrl || '');
      setImgPreviewError(false);
      setIsCompressing(false);

      if (!plant.imageUrl) {
        setVisualMode('category');
      } else if (defaultImageUrl && plant.imageUrl === defaultImageUrl) {
        setVisualMode('preset');
      } else {
        setVisualMode('custom');
        setCustomImageUrl(plant.imageUrl);
      }

      if (roomOptions.includes(plant.location)) {
        setRoomPreset(plant.location);
        setCustomRoom('');
      } else {
        setRoomPreset('Other');
        setCustomRoom(plant.location || '');
      }
    }
  }, [plant, defaultImageUrl]);

  // Handle explicit exit with confirmation safeguard if edits exist
  const handleExplicitClose = () => {
    const hasEdits =
      currentStep > 1 ||
      (plant && (
        name.trim() !== (plant.name || '').trim() ||
        nickname.trim() !== (plant.nickname || '').trim() ||
        waterIntervalDays !== (plant.waterIntervalDays || 7) ||
        sunlightLevel !== (plant.sunlightLevel || 'medium') ||
        imageUrl !== (plant.imageUrl || '')
      ));
    if (hasEdits) {
      if (!window.confirm("Discard unsaved changes?")) {
        return;
      }
    }
    setCurrentStep(1);
    onClose();
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleExplicitClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, name, nickname, waterIntervalDays, sunlightLevel, imageUrl, plant]);

  const sunlightOptions = [
    {
      value: 'low',
      label: 'Low / Shade',
      desc: 'Ambient light, away from direct windows'
    },
    {
      value: 'medium',
      label: 'Medium / Indirect',
      desc: 'Bright filtered sunlight or gentle morning sun'
    },
    {
      value: 'high',
      label: 'Direct Sun',
      desc: 'Thrives in direct sunshine on a bright sill'
    }
  ];

  const quickIntervals = [3, 5, 7, 10, 14, 21];

  // Step 1 -> Step 2 validation
  const handleProceedToStep2 = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(true);
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }
    setNameError(false);
    setCurrentStep(2);
  };

  // Step 2 -> Step 3 transition
  const handleProceedToStep3 = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep(3);
  };

  // Handle custom photo upload & client-side compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressedBase64 = await compressImageFile(file, 600, 600, 0.70);
      setImageUrl(compressedBase64);
      setCustomImageUrl(compressedBase64);
      setVisualMode('custom');
      setImgPreviewError(false);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert(err.message || 'Could not process the selected image.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // STRICT: Only save when on Step 3
    if (currentStep === 1) {
      handleProceedToStep2(e);
      return;
    }
    if (currentStep === 2) {
      handleProceedToStep3(e);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setCurrentStep(1);
      setNameError(true);
      return;
    }

    const interval = Math.max(1, Number(waterIntervalDays) || 1);

    const finalLocation =
      roomPreset === 'Other' && customRoom.trim()
        ? customRoom.trim()
        : roomPreset;

    const sunlightObj = sunlightOptions.find((s) => s.value === sunlightLevel);

    onSave({
      ...plant,
      name: trimmedName,
      nickname: nickname.trim() || null,
      subtitle: subtitle.trim() || plant.subtitle,
      location: finalLocation || 'Living Room',
      waterIntervalDays: interval,
      lastWateredDate: lastWateredDate || plant.lastWateredDate,
      sunlightLevel,
      sunlightLabel: sunlightObj ? sunlightObj.label : 'Medium / Indirect',
      careTips: careTips.trim() || 'Check soil moisture before watering.',
      category: category || plant.category || 'foliage',
      imageUrl: imageUrl ? imageUrl.trim() || null : null
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in w-full max-w-full overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-plant-title"
    >
      <div className="relative w-full max-w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-plant-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Edit {plant.name || 'Plant'}
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                Step {currentStep} of 3: {currentStep === 1 ? 'Plant Identity' : currentStep === 2 ? 'Care & Schedule' : 'Plant Photo & Save'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExplicitClose}
            aria-label="Close dialog"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Step Progress Header (3 Steps) */}
        <div className="px-4 py-2 sm:px-6 bg-zinc-50/50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 1
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : currentStep > 1
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 1
                    ? 'bg-white text-emerald-700'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                {currentStep > 1 ? '✓' : '1'}
              </span>
              <span className="truncate">1. Identity</span>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setNameError(true);
                  return;
                }
                setCurrentStep(2);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 2
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : currentStep > 2
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 2
                    ? 'bg-white text-emerald-700'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                {currentStep > 2 ? '✓' : '2'}
              </span>
              <span className="truncate">2. Care</span>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  setNameError(true);
                  return;
                }
                setCurrentStep(3);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold transition truncate ${
                currentStep === 3
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                  currentStep === 3
                    ? 'bg-white text-emerald-700'
                    : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600'
                }`}
              >
                3
              </span>
              <span className="truncate">3. Photo</span>
            </button>
          </div>
        </div>

        {/* Scrollable Wizard Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
          <form
            id="edit-plant-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 1) {
                handleProceedToStep2(e);
              } else if (currentStep === 2) {
                handleProceedToStep3(e);
              } else {
                handleSubmit(e);
              }
            }}
          >
            {/* ========================================================= */}
            {/* STEP 1: PLANT IDENTITY ONLY (COMPACT & FOCUSED)            */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <div className="space-y-3.5 animate-fade-in">
                {/* 2-Column: Variety Name & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Plant Variety / Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      placeholder="e.g. Peace Lily, Snake Plant"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError && e.target.value.trim()) {
                          setNameError(false);
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium ${
                        nameError
                          ? 'border-rose-400 ring-2 ring-rose-400 bg-rose-50/30'
                          : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    />
                    {nameError && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1">
                        Please enter a plant name to proceed.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Variety / Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Swiss Cheese Plant"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* 2-Column: Nickname & Room */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Custom Nickname (Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Living Room Bookshelf"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Room / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                      <select
                        value={roomPreset}
                        onChange={(e) => setRoomPreset(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm cursor-pointer"
                      >
                        {roomOptions.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                      </select>
                    </div>

                    {roomPreset === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter custom room"
                        value={customRoom}
                        onChange={(e) => setCustomRoom(e.target.value)}
                        className="w-full mt-2 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 2: CARE & SCHEDULE ONLY                               */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Summary header */}
                <div className="px-3 py-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {name} {nickname ? `• ${nickname}` : ''}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                      Location: {roomPreset === 'Other' && customRoom ? customRoom : roomPreset}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                  >
                    Edit Identity
                  </button>
                </div>

                {/* Watering Interval in days with [-] and [+] Stepper Controls */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Watering Frequency <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Water every {waterIntervalDays} {waterIntervalDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setWaterIntervalDays((prev) => Math.max(1, Number(prev) - 1))}
                      disabled={waterIntervalDays <= 1}
                      aria-label="Decrease interval"
                      className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <Minus className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="90"
                        required
                        value={waterIntervalDays}
                        onChange={(e) => setWaterIntervalDays(Math.max(1, Number(e.target.value)))}
                        className="w-full text-center py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-medium pointer-events-none hidden sm:inline">
                        days
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWaterIntervalDays((prev) => Math.min(90, Number(prev) + 1))}
                      disabled={waterIntervalDays >= 90}
                      aria-label="Increase interval"
                      className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Quick Pick Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-zinc-400 mr-1">Quick pick:</span>
                    {quickIntervals.map((days) => (
                      <button
                        type="button"
                        key={days}
                        onClick={() => setWaterIntervalDays(days)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition ${
                          waterIntervalDays === days
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sunlight Requirement Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Sunlight Requirement
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {sunlightOptions.map((opt) => {
                      const isSelected = sunlightLevel === opt.value;
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => setSunlightLevel(opt.value)}
                          className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[64px] ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400 shadow-sm'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300 bg-zinc-50/30 dark:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <Sun className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-500' : 'text-zinc-400'}`} />
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{opt.label}</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight truncate">
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Last Watered (Manual Correction) */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Date Last Watered (Manual Correction)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="date"
                      value={lastWateredDate}
                      onChange={(e) => setLastWateredDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Personal Notes / Care Tips */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Personal Notes & Care Tips</span>
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Moved away from winter heater; water thoroughly."
                    value={careTips}
                    onChange={(e) => setCareTips(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STEP 3: PHOTO & THREE-TIER VISUAL SELECTION               */}
            {/* ========================================================= */}
            {currentStep === 3 && (
              <div className="space-y-3.5 animate-fade-in">
                {/* Summary card */}
                <div className="p-2.5 sm:p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {name} {nickname ? `• ${nickname}` : ''}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                      {roomPreset === 'Other' && customRoom ? customRoom : roomPreset} • Water every {waterIntervalDays} days
                    </p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                    Step 3: Visual Style
                  </span>
                </div>

                {/* Live Central Preview Card */}
                <div className="bg-zinc-50/80 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col items-center text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {/* Live Central Preview Avatar */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-emerald-200/80 dark:border-zinc-700 shadow-md flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 mb-2.5">
                    {imageUrl && !imgPreviewError && visualMode !== 'category' ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        onError={() => setImgPreviewError(true)}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CategoryAvatar
                        category={category || plant.category}
                        iconClassName="w-10 h-10 mb-1"
                        label={imgPreviewError ? 'Image Error' : (name || plant.name)}
                      />
                    )}

                    {isCompressing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-medium p-1">
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-1" />
                        <span>Compressing</span>
                      </div>
                    )}

                    {/* Active Visual Mode Pill */}
                    <span className="absolute bottom-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs shadow-xs">
                      {visualMode === 'preset'
                        ? '🖼️ Preset Photo'
                        : visualMode === 'category'
                        ? '🌿 Category SVG'
                        : '📷 Custom Photo'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mb-2.5">
                    Choose how this plant appears on your dashboard:
                  </p>

                  {/* Three Distinct Option Tabs/Buttons */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    {/* Option A: Preset Photo */}
                    <button
                      type="button"
                      disabled={!defaultImageUrl}
                      onClick={() => {
                        if (!defaultImageUrl) return;
                        setVisualMode('preset');
                        setImageUrl(defaultImageUrl);
                        setImgPreviewError(false);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'preset'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : !defaultImageUrl
                          ? 'opacity-40 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 text-zinc-400 cursor-not-allowed'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">🖼️</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Preset Photo</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        {defaultImageUrl ? 'Catalogue' : 'Unavailable'}
                      </span>
                    </button>

                    {/* Option B: Category Icon */}
                    <button
                      type="button"
                      onClick={() => {
                        setVisualMode('category');
                        setImageUrl('');
                        setImgPreviewError(false);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'category'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">🌿</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">Category Icon</span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Stylized SVG
                      </span>
                    </button>

                    {/* Option C: Take Photo / Upload */}
                    <button
                      type="button"
                      disabled={isCompressing}
                      onClick={() => {
                        if (visualMode === 'custom' && customImageUrl) {
                          fileInputRef.current?.click();
                        } else if (customImageUrl) {
                          setVisualMode('custom');
                          setImageUrl(customImageUrl);
                          setImgPreviewError(false);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        visualMode === 'custom'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 hover:border-zinc-300 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-base mb-0.5">📷</span>
                      <span className="text-[11px] sm:text-xs font-bold leading-tight">
                        {visualMode === 'custom' && customImageUrl ? 'Replace Photo' : 'Take / Upload'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Camera / File
                      </span>
                    </button>
                  </div>

                  {/* Helper text & optional URL input */}
                  <div className="w-full max-w-md mt-2 flex flex-col items-center">
                    {!showUrlInput ? (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 underline font-normal py-0.5"
                      >
                        Or paste web image link
                      </button>
                    ) : (
                      <div className="w-full flex items-center gap-1.5 pt-1 animate-fade-in">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={imageUrl && !imageUrl.startsWith('data:image/') ? imageUrl : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setImageUrl(val);
                            setVisualMode('custom');
                            setImgPreviewError(false);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="p-1 text-zinc-400 hover:text-zinc-600 text-xs rounded-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Wizard Footer Navigation (Strict type="button" for all except final Save) */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          {currentStep === 1 ? (
            <>
              <button
                type="button"
                onClick={handleExplicitClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToStep2}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <span>Next: Care Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : currentStep === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <span>Next: Photo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                form="edit-plant-form"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition ml-auto"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


  
function QuickHelpModal({ isOpen, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in w-full max-w-full overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-help-title"
    >
      <div className="relative w-full max-w-full md:max-w-xl bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quick-help-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                Help & Quick Guide
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                KeepGreen User Manual & Reference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close guide"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Guide Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          {/* Welcome Intro Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-zinc-800/40 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
            <h3 className="text-sm sm:text-base font-extrabold text-emerald-900 dark:text-emerald-200">
              Welcome to KeepGreen
            </h3>
            <p className="text-xs font-semibold text-emerald-800/80 dark:text-emerald-300/80">
              Smart Watering & Plant Care Assistant.
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              KeepGreen helps you track, water, and care for your indoor and outdoor plants with a clean, mobile-first interface saved directly to your device.
            </p>
          </div>

          {/* Section 1: Adding & Editing Plants */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                <Sprout className="w-4 h-4" />
              </span>
              <span>1. Adding & Editing Plants (3-Step Micro-Wizard)</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Tap <strong className="text-zinc-900 dark:text-zinc-100">"+ Add Plant"</strong> (or tap any existing plant card to edit). The zero-scroll wizard walks you through three simple steps:
            </p>
            <ul className="space-y-2 pl-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">Step 1: Identity</strong> — Search our extensive preset catalogue to autofill common names, scientific names, and typical care profiles, or enter your own custom plant name. You can add an optional Nickname. Select the location.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">Step 2: Care & Schedule</strong> — Set your watering frequency (in days), light exposure (e.g., Low, Medium, Bright Indirect, Direct), and custom care notes. If you selected a preset catalogue plant, KeepGreen sets recommended settings automatically. You can change these at any time. KeepGreen computes your next watering date.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">Step 3: Photo & Save</strong> — If a catalogue plant was selected, you can accept the image or upload/snap a photo of your actual plant, then hit Save to update your garden.
                </div>
              </li>
            </ul>
          </div>

          {/* Section 2: Dashboard Views */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg">
                <LayoutGrid className="w-4 h-4" />
              </span>
              <span>2. Dashboard Views</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Switch between three display formats depending on your screen size and preference:
            </p>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Full View</strong> — Rich visual cards featuring large photos, quick water countdowns, sunlight badges, location tags, and instant action buttons.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Compact View</strong> — Space-saving grid displaying essential info and status badges for browsing larger collections quickly.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">List View</strong> — Dense, row-based layout ideal for rapid morning checks and high-density tracking.
              </li>
            </ul>
          </div>

          {/* Section 3: Sorting & Organization */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg">
                <ArrowUpDown className="w-4 h-4" />
              </span>
              <span>3. Sorting & Organization</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Use the <strong className="text-zinc-800 dark:text-zinc-200">Sort</strong> selector on your dashboard to arrange your collection by:
            </p>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Urgency</strong> — Puts plants needing water first (Overdue and Due Today at the top).
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">A–Z / Z–A</strong> — Alphabetical order by plant name.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Newest</strong> — Recently added plants appear first.
              </li>
              <li>
                <strong className="text-zinc-800 dark:text-zinc-200">Water Frequency</strong> — Groups your thirstiest plants together.
              </li>
            </ul>
          </div>

          {/* Section 4: Quick Watering Actions */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-lg">
                <Droplet className="w-4 h-4 fill-current" />
              </span>
              <span>4. Quick Watering Actions</span>
            </div>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                Tap <strong className="text-zinc-800 dark:text-zinc-200">💧 Today</strong> on any plant card to instantly mark it as watered today and recalculate its schedule.
              </li>
              <li>
                Tap <strong className="text-zinc-800 dark:text-zinc-200">📅 Pick Date</strong> to log a past watering date directly via the calendar without entering the edit wizard.
              </li>
              <li>
                Need an extra day or two? Use the <strong className="text-zinc-800 dark:text-zinc-200">Snooze</strong> option (where available) to push back the schedule without losing your cadence.
              </li>
            </ul>
          </div>

          {/* Section 5: Feedback & Support */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </span>
              <span>5. Feedback & Support</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Have an idea, bug report, or plant request?
            </p>
            <ul className="space-y-1.5 pl-2 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li>
                Tap the <strong className="text-zinc-800 dark:text-zinc-200">Feedback (speech bubble)</strong> icon in the top header.
              </li>
              <li>
                Your submission is securely routed via our cloud webhook with an anonymous device identifier (no personal logins or account details required).
              </li>
              <li>
                Prefer direct chat? You can also export your feedback or query straight to <strong className="text-zinc-800 dark:text-zinc-200">WhatsApp</strong>.
              </li>
            </ul>
          </div>

          {/* About the Developer Block */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
              <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </span>
              <span>About the Developer</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Built and maintained by <strong className="text-black font-medium">AK Professional Services</strong>. Feedback, feature suggestions, and testing notes are welcome.
            </p>
          </div>

          {/* Note Banner */}
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400 italic text-center">
            Note: KeepGreen stores all your garden data locally in your browser's localStorage. No accounts or passwords needed.
          </div>
        </div>

        {/* Footer with Green "Got it!" Button & Version Tag */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Got it!</span>
          </button>
          <span className="text-[11px] text-zinc-400 font-medium">
            KeepGreen v0.2 (alpha) • <span className="text-black font-medium">AK Professional Services</span>
          </span>
        </div>
      </div>
    </div>
  );
}


  
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwLp0-Z69a7V9XslyhbNUWKCKhMUU78JLi-k6YjgUSlH6z3K96dYaFm9HAywO3CGIz4/exec';
const APP_VERSION = 'v0.2 (alpha)';

const CATEGORIES = [
  { id: 'General Comment', label: '✨ General Comment' },
  { id: 'Feature Idea', label: '💡 Feature Idea' },
  { id: 'Bug / Issue', label: '🐛 Bug / Issue' }
];

function FeedbackModal({ isOpen, onClose, anonymousId = 'KG-UNKNOWN', plantCount = 0 }) {
  const [category, setCategory] = useState('General Comment');
  const [userName, setUserName] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [commentError, setCommentError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmitSuccess(false);
      setErrorMessage('');
      setCopied(false);
      setCommentError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const getDeviceType = () => {
    if (typeof window === 'undefined') return 'Desktop';
    const isMobileScreen = window.innerWidth < 768;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    return isMobileScreen || isMobileUA ? 'Mobile' : 'Desktop';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!comments.trim()) {
      setCommentError(true);
      return;
    }

    setCommentError(false);
    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      category: category,
      comments: comments.trim(),
      userName: userName.trim() || 'Anonymous',
      anonymousId: anonymousId,
      version: APP_VERSION,
      device: getDeviceType(),
      plantCount: Number(plantCount) || 0
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Google Apps Script redirect resolution with no-cors
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setComments('');

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setIsSubmitting(false);
      setErrorMessage('Failed to send feedback. Please try again or copy for WhatsApp.');
    }
  };

  const handleCopyForWhatsApp = () => {
    const textToCopy = `🌿 *KeepGreen Feedback*
• *Category:* ${category}
• *From:* ${userName.trim() || 'Anonymous'}
• *Metadata:* ${APP_VERSION} • ID: ${anonymousId} • Plants: ${plantCount} (${getDeviceType()})

💬 *Comments:*
${comments.trim() || '(No comments provided)'}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const fallbackCopy = (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Fallback copy failed', err);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-zinc-950/70 backdrop-blur-sm animate-fade-in w-full max-w-full overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
    >
      <div className="relative w-full max-w-full md:max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl md:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] animate-slide-up md:animate-fade-in">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-2 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="feedback-dialog-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  Feedback & Suggestions
                </h2>
                <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
                Report a bug, suggest an idea, or share your thoughts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Success Banner */}
          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3 animate-fade-in">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold text-sm">Thank you!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Your feedback has been sent successfully.</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-2.5 text-xs animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Feedback Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center truncate ${
                    category === cat.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Your Name <span className="font-normal text-zinc-400">(Optional)</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Sarah M."
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Comments Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Comments & Feedback <span className="text-rose-500">*</span>
              </label>
              {commentError && (
                <span className="text-[11px] font-semibold text-rose-500">Please enter your feedback</span>
              )}
            </div>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (commentError && e.target.value.trim()) setCommentError(false);
              }}
              placeholder="Tell us what happened or what you'd like to see..."
              className={`w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border rounded-xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                commentError
                  ? 'border-rose-400 ring-2 ring-rose-300/40'
                  : 'border-zinc-200 dark:border-zinc-700'
              }`}
            />
          </div>

          {/* Metadata Preview Box (Muted, subtle info strip) */}
          <div className="px-3.5 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between flex-wrap gap-1">
            <span>App: <strong className="text-zinc-700 dark:text-zinc-300">{APP_VERSION}</strong></span>
            <span>•</span>
            <span>ID: <code className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">{anonymousId}</code></span>
            <span>•</span>
            <span>Plants: <strong className="text-zinc-700 dark:text-zinc-300">{plantCount}</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className={`w-full py-3 px-4 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                isSubmitting || submitSuccess
                  ? 'bg-emerald-600/70 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/25'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Feedback...</span>
                </>
              ) : submitSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Feedback Sent!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyForWhatsApp}
              className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 transition flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


  
function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Automatically fade out smoothly after exactly 2 seconds (2000ms)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    // Completely unmount/remove overlay after the 500ms fade completes (total 2550ms)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2550);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden={isFading}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center bg-emerald-950 text-white p-8 transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer to balance flex-between */}
      <div className="w-full h-8" />

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xs animate-fade-in">
        <div className="p-4 sm:p-5 bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 rounded-3xl shadow-2xl shadow-emerald-900/80 ring-1 ring-emerald-400/20">
          <Sprout className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.75]" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-300 bg-clip-text text-transparent">
            KeepGreen
          </h1>
          <p className="mt-2 text-sm leading-tight text-emerald-200/80 font-medium">
            <span className="block">Smart Watering &amp;</span>
            <span className="block">Plant Care Assistant</span>
          </p>
        </div>
      </div>

      {/* Bottom Content: Minimalist spinner + Attribution */}
      <div className="flex flex-col items-center space-y-3 pb-4">
        {/* Minimalist spinner or subtle pulsing progress indicator */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-xs text-emerald-400/80 font-sans tracking-wide">
          Developed by AK Professional Services
        </p>
      </div>
    </div>
  );
}


  // --- 6. Main App Component ---
  
function App() {
  const { plants, waterPlant, addPlant, updatePlant, deletePlant, resetToPresets } = usePlantStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const anonymousId = useMemo(() => getOrCreateAnonymousId(), []);
  const [editingPlant, setEditingPlant] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'danger' | 'warning' | 'healthy'
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [toast, setToast] = useState(null);

  // View density mode: 'comfortable' | 'compact' | 'list'
  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('plantApp_viewMode');
      if (saved === 'comfortable' || saved === 'compact' || saved === 'list') {
        return saved;
      }
    } catch (e) {}
    return 'comfortable';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('plantApp_viewMode', mode);
    } catch (e) {}
  };

  // Sort criteria: 'urgency' | 'name-asc' | 'name-desc' | 'recent' | 'interval-asc'
  const [sortBy, setSortBy] = useState(() => {
    try {
      const saved = localStorage.getItem('plantApp_sortBy');
      if (
        saved === 'urgency' ||
        saved === 'name-asc' ||
        saved === 'name-desc' ||
        saved === 'recent' ||
        saved === 'interval-asc'
      ) {
        return saved;
      }
    } catch (e) {}
    return 'urgency';
  });

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    try {
      localStorage.setItem('plantApp_sortBy', newSort);
    } catch (e) {}
  };

  // Quick Action Handler with Visual Toast Notification (Supports Today & Custom Past Dates)
  const handleWater = (id, plantName, customDate = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = !customDate || customDate === todayStr;
    waterPlant(id, customDate);
    setToast({
      id: Date.now(),
      type: 'water',
      title: isToday ? 'Watered Today!' : 'Watering Logged',
      message: isToday
        ? `${plantName || 'Plant'} marked as watered. Status is now Healthy.`
        : `${plantName || 'Plant'} marked as watered on ${customDate}.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Add Plant Handler with Toast Confirmation
  const handleAddPlant = (plantData) => {
    addPlant(plantData);
    setToast({
      id: Date.now(),
      type: 'add',
      title: 'Plant Added!',
      message: `Added ${plantData.nickname || plantData.name} to your care schedule.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Edit Plant Handler with Toast Confirmation
  const handleSaveEdit = (updatedPlant) => {
    updatePlant(updatedPlant);
    setToast({
      id: Date.now(),
      type: 'edit',
      title: 'Plant Updated',
      message: `Saved updates for ${updatedPlant.nickname || updatedPlant.name}.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Delete Plant Handler with Toast Confirmation
  const handleDeletePlant = (id, plantName) => {
    deletePlant(id);
    setToast({
      id: Date.now(),
      type: 'delete',
      title: 'Plant Removed',
      message: `Removed ${plantName || 'Plant'} from your garden schedule.`
    });

    setTimeout(() => {
      setToast((curr) => (curr && Date.now() - curr.id >= 3200 ? null : curr));
    }, 3500);
  };

  // Compute status summary metrics
  const stats = useMemo(() => {
    let danger = 0;
    let warning = 0;
    let healthy = 0;

    plants.forEach((plant) => {
      const status = getPlantStatus(plant.lastWateredDate, plant.waterIntervalDays);
      if (status.category === 'danger') danger++;
      else if (status.category === 'warning') warning++;
      else healthy++;
    });

    return { total: plants.length, danger, warning, healthy };
  }, [plants]);

  // Unique list of rooms/locations
  const uniqueRooms = useMemo(() => {
    const rooms = new Set();
    plants.forEach((p) => {
      if (p.location) rooms.add(p.location);
    });
    return Array.from(rooms);
  }, [plants]);

  // Filtered & Sorted Plants
  const filteredPlants = useMemo(() => {
    // 1. Filter by status category and room location
    const result = plants.filter((plant) => {
      const status = getPlantStatus(plant.lastWateredDate, plant.waterIntervalDays);
      if (activeFilter !== 'all' && status.category !== activeFilter) return false;
      if (selectedRoom !== 'all' && plant.location !== selectedRoom) return false;
      return true;
    });

    // 2. Sort by active criteria
    return result.sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'recent') {
        const getTs = (p) => {
          if (p.createdAt && typeof p.createdAt === 'number') return p.createdAt;
          if (typeof p.id === 'string' && p.id.startsWith('plant-')) {
            const ts = parseInt(p.id.split('-')[1], 10);
            if (!isNaN(ts)) return ts;
          }
          return 0;
        };
        const diff = getTs(b) - getTs(a);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      if (sortBy === 'interval-asc') {
        const intA = Number(a.waterIntervalDays) || 0;
        const intB = Number(b.waterIntervalDays) || 0;
        if (intA !== intB) return intA - intB;
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }

      // Default: 'urgency' (Needs Water First)
      // Sorted by calculated next water date (Overdue -> Due Today -> Due Soon -> Recently Watered)
      // Tie-breaker: Alphabetical by plant name
      const statA = getPlantStatus(a.lastWateredDate, a.waterIntervalDays);
      const statB = getPlantStatus(b.lastWateredDate, b.waterIntervalDays);
      if (statA.daysRemaining !== statB.daysRemaining) {
        return statA.daysRemaining - statB.daysRemaining;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [plants, activeFilter, selectedRoom, sortBy]);

  const handleResetPresets = () => {
    if (window.confirm(`Reset all plants back to the ${STARTER_PRESETS.length} beginner starter presets?`)) {
      resetToPresets();
      setToast({
        id: Date.now(),
        type: 'reset',
        title: 'Presets Restored',
        message: `Loaded the ${STARTER_PRESETS.length} beginner domestic starter plants.`
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-emerald-50/50 via-zinc-50 to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans relative">
      {/* Sleek Splash Screen Overlay */}
      <SplashScreen />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full max-w-full overflow-x-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 w-full min-w-0">
          {/* Brand & Identity: Title + Two-Line Tagline with min-w-0 flex-1 */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl sm:rounded-2xl shadow-md shadow-emerald-500/20 shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent whitespace-nowrap leading-tight">
                KeepGreen
              </h1>
              <p className="text-[10px] sm:text-xs leading-tight text-zinc-500 dark:text-zinc-400 font-medium">
                <span className="block truncate">Smart Watering &amp;</span>
                <span className="block truncate">Plant Care Assistant</span>
              </p>
            </div>
          </div>

          {/* Action Button Group: Strictly shrink-0 so buttons are never clipped */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Guide / Help Icon Button */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              title="Help Guide"
              aria-label="Help Guide"
              className="p-2 sm:px-3 sm:py-2 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 transition shadow-sm shrink-0 min-w-[36px] min-h-[36px] justify-center"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline font-semibold">Guide</span>
            </button>

            {/* Feedback & Suggestions Icon Button */}
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              title="Send Feedback"
              aria-label="Send Feedback"
              className="p-2 sm:px-3 sm:py-2 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 transition shadow-sm shrink-0 min-w-[36px] min-h-[36px] justify-center"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline font-semibold">Feedback</span>
            </button>

            {/* Prominent "+ Add Plant" Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/25 transition-all shrink-0 min-h-[36px] whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>Add Plant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 flex-1 w-full max-w-full overflow-x-hidden min-w-0 space-y-4 sm:space-y-6">
        {/* Status Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-full">
          <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl shrink-0">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">Total Plants</p>
              <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">{stats.total}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveFilter(activeFilter === 'danger' ? 'all' : 'danger')}
            className={`p-3 sm:p-4 rounded-2xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all min-w-0 ${
              activeFilter === 'danger'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-400'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-rose-200'
            }`}
          >
            <div className="p-2 sm:p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-xl relative shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              {stats.danger > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider truncate">Needs Water</p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 leading-tight">{stats.danger}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'warning' ? 'all' : 'warning')}
            className={`p-3 sm:p-4 rounded-2xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all min-w-0 ${
              activeFilter === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-amber-200'
            }`}
          >
            <div className="p-2 sm:p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">Due Soon</p>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 leading-tight">{stats.warning}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'healthy' ? 'all' : 'healthy')}
            className={`p-3 sm:p-4 rounded-2xl border text-left flex items-center gap-2.5 sm:gap-3 transition-all min-w-0 ${
              activeFilter === 'healthy'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-400'
                : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-200'
            }`}
          >
            <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">Healthy</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">{stats.healthy}</p>
            </div>
          </button>
        </div>

        {/* Filter Bar, Room Filter & View Mode Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 w-full max-w-full min-w-0">
          {/* Quick status tabs (Locked with overflow scroll, zero push) */}
          <div className="w-full sm:w-auto overflow-x-auto max-w-full min-w-0 pb-1 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl w-max">
              {[
                { id: 'all', label: 'All Plants' },
                { id: 'danger', label: 'Needs Water' },
                { id: 'warning', label: 'Due Soon' },
                { id: 'healthy', label: 'Healthy' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                    activeFilter === tab.id
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap max-w-full min-w-0">
            {/* Room filter dropdown */}
            {uniqueRooms.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                <span className="font-medium">Room:</span>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[130px] sm:max-w-none truncate cursor-pointer"
                >
                  <option value="all">All Rooms ({plants.length})</option>
                  {uniqueRooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Control Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
              <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400">Sort:</span>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 pointer-events-none text-zinc-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  aria-label="Sort plants"
                  className="pl-8 pr-7 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm appearance-none cursor-pointer max-w-[150px] sm:max-w-none truncate"
                >
                  <option value="urgency">Needs Water First</option>
                  <option value="name-asc">Alphabetical (A to Z)</option>
                  <option value="name-desc">Alphabetical (Z to A)</option>
                  <option value="recent">Recently Added</option>
                  <option value="interval-asc">Watering Frequency</option>
                </select>
                <div className="absolute right-2.5 pointer-events-none text-zinc-400 text-[9px]">
                  ▼
                </div>
              </div>
            </div>

            {/* View Mode Segmented Controls */}
            <div
              className="flex items-center p-1 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl shadow-inner shrink-0"
              role="group"
              aria-label="View Density"
            >
              <button
                type="button"
                onClick={() => handleViewModeChange('comfortable')}
                title="Full View (Large Cards)"
                aria-label="Full View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'comfortable'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Full</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('compact')}
                title="Compact View (Dense Cards)"
                aria-label="Compact View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <Grid2X2 className="w-4 h-4" />
                <span className="hidden md:inline">Compact</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                title="List / Rows View"
                aria-label="List View"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plant Cards Grid / List */}
        {filteredPlants.length > 0 ? (
          <div
            className={
              viewMode === 'list'
                ? 'flex flex-col gap-2.5'
                : viewMode === 'compact'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }
          >
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                viewMode={viewMode}
                onWater={handleWater}
                onEdit={(p) => setEditingPlant(p)}
                onDelete={handleDeletePlant}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No plants match this view</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {activeFilter !== 'all'
                  ? `No plants are currently in the "${activeFilter}" status.`
                  : 'Start by adding your first plant or load the preset library.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              {activeFilter !== 'all' ? (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition"
                >
                  View All Plants
                </button>
              ) : (
                <>
                  <button
                    onClick={resetToPresets}
                    className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-xl transition"
                  >
                    Restore {STARTER_PRESETS.length} Starter Presets
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                  >
                    Add Plant
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Beginner Quick Guide Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Novice Care Rule of Thumb:</span>
            <span>When in doubt, stick your finger 1 inch into the soil. If dry, water thoroughly.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 1-2 Days Away
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Water Needed
            </span>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium whitespace-nowrap bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-200/60 dark:border-zinc-700/60">
              v0.2 (alpha)
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[10px] sm:text-xs text-black font-medium whitespace-nowrap">
              AK Professional Services
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="flex items-center gap-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-xl border border-zinc-700/50 dark:border-zinc-200">
            <div className={`p-1.5 rounded-lg ${
              toast.type === 'delete'
                ? 'bg-rose-500/20 text-rose-400 dark:text-rose-600'
                : toast.type === 'edit'
                ? 'bg-amber-500/20 text-amber-400 dark:text-amber-600'
                : toast.type === 'add'
                ? 'bg-teal-500/20 text-teal-400 dark:text-teal-600'
                : 'bg-emerald-500/20 text-emerald-400 dark:text-emerald-600'
            }`}>
              {toast.type === 'delete' ? (
                <Trash2 className="w-4 h-4" />
              ) : toast.type === 'edit' ? (
                <Pencil className="w-4 h-4" />
              ) : toast.type === 'add' ? (
                <Sprout className="w-4 h-4" />
              ) : (
                <Droplet className="w-4 h-4 fill-current" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">{toast.title}</p>
              <p className="text-xs text-zinc-300 dark:text-zinc-600">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-zinc-400 hover:text-white dark:hover:text-zinc-900 rounded-lg ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddPlant}
        existingPlants={plants}
      />

      {/* Edit Plant Modal */}
      <EditPlantModal
        isOpen={Boolean(editingPlant)}
        plant={editingPlant}
        onClose={() => setEditingPlant(null)}
        onSave={handleSaveEdit}
      />

      {/* Quick Help Guide Modal */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Feedback & Suggestions Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        anonymousId={anonymousId}
        plantCount={plants.length}
      />
    </div>
  );
}


  // --- 7. Entry Mount ---
  const rootElement = document.getElementById('root');
  if (rootElement && ReactDOM) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error('Failed to locate #root or ReactDOM');
  }
})();
