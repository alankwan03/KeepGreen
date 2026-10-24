const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../src/data/plantDatabase.js');
const rawCode = fs.readFileSync(dbPath, 'utf8');

// Require existing PLANT_DATABASE
const { PLANT_DATABASE } = require(dbPath);

const newPlants = [
  {
    id: 'db-string-of-hearts',
    name: 'String of Hearts',
    commonName: 'String of Hearts',
    botanicalName: 'Ceropegia woodii',
    alternateNames: 'Rosary Vine / Sweetheart Vine',
    category: 'Succulents & Cacti',
    waterDays: 14,
    wateringDays: 14,
    light: 'Bright / Indirect',
    lightLevel: 'Medium / Indirect',
    defaultLocation: 'Hanging Window',
    notes: 'Delicate heart-shaped patterned foliage; water only when the tuberous soil dries out.',
    noviceTip: 'Delicate heart-shaped patterned foliage; water only when the tuberous soil dries out.',
    image: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-burros-tail',
    name: "Burro's Tail",
    commonName: "Burro's Tail",
    botanicalName: 'Sedum morganianum',
    alternateNames: "Donkey's Tail / Trailing Sedum",
    category: 'Succulents & Cacti',
    waterDays: 14,
    wateringDays: 14,
    light: 'Bright / Full Sun',
    lightLevel: 'Bright / Full Sun',
    defaultLocation: 'Sunny Balcony',
    notes: 'Plump blue-green cascading bean leaves; extremely fragile, so place in a no-bump zone.',
    noviceTip: 'Plump blue-green cascading bean leaves; extremely fragile, so place in a no-bump zone.',
    image: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-zebra-haworthia',
    name: 'Zebra Haworthia',
    commonName: 'Zebra Haworthia',
    botanicalName: 'Haworthiopsis fasciata',
    alternateNames: 'Zebra Plant / Pearl Plant',
    category: 'Succulents & Cacti',
    waterDays: 16,
    wateringDays: 16,
    light: 'Bright / Indirect',
    lightLevel: 'Medium / Indirect',
    defaultLocation: 'Office Desk',
    notes: 'Distinct white horizontal stripes on thick triangular leaves; slow growing and compact.',
    noviceTip: 'Distinct white horizontal stripes on thick triangular leaves; slow growing and compact.',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-fishbone-cactus',
    name: 'Fishbone Cactus',
    commonName: 'Fishbone Cactus',
    botanicalName: 'Disocactus anguliger',
    alternateNames: 'Zigzag Cactus / Ric Rac Orchid Cactus',
    category: 'Succulents & Cacti',
    waterDays: 10,
    wateringDays: 10,
    light: 'Medium / Indirect',
    lightLevel: 'Medium / Indirect',
    defaultLocation: 'Living Room Shelf',
    notes: 'Wavy zigzag trailing stems; being a jungle cactus, it enjoys slightly more humidity than desert cacti.',
    noviceTip: 'Wavy zigzag trailing stems; being a jungle cactus, it enjoys slightly more humidity than desert cacti.',
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-thyme',
    name: 'Common Thyme',
    commonName: 'Common Thyme',
    botanicalName: 'Thymus vulgaris',
    alternateNames: 'English Thyme / Garden Thyme',
    category: 'Herbs & Edibles',
    waterDays: 6,
    wateringDays: 6,
    light: 'Bright / Full Sun',
    lightLevel: 'Bright / Full Sun',
    defaultLocation: 'Kitchen Window',
    notes: 'Woody aromatic culinary herb; water when soil surface feels dry and provide direct light.',
    noviceTip: 'Woody aromatic culinary herb; water when soil surface feels dry and provide direct light.',
    image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-parsley',
    name: 'Flat-Leaf Parsley',
    commonName: 'Flat-Leaf Parsley',
    botanicalName: 'Petroselinum crispum',
    alternateNames: 'Italian Parsley',
    category: 'Herbs & Edibles',
    waterDays: 4,
    wateringDays: 4,
    light: 'Bright / Indirect',
    lightLevel: 'Medium / Indirect',
    defaultLocation: 'Kitchen Sill',
    notes: 'Robust fresh herb; prefers moist, fertile soil and regular snips from the outer stems.',
    noviceTip: 'Robust fresh herb; prefers moist, fertile soil and regular snips from the outer stems.',
    image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-oregano',
    name: 'Greek Oregano',
    commonName: 'Greek Oregano',
    botanicalName: 'Origanum vulgare hirtum',
    alternateNames: 'Wild Marjoram',
    category: 'Herbs & Edibles',
    waterDays: 7,
    wateringDays: 7,
    light: 'Bright / Full Sun',
    lightLevel: 'Bright / Full Sun',
    defaultLocation: 'Balcony Pot',
    notes: 'Intensely fragrant Mediterranean staple; let soil slightly dry between waterings.',
    noviceTip: 'Intensely fragrant Mediterranean staple; let soil slightly dry between waterings.',
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-sage',
    name: 'Culinary Sage',
    commonName: 'Culinary Sage',
    botanicalName: 'Salvia officinalis',
    alternateNames: 'Garden Sage',
    category: 'Herbs & Edibles',
    waterDays: 7,
    wateringDays: 7,
    light: 'Bright / Full Sun',
    lightLevel: 'Bright / Full Sun',
    defaultLocation: 'Sunny Herb Planter',
    notes: 'Velvety grey-green leaves; hates wet roots, so ensure well-draining soil and plenty of sun.',
    noviceTip: 'Velvety grey-green leaves; hates wet roots, so ensure well-draining soil and plenty of sun.',
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-alocasia-polly',
    name: 'Alocasia Polly',
    commonName: 'Alocasia Polly',
    botanicalName: 'Alocasia x amazonica',
    alternateNames: 'African Mask / Elephant Ear',
    category: 'Indoor Foliage',
    waterDays: 7,
    wateringDays: 7,
    light: 'Bright / Indirect',
    lightLevel: 'Medium / Indirect',
    defaultLocation: 'Living Room Table',
    notes: 'Dramatic scalloped arrow leaves with bold silver veins; thrives in warm, humid rooms.',
    noviceTip: 'Dramatic scalloped arrow leaves with bold silver veins; thrives in warm, humid rooms.',
    image: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'db-calathea-rattlesnake',
    name: 'Rattlesnake Plant',
    commonName: 'Rattlesnake Plant',
    botanicalName: 'Goeppertia insignis',
    alternateNames: 'Calathea Lancifolia',
    category: 'Indoor Foliage',
    waterDays: 6,
    wateringDays: 6,
    light: 'Medium / Indirect',
    lightLevel: 'Medium / Indirect',
    defaultLocation: 'Bedroom Shelf',
    notes: 'Wavy elongated leaves with dark green spots and purple undersides; leaves fold up at night.',
    noviceTip: 'Wavy elongated leaves with dark green spots and purple undersides; leaves fold up at night.',
    image: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=80'
  }
];

const processed = PLANT_DATABASE.map(p => {
  let img = p.imageUrl || '';
  if (img.includes('w=800')) {
    img = img.replace('w=800', 'w=400');
  } else if (!img.includes('w=400')) {
    img = img.includes('?') ? `${img}&w=400&q=80` : `${img}?auto=format&fit=crop&w=400&q=80`;
  }

  let botanical = p.alternateNames || '';
  if (botanical.includes('/')) {
    const parts = botanical.split('/');
    botanical = parts[parts.length - 1].trim();
  }

  return {
    id: p.id,
    name: p.commonName,
    commonName: p.commonName,
    botanicalName: botanical || p.commonName,
    alternateNames: p.alternateNames || '',
    category: p.category,
    waterDays: p.wateringDays || 7,
    wateringDays: p.wateringDays || 7,
    light: p.lightLevel || 'Medium / Indirect',
    lightLevel: p.lightLevel || 'Medium / Indirect',
    defaultLocation: p.defaultLocation || 'Living Room',
    notes: p.noviceTip || '',
    noviceTip: p.noviceTip || '',
    image: img,
    imageUrl: img
  };
});

const allPlants = [...processed, ...newPlants];

const outputContent = `/**
 * KeepGreen Comprehensive Plant Reference Database (${allPlants.length} Plants)
 * Unified with standard fields: id, name, botanicalName, category, waterDays, light, notes, image.
 * Uses optimized CDN thumbnail parameters (w=400&q=80) for instant loading.
 */

export const CATEGORY_FALLBACKS = {
  leafy: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80',
  succulent: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
  herb: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=80',
  flowering: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80',
  'Indoor Foliage': 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80',
  'Succulents & Cacti': 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=80',
  'Herbs & Edibles': 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=80',
  'Outdoor & Flowering': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80'
};

export function getCategoryFallback(category) {
  if (!category) return CATEGORY_FALLBACKS.leafy;
  const cat = String(category).toLowerCase();
  if (cat.includes('succulent') || cat.includes('cacti') || cat.includes('cactus')) return CATEGORY_FALLBACKS.succulent;
  if (cat.includes('herb') || cat.includes('edible') || cat.includes('vegetable')) return CATEGORY_FALLBACKS.herb;
  if (cat.includes('flowering') || cat.includes('outdoor') || cat.includes('flower') || cat.includes('bloom')) return CATEGORY_FALLBACKS.flowering;
  return CATEGORY_FALLBACKS.leafy;
}

export const PLANT_DATABASE = ${JSON.stringify(allPlants, null, 2)};
`;

fs.writeFileSync(dbPath, outputContent, 'utf8');
console.log('Successfully wrote', allPlants.length, 'plants to', dbPath);
