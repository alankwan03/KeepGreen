const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/data/plantDatabase.js');

// Top ~40 staple household favorites with verified, high-quality, direct plant thumbnails
const VERIFIED_PHOTO_SLUGS = new Set([
  // Foliage Staples
  'monstera-deliciosa',
  'monstera-adansonii',
  'golden-pothos',
  'marble-queen-pothos',
  'neon-pothos',
  'satin-pothos',
  'fiddle-leaf-fig',
  'rubber-plant-burgundy',
  'rubber-plant-tineke',
  'weeping-fig',
  'philodendron-birkin',
  'philodendron-pink-princess',
  'philodendron-heartleaf',
  'philodendron-brasil',
  'alocasia-polly',
  'calathea-medallion',
  'calathea-rattlesnake',
  'maranta-red-prayer',
  'aglaonema-silver-bay',
  'dieffenbachia-camille',
  'chinese-money-plant',
  'peperomia-watermelon',
  'tradescantia-zebrina',

  // Succulent Staples
  'snake-plant',
  'snake-plant-zeylanica',
  'zz-plant',
  'jade-plant',
  'aloe-vera',
  'zebra-haworthia',
  'string-of-pearls',
  'burros-tail',
  'echeveria-elegans',
  'golden-barrel-cactus',

  // Palm & Fern Staples
  'boston-fern',
  'birds-nest-fern',
  'maidenhair-fern',
  'areca-palm',
  'parlor-palm',
  'ponytail-palm',

  // Flowering Staples
  'peace-lily',
  'moth-orchid',
  'anthurium-flamingo',
  'hibiscus-rosa-sinensis',

  // Herb Staples
  'sweet-basil',
  'rosemary',
  'spearmint',
  'lavender-english'
]);

// Helper to create a standardized preset entry with full aliases
function createPreset({
  slug,
  name,
  scientificName,
  alternateNames = '',
  category, // 'foliage' | 'succulent' | 'flowering' | 'herb' | 'palm'
  waterFrequencyDays,
  lightLevel, // 'Bright Indirect' | 'Low Light' | 'Medium Light' | 'Direct Sun'
  notes,
  imageUrl,
  defaultLocation = 'Living Room'
}) {
  const isVerified = VERIFIED_PHOTO_SLUGS.has(slug);
  const cleanUrl = isVerified && imageUrl
    ? imageUrl.replace(/w=\d+/, 'w=400').replace(/q=\d+/, 'q=75')
    : null;

  const lightDisplay = lightLevel === 'Bright Indirect' ? 'Bright / Indirect'
    : lightLevel === 'Medium Light' ? 'Medium / Indirect'
    : lightLevel === 'Low Light' ? 'Low / Shade'
    : 'Bright / Full Sun';

  return {
    id: `preset-${slug}`,
    name,
    commonName: name,
    scientificName,
    botanicalName: scientificName,
    alternateNames: alternateNames || `${name} (${scientificName})`,
    category,
    waterFrequencyDays,
    waterDays: waterFrequencyDays,
    wateringDays: waterFrequencyDays,
    lightLevel,
    light: lightDisplay,
    defaultLocation,
    notes,
    noviceTip: notes,
    imageUrl: cleanUrl,
    image: cleanUrl
  };
}

const plants = [];

// ==========================================
// 1. AROIDS & FOLIAGE (68 varieties)
// ==========================================
const foliagePlants = [
  {
    slug: 'monstera-deliciosa',
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    alternateNames: 'Swiss Cheese Plant / Split-Leaf Philodendron',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room',
    notes: 'Iconic fenestrated leaves. Allow top 2 inches of soil to dry out between waterings.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'monstera-adansonii',
    name: 'Monstera Adansonii',
    scientificName: 'Monstera adansonii',
    alternateNames: 'Monkey Mask / Swiss Cheese Vine',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Shelf',
    notes: 'Perforated trailing vine; loves high humidity and a moss pole or hanging basket.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'monstera-standleyana',
    name: 'Monstera Standleyana',
    scientificName: 'Monstera standleyana',
    alternateNames: 'Five Holes Plant / Variegated Cobra',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Desk',
    notes: 'Lance-shaped leaves with white or yellow speckles; avoid harsh direct afternoon sun.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'monstera-peru',
    name: 'Monstera Peru',
    scientificName: 'Monstera karstenianum',
    alternateNames: 'Karstenianum / Corrugated Monstera',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bedroom Shelf',
    notes: 'Thick corrugated textured leaves; more drought-tolerant than standard monsteras.',
    imageUrl: 'https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'monstera-dubia',
    name: 'Monstera Dubia',
    scientificName: 'Monstera dubia',
    alternateNames: 'Shingle Plant',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Wall',
    notes: 'Lies flat against wooden support planks when young; appreciates consistent humidity.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'golden-pothos',
    name: 'Golden Pothos',
    scientificName: 'Epipremnum aureum',
    alternateNames: "Devil's Ivy / Money Plant",
    waterFrequencyDays: 7,
    lightLevel: 'Low Light',
    defaultLocation: 'Office Desk',
    notes: 'Virtually indestructible; leaves droop softly when it is thirsty and perk right back up.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'marble-queen-pothos',
    name: 'Marble Queen Pothos',
    scientificName: 'Epipremnum aureum Marble Queen',
    alternateNames: 'Variegated Pothos',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Shelf',
    notes: 'Heavily marbled cream-and-green foliage; requires brighter indirect light to keep variegation.',
    imageUrl: 'https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'neon-pothos',
    name: 'Neon Pothos',
    scientificName: 'Epipremnum aureum Neon',
    alternateNames: 'Lime Pothos',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Counter',
    notes: 'Vibrant chartreuse foliage; thrives in medium to bright indirect light without scorching.',
    imageUrl: 'https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cebu-blue-pothos',
    name: 'Cebu Blue Pothos',
    scientificName: 'Epipremnum pinnatum Cebu Blue',
    alternateNames: 'Blue Pothos',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bedroom Hanging Pot',
    notes: 'Silvery blue-green elongated foliage; can produce natural splits when climbing upwards.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'manjula-pothos',
    name: 'Manjula Pothos',
    scientificName: 'Epipremnum aureum Manjula',
    alternateNames: 'Happy Leaf Pothos',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Bookshelf',
    notes: 'Wide wavy heart-shaped leaves splashed with shades of cream, mint, and deep emerald.',
    imageUrl: 'https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'satin-pothos',
    name: 'Satin Pothos',
    scientificName: 'Scindapsus pictus Argyraeus',
    alternateNames: 'Silver Satin Vine / Silver Pothos',
    waterFrequencyDays: 8,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bedroom Hanging Basket',
    notes: 'Velvety matte leaves with reflective silver speckles; leaves curl gently when underwatered.',
    imageUrl: 'https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'scindapsus-trebie',
    name: 'Scindapsus Trebie',
    scientificName: 'Scindapsus pictus Trebie',
    alternateNames: 'Exotica Satin Pothos',
    waterFrequencyDays: 8,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Shelf',
    notes: 'Large heart-shaped leaves with dramatic, heavy silver variegation patches.',
    imageUrl: 'https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'scindapsus-moonlight',
    name: 'Scindapsus Moonlight',
    scientificName: 'Scindapsus treubii Moonlight',
    alternateNames: 'Sterling Silver Scindapsus',
    waterFrequencyDays: 10,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Coffee Table',
    notes: 'Sleek leathery leaves washed with a metallic silver-green sheen; loves warmth and moderate watering.',
    imageUrl: 'https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'fiddle-leaf-fig',
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    alternateNames: 'Violin Fig / Banjo Fig',
    waterFrequencyDays: 9,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Corner',
    notes: 'Showstopping violin-shaped leathery leaves; prefers stable positions away from cold drafts.',
    imageUrl: 'https://images.unsplash.com/photo-1597055181300-e3633a917c9c?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'rubber-plant-burgundy',
    name: 'Rubber Plant Burgundy',
    scientificName: 'Ficus elastica Burgundy',
    alternateNames: 'Indian Rubber Tree / Black Prince',
    waterFrequencyDays: 9,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Corner',
    notes: 'Glossy deep burgundy-bronze leaves. Wipe foliage with a damp cloth to keep pores breathing.',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'rubber-plant-tineke',
    name: 'Rubber Plant Tineke',
    scientificName: 'Ficus elastica Tineke',
    alternateNames: 'Variegated Rubber Tree',
    waterFrequencyDays: 9,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bright Window Corner',
    notes: 'Camo-patterned green, cream, and pink tones; water thoroughly when the top half of soil dries.',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'ficus-audrey',
    name: 'Ficus Audrey',
    scientificName: 'Ficus benghalensis',
    alternateNames: 'Banyan Tree / Audrey Fig',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Corner',
    notes: 'Velvety emerald leaves with striking pale veins; far more forgiving of routine changes than Fiddle Leaf Fig.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'weeping-fig',
    name: 'Weeping Fig',
    scientificName: 'Ficus benjamina',
    alternateNames: 'Benjamin Fig / Ficus Tree',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hallway Nook',
    notes: 'Graceful weeping branches with glossy pointed leaves; dislikes sudden environmental transitions.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-birkin',
    name: 'Philodendron Birkin',
    scientificName: 'Philodendron Birkin',
    alternateNames: 'White Wave Philodendron',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Desk',
    notes: 'Compact rosette featuring pin-stripe white variegation across glossy dark green leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-pink-princess',
    name: 'Pink Princess Philodendron',
    scientificName: 'Philodendron erubescens Pink Princess',
    alternateNames: 'PPP / Blushing Philodendron',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Shelf',
    notes: 'Sought-after black leaves marked with electric bubblegum-pink sectoral splashes.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-heartleaf',
    name: 'Heartleaf Philodendron',
    scientificName: 'Philodendron hederaceum',
    alternateNames: 'Sweetheart Plant',
    waterFrequencyDays: 7,
    lightLevel: 'Low Light',
    defaultLocation: 'Bookshelf Edge',
    notes: 'Tender heart-shaped cascading foliage; thrives in lower light conditions and forgives missed waterings.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-brasil',
    name: 'Philodendron Brasil',
    scientificName: 'Philodendron hederaceum Brasil',
    alternateNames: 'Variegated Heartleaf',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Kitchen Shelf',
    notes: 'Heartleaf variety featuring lively lime-green painted brushstrokes down each leaf center.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-micans',
    name: 'Philodendron Micans',
    scientificName: 'Philodendron hederaceum var. micranthum',
    alternateNames: 'Velvet Leaf Philodendron',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bedroom Hanging Planter',
    notes: 'Lush iridescent velvet leaves that shimmer in bronze, rust, and emerald tones.',
    imageUrl: 'https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-prince-of-orange',
    name: 'Prince of Orange',
    scientificName: 'Philodendron Prince of Orange',
    alternateNames: 'Orange Philodendron',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Table',
    notes: 'New leaves emerge in bright apricot orange before shifting to amber-yellow and green.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-white-knight',
    name: 'White Knight Philodendron',
    scientificName: 'Philodendron White Knight',
    alternateNames: 'Variegated Erubescens',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Desk',
    notes: 'Distinct purple-tinged climbing stems with crisp bright white blocks across dark foliage.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-lemon-lime',
    name: 'Lemon Lime Philodendron',
    scientificName: 'Philodendron hederaceum Lemon Lime',
    alternateNames: 'Neon Heartleaf',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Shelf',
    notes: 'Electric chartreuse heart foliage that brightens dimly lit corners instantly.',
    imageUrl: 'https://images.unsplash.com/photo-1620127682229-33388276e540?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-rojo-congo',
    name: 'Rojo Congo Philodendron',
    scientificName: 'Philodendron Rojo Congo',
    alternateNames: 'Red Congo',
    waterFrequencyDays: 9,
    lightLevel: 'Medium Light',
    defaultLocation: 'Floor Planter',
    notes: 'Self-heading upright plant with massive copper-red new leaves maturing into leathery deep green.',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'philodendron-xanadu',
    name: 'Philodendron Xanadu',
    scientificName: 'Thaumatophyllum xanadu',
    alternateNames: 'Winterbourn / Cut-Leaf Philodendron',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Corner',
    notes: 'Dense clump-forming habit with deeply lobed, finger-like architectural leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'alocasia-polly',
    name: 'Alocasia Polly',
    scientificName: 'Alocasia x amazonica Polly',
    alternateNames: 'African Mask / Elephant Ear',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Warm Humid Room',
    notes: 'Dramatic scalloped arrow leaves with bold silver veins; thrives in warm, humid rooms.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'alocasia-zebrina',
    name: 'Alocasia Zebrina',
    scientificName: 'Alocasia zebrina',
    alternateNames: 'Zebra Stalk Elephant Ear',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bright Window Corner',
    notes: 'Striking zebra-striped petioles topped with spear-shaped foliage; water when the top inch dries.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'alocasia-black-velvet',
    name: 'Alocasia Black Velvet',
    scientificName: 'Alocasia reginula',
    alternateNames: 'Little Queen Alocasia',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Terrarium / Office Desk',
    notes: 'Thick velvety nearly black leaves with pale silver veins; avoid water pooling on foliage.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'alocasia-silver-dragon',
    name: 'Alocasia Silver Dragon',
    scientificName: 'Alocasia baginda Silver Dragon',
    alternateNames: 'Dragon Scale Alocasia',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Plant Stand',
    notes: 'Embossed silvery-sage textured leaves with deep emerald veining resembling mythical dragon scales.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'calathea-medallion',
    name: 'Calathea Medallion',
    scientificName: 'Goeppertia veitchiana',
    alternateNames: 'Medallion Prayer Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bedroom Shelf',
    notes: 'Round feathered leaves with deep emerald halos and rich burgundy undersides; enjoys filtered water.',
    imageUrl: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'calathea-orbifolia',
    name: 'Calathea Orbifolia',
    scientificName: 'Goeppertia orbifolia',
    alternateNames: 'Round-Leaf Calathea',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Side Table',
    notes: 'Large saucer-sized rounded leaves with silver metallic brush strokes; prefers moist, humid air.',
    imageUrl: 'https://images.unsplash.com/photo-1617173944883-6ffbd35d584d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'calathea-rattlesnake',
    name: 'Rattlesnake Plant',
    scientificName: 'Goeppertia insignis',
    alternateNames: 'Calathea Lancifolia',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bedroom Nightstand',
    notes: 'Wavy elongated leaves with dark green spots and purple undersides; leaves fold upright at dusk.',
    imageUrl: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'calathea-makoyana',
    name: 'Peacock Plant',
    scientificName: 'Goeppertia makoyana',
    alternateNames: 'Calathea Makoyana / Cathedral Windows',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Humid Bathroom Shelf',
    notes: 'Thin paper-like leaves with feather patterns resembling a peacock tail; use rain or distilled water.',
    imageUrl: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'calathea-ornata',
    name: 'Pinstripe Calathea',
    scientificName: 'Goeppertia ornata',
    alternateNames: 'Pinstripe Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Table',
    notes: 'Dark glossy leaves detailed with delicate candy-pink pinstripes; keep soil evenly moist.',
    imageUrl: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'maranta-red-prayer',
    name: 'Red Prayer Plant',
    scientificName: 'Maranta leuconeura var. erythroneura',
    alternateNames: 'Herringbone Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Coffee Table',
    notes: 'Prominent crimson veins across satin leaves; folds its leaves upward like praying hands at night.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'maranta-lemon-lime',
    name: 'Lemon Lime Prayer Plant',
    scientificName: 'Maranta leuconeura Lemon Lime',
    alternateNames: 'Neon Prayer Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Table',
    notes: 'Vivid chartreuse leaf ribbing on dark green velvety foliage; easy to propagate in water.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'aglaonema-silver-bay',
    name: 'Chinese Evergreen Silver Bay',
    scientificName: 'Aglaonema commutatum Silver Bay',
    alternateNames: 'Silver Chinese Evergreen',
    waterFrequencyDays: 10,
    lightLevel: 'Low Light',
    defaultLocation: 'Dim Hallway',
    notes: 'Super tough plant with wide silver and green leaves; thrives in offices and lower-light corners.',
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'aglaonema-red-siam',
    name: 'Aglaonema Red Siam',
    scientificName: 'Aglaonema Red Siam Aurora',
    alternateNames: 'Red Chinese Evergreen',
    waterFrequencyDays: 9,
    lightLevel: 'Medium Light',
    defaultLocation: 'Office Desk',
    notes: 'Stunning bright red edges and pink stems; needs slightly more light than green aglaonemas.',
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'dieffenbachia-camille',
    name: 'Dumb Cane Camille',
    scientificName: 'Dieffenbachia seguine Camille',
    alternateNames: 'Camille Dieffenbachia',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Corner',
    notes: 'Broad cream-white centers with deep green margins; water when top inch of soil feels dry.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'chinese-money-plant',
    name: 'Chinese Money Plant',
    scientificName: 'Pilea peperomioides',
    alternateNames: 'Pancake Plant / UFO Plant / Friendship Plant',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Window Sill',
    notes: 'Round coin-shaped leaves on slim petioles; rotates toward light and sprouts sweet baby pups.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'peperomia-watermelon',
    name: 'Watermelon Peperomia',
    scientificName: 'Peperomia argyreia',
    alternateNames: 'Watermelon Begonia',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Coffee Table',
    notes: 'Miniature leaves patterned just like watermelon rind on contrasting red stems.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'peperomia-obtusifolia',
    name: 'Baby Rubber Plant',
    scientificName: 'Peperomia obtusifolia',
    alternateNames: 'American Rubber Plant',
    waterFrequencyDays: 9,
    lightLevel: 'Medium Light',
    defaultLocation: 'Office Desk',
    notes: 'Thick succulent-like cupped leaves; stores water and tolerates dry indoor air easily.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'peperomia-hope',
    name: 'Peperomia Hope',
    scientificName: 'Peperomia deppeana x tetraphylla',
    alternateNames: 'Trailing Peperomia',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hanging Window Basket',
    notes: 'Cute coin-like succulent buttons along cascading stems; allow soil to dry between waterings.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'string-of-turtles',
    name: 'String of Turtles',
    scientificName: 'Peperomia prostrata',
    alternateNames: 'Turtle Vine',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Shelf',
    notes: 'Tiny fleshy trailing leaves patterned like miniature turtle shells; water bottom-up gently.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'syngonium-white-butterfly',
    name: 'Arrowhead White Butterfly',
    scientificName: 'Syngonium podophyllum White Butterfly',
    alternateNames: 'Goosefoot Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bathroom Shelf',
    notes: 'Cream and pale green arrow foliage; adapts to either bushy tabletop or climbing habits.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'syngonium-neon-robusta',
    name: 'Pink Arrowhead',
    scientificName: 'Syngonium podophyllum Neon Robusta',
    alternateNames: 'Pink Syngonium',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Table',
    notes: 'Pastel dusty-pink spade foliage with light green undersides; easy and fast-growing.',
    imageUrl: 'https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'dracaena-marginata',
    name: 'Madagascar Dragon Tree',
    scientificName: 'Dracaena marginata',
    alternateNames: 'Red-Edged Dracaena',
    waterFrequencyDays: 12,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Floor',
    notes: 'Slender architectural trunk topped with spiky ribbon leaves trimmed in thin crimson edges.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'dracaena-massangeana',
    name: 'Corn Plant',
    scientificName: 'Dracaena fragrans Massangeana',
    alternateNames: 'False Palm / Mass Cane',
    waterFrequencyDays: 12,
    lightLevel: 'Low Light',
    defaultLocation: 'Office Corner',
    notes: 'Thick woody cane crowned with cascading yellow-striped leaves; very tolerant of low light.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'schefflera-umbrella',
    name: 'Umbrella Tree',
    scientificName: 'Schefflera arboricola',
    alternateNames: 'Dwarf Umbrella Tree',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Window',
    notes: 'Palmate leaves spreading out like tiny green umbrella spokes; responsive to seasonal pruning.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cast-iron-plant',
    name: 'Cast Iron Plant',
    scientificName: 'Aspidistra elatior',
    alternateNames: 'Bar-Room Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Low Light',
    defaultLocation: 'Dark Hallway',
    notes: 'Named for its near-indestructible nature; endures shade, dust, dry air, and irregular waterings.',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'tradescantia-zebrina',
    name: 'Wandering Dude Zebrina',
    scientificName: 'Tradescantia zebrina',
    alternateNames: 'Silver Inch Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hanging Pot by Window',
    notes: 'Metallic silver and deep purple striped vines; pinch tips regularly for bushier growth.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'tradescantia-nanouk',
    name: 'Tradescantia Nanouk',
    scientificName: 'Tradescantia albiflora Nanouk',
    alternateNames: 'Fantasy Venice Inch Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Window Sill',
    notes: 'Chunky upright stems with intense bubblegum-pink, white, and purple variegated leaves.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'fittonia-red-nerve',
    name: 'Red Nerve Plant',
    scientificName: 'Fittonia albivenis Verschaffeltii',
    alternateNames: 'Mosaic Plant',
    waterFrequencyDays: 4,
    lightLevel: 'Medium Light',
    defaultLocation: 'Terrarium / Desk',
    notes: 'Striking bright magenta-red net veins; faints dramatically when dry, reviving shortly after a drink.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'fittonia-white-anne',
    name: 'White Nerve Plant',
    scientificName: 'Fittonia albivenis White Anne',
    alternateNames: 'Silver Nerve Plant',
    waterFrequencyDays: 4,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bathroom Shelf',
    notes: 'Delicate lace-like white veins across miniature olive leaves; thrives in humid terrariums.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'coleus-rainbow',
    name: 'Coleus Rainbow',
    scientificName: 'Plectranthus scutellarioides',
    alternateNames: 'Painted Nettle',
    waterFrequencyDays: 5,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Vibrant neon foliage in swirling shades of crimson, pink, lime, and copper.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'polka-dot-plant',
    name: 'Polka Dot Plant',
    scientificName: 'Hypoestes phyllostachya',
    alternateNames: 'Freckle Face Plant',
    waterFrequencyDays: 5,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bright Desk',
    notes: 'Compact bushy foliage splashed with confetti-like pink, red, or white polka dots.',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'oxalis-purple-shamrock',
    name: 'Purple Shamrock',
    scientificName: 'Oxalis triangularis',
    alternateNames: 'False Shamrock / Love Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Kitchen Sill',
    notes: 'Geometrical deep purple clover leaves that open by day and fold closed like little butterflies at night.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cordyline-ti-plant',
    name: 'Hawaiian Ti Plant',
    scientificName: 'Cordyline fruticosa',
    alternateNames: 'Good Luck Plant',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Corner',
    notes: 'Broad palm-like leaves in electric pink, burgundy, and green; loves warm moist air.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'stromanthe-triostar',
    name: 'Stromanthe Triostar',
    scientificName: 'Stromanthe thalia Triostar',
    alternateNames: 'Tricolor Prayer Plant',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Table',
    notes: 'Showy leaves painted with cream, green, and vibrant glowing hot-pink undersides.',
    imageUrl: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'ctenanthe-burle-marxii',
    name: 'Fishbone Prayer Plant',
    scientificName: 'Ctenanthe burle-marxii',
    alternateNames: 'Burle Marx Ctenanthe',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bedroom Shelf',
    notes: 'Compact silver leaves marked with deep green chevron fishbone stripes and wine undersides.',
    imageUrl: 'https://images.unsplash.com/photo-1589134762519-74d320ea9ce4?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'pilea-aluminum-plant',
    name: 'Aluminum Plant',
    scientificName: 'Pilea cadierei',
    alternateNames: 'Watermelon Pilea',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Office Desk',
    notes: 'Textured emerald leaves with raised metallic aluminum patches that catch ambient room light.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'schefflera-gold-capella',
    name: 'Variegated Umbrella Tree',
    scientificName: 'Schefflera arboricola Gold Capella',
    alternateNames: 'Gold Capella Schefflera',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Corner',
    notes: 'Golden-yellow splashes across miniature umbrella clusters; easy to shape and prune.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'dracaena-song-of-india',
    name: 'Song of India',
    scientificName: 'Dracaena reflexa Song of India',
    alternateNames: 'Pleomele',
    waterFrequencyDays: 10,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bright Living Room',
    notes: 'Whorled glossy leaves edged with bright golden borders; let soil dry partially before watering.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'dracaena-janet-craig',
    name: 'Janet Craig Dracaena',
    scientificName: 'Dracaena deremensis Janet Craig',
    alternateNames: 'Compacta Dracaena',
    waterFrequencyDays: 12,
    lightLevel: 'Low Light',
    defaultLocation: 'Office Hallway',
    notes: 'Glossy dark green pleated leaves; exceptional air-purifying capability in low-light environments.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'aspidistra-milky-way',
    name: 'Spotted Cast Iron Plant',
    scientificName: 'Aspidistra elatior Milky Way',
    alternateNames: 'Milky Way Aspidistra',
    waterFrequencyDays: 14,
    lightLevel: 'Low Light',
    defaultLocation: 'Dim Living Room Corner',
    notes: 'Dark green upright spear foliage dotted with starry white specks; extremely tough and drought hardy.',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=75'
  }
];

foliagePlants.forEach(p => plants.push(createPreset({ ...p, category: 'foliage' })));

// ==========================================
// 2. SUCCULENTS & CACTI (52 varieties)
// ==========================================
const succulentPlants = [
  {
    slug: 'snake-plant',
    name: 'Snake Plant',
    scientificName: 'Dracaena trifasciata Laurentii',
    alternateNames: "Mother-in-Law's Tongue / Sansevieria",
    waterFrequencyDays: 14,
    lightLevel: 'Low Light',
    defaultLocation: 'Bedroom Corner',
    notes: 'Indestructible architectural upright spears with gold borders; water only when completely dry.',
    imageUrl: 'https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'snake-plant-zeylanica',
    name: 'Snake Plant Zeylanica',
    scientificName: 'Dracaena trifasciata Zeylanica',
    alternateNames: 'Bowstring Hemp',
    waterFrequencyDays: 14,
    lightLevel: 'Low Light',
    defaultLocation: 'Office Corner',
    notes: 'Classic dark green mottled horizontal bands; tolerates low light, neglect, and dry air.',
    imageUrl: 'https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'snake-plant-moonshine',
    name: 'Moonshine Snake Plant',
    scientificName: 'Dracaena trifasciata Moonshine',
    alternateNames: 'Silver Snake Plant',
    waterFrequencyDays: 16,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Shelf',
    notes: 'Silvery pale mint-green broad upright leaves; darkens slightly in low light.',
    imageUrl: 'https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'snake-plant-cylindrica',
    name: 'Cylindrical Snake Plant',
    scientificName: 'Dracaena angolensis',
    alternateNames: 'African Spear / Spear Sansevieria',
    waterFrequencyDays: 18,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Table',
    notes: 'Smooth round architectural spears that can be braided; extremely drought tolerant.',
    imageUrl: 'https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'snake-plant-whale-fin',
    name: 'Whale Fin Snake Plant',
    scientificName: 'Dracaena masoniana',
    alternateNames: 'Mason Congo Sansevieria',
    waterFrequencyDays: 20,
    lightLevel: 'Medium Light',
    defaultLocation: 'Entryway Table',
    notes: 'Solitary, massive paddle leaf resembling a whale fin; a sculptural statement specimen.',
    imageUrl: 'https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'birds-nest-snake-plant',
    name: "Bird's Nest Snake Plant",
    scientificName: 'Dracaena trifasciata Hahnii',
    alternateNames: 'Golden Hahnii / Dwarf Snake Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Low Light',
    defaultLocation: 'Desk Shelf',
    notes: 'Compact rosette reaching just 6 inches tall; great for tight desk spaces and shelves.',
    imageUrl: 'https://images.unsplash.com/photo-1593482877647-7c01479268f7?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'zz-plant',
    name: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    alternateNames: 'Zanzibar Gem / Eternity Plant',
    waterFrequencyDays: 18,
    lightLevel: 'Low Light',
    defaultLocation: 'Bedroom',
    notes: 'Drought champion; tuberous bulb rhizomes store water for weeks, so underwatering is safest.',
    imageUrl: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'zz-raven',
    name: 'Raven ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia Raven',
    alternateNames: 'Black ZZ Plant',
    waterFrequencyDays: 20,
    lightLevel: 'Low Light',
    defaultLocation: 'Modern Living Room',
    notes: 'New bright lime stems mature into deep glossy black-purple foliage; exceptionally low maintenance.',
    imageUrl: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'jade-plant',
    name: 'Jade Plant',
    scientificName: 'Crassula ovata',
    alternateNames: 'Money Tree / Lucky Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window Sill',
    notes: 'Thick succulent woody stems with fleshy jade-green oval leaves; symbolized with prosperity.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'crassula-gollum-jade',
    name: 'Gollum Jade',
    scientificName: 'Crassula ovata Gollum',
    alternateNames: 'Ogre Ears / Finger Jade',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Window',
    notes: 'Curious tubular fleshy fingers with suction-cup tips that turn reddish in bright sunlight.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'aloe-vera',
    name: 'Aloe Vera',
    scientificName: 'Aloe barbadensis Miller',
    alternateNames: 'Medicinal Aloe / Burn Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Counter',
    notes: 'Soothing succulent gel inside serrated thick leaves. Soak thoroughly, then allow complete drying.',
    imageUrl: 'https://images.unsplash.com/photo-1567689265664-1c48de61db0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'aloe-lace',
    name: 'Lace Aloe',
    scientificName: 'Aristaloe aristata',
    alternateNames: 'Guinea-Fowl Aloe',
    waterFrequencyDays: 14,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Desk Window',
    notes: 'Dense rosette fringed with soft white teeth and slender thread-like leaf tips.',
    imageUrl: 'https://images.unsplash.com/photo-1567689265664-1c48de61db0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'zebra-haworthia',
    name: 'Zebra Haworthia',
    scientificName: 'Haworthiopsis fasciata',
    alternateNames: 'Zebra Plant / Pearl Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Desk',
    notes: 'Distinct white horizontal stripes on thick triangular leaves; slow growing and compact.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'haworthia-cooperi',
    name: 'Haworthia Cooperi',
    scientificName: 'Haworthia cooperi',
    alternateNames: 'Translucent Window Plant',
    waterFrequencyDays: 12,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Window Shelf',
    notes: 'Clusters of translucent bulbous leaves that capture filtered sunlight like miniature jewels.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'string-of-pearls',
    name: 'String of Pearls',
    scientificName: 'Curio rowleyanus',
    alternateNames: 'Pearl Vine / Bead Vine',
    waterFrequencyDays: 12,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hanging Window',
    notes: 'Spherical pea-like cascading pearls; provide direct morning light across top of pot and avoid soggy soil.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'string-of-bananas',
    name: 'String of Bananas',
    scientificName: 'Curio radicans',
    alternateNames: 'Banana Vine',
    waterFrequencyDays: 10,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Balcony Hanging Pot',
    notes: 'Fast-growing trailing vine with miniature curved banana-shaped foliage; faster grower than Pearls.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'string-of-dolphins',
    name: 'String of Dolphins',
    scientificName: 'Curio x peregrinus',
    alternateNames: 'Dolphin Necklace / Flying Dolphins',
    waterFrequencyDays: 12,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Sill',
    notes: 'Adorable succulent leaves shaped exactly like miniature leaping dolphins.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'string-of-hearts',
    name: 'String of Hearts',
    scientificName: 'Ceropegia woodii',
    alternateNames: 'Rosary Vine / Sweetheart Vine',
    waterFrequencyDays: 12,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hanging Window Planter',
    notes: 'Delicate heart-shaped patterned foliage; water only when the tuberous soil dries out completely.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'burros-tail',
    name: "Burro's Tail",
    scientificName: 'Sedum morganianum',
    alternateNames: "Donkey's Tail / Trailing Sedum",
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony',
    notes: 'Plump blue-green cascading bean leaves; extremely fragile, so place in a no-bump zone.',
    imageUrl: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'sedum-jelly-bean',
    name: 'Jelly Bean Plant',
    scientificName: 'Sedum rubrotinctum',
    alternateNames: 'Pork and Beans',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Chubby bean-shaped leaves that turn bright bronze-red in strong summer sunshine.',
    imageUrl: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'echeveria-elegans',
    name: 'Mexican Snowball',
    scientificName: 'Echeveria elegans',
    alternateNames: 'White Mexican Rose',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window Shelf',
    notes: 'Pale blue-white tight rosette coated in farina powder; water soil directly, avoiding the center crown.',
    imageUrl: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'echeveria-perle-von-nurnberg',
    name: 'Echeveria Perle von Nurnberg',
    scientificName: 'Echeveria Perle von Nurnberg',
    alternateNames: 'Purple Pearl Echeveria',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Sill',
    notes: 'Iridescent metallic purple, pink, and silver rosette; needs full direct sun to maintain deep purple hues.',
    imageUrl: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'echeveria-black-prince',
    name: 'Black Prince Echeveria',
    scientificName: 'Echeveria Black Prince',
    alternateNames: 'Black Hen and Chicks',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window',
    notes: 'Dark chocolate-brown to near black fleshy rosette with bright salmon-red late autumn flowers.',
    imageUrl: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'kalanchoe-panda-plant',
    name: 'Panda Plant',
    scientificName: 'Kalanchoe tomentosa',
    alternateNames: 'Pussy Ears / Chocolate Soldier',
    waterFrequencyDays: 14,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bedroom Shelf',
    notes: 'Soft velvety plush fuzzy leaves tipped with rich chocolate-brown spots; very drought tolerant.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'kalanchoe-flapjack',
    name: 'Flapjack Paddle Plant',
    scientificName: 'Kalanchoe luciae',
    alternateNames: 'Desert Cabbage / Paddle Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony',
    notes: 'Rounded paddle-like flat leaves that blush brilliant ruby red under bright sunshine.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'african-milk-tree',
    name: 'African Milk Tree',
    scientificName: 'Euphorbia trigona',
    alternateNames: 'Cathedral Cactus / Friendship Cactus',
    waterFrequencyDays: 16,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Living Room Corner',
    notes: 'Towering ridged candelabra stems lined with teardrop leaves and sharp spines; water sparingly.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'pencil-cactus',
    name: 'Firesticks Pencil Cactus',
    scientificName: 'Euphorbia tirucalli Rosea',
    alternateNames: 'Sticks on Fire',
    waterFrequencyDays: 16,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window',
    notes: 'Coral-like branched cylinders that turn bright fiery orange and pink in full direct sun.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'crown-of-thorns',
    name: 'Crown of Thorns',
    scientificName: 'Euphorbia milii',
    alternateNames: 'Christ Plant',
    waterFrequencyDays: 10,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Table',
    notes: 'Woody thorny stems bearing constant clusters of delicate petal-like red or pink floral bracts.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'golden-barrel-cactus',
    name: 'Golden Barrel Cactus',
    scientificName: 'Echinocactus grusonii',
    alternateNames: "Mother-in-Law's Cushion",
    waterFrequencyDays: 24,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Bright Sunny Sill',
    notes: 'Classic globe-shaped desert cactus covered in glowing golden spines; water monthly in winter.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bunny-ears-cactus',
    name: 'Bunny Ears Cactus',
    scientificName: 'Opuntia microdasys',
    alternateNames: 'Polka-Dot Cactus / Angel Wings',
    waterFrequencyDays: 20,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Desk',
    notes: 'Paddle segments resembling rabbit ears studded with tiny golden glochids; avoid touching with bare hands.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'fishbone-cactus',
    name: 'Fishbone Cactus',
    scientificName: 'Disocactus anguliger',
    alternateNames: 'Zigzag Cactus / Ric Rac Orchid Cactus',
    waterFrequencyDays: 10,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Shelf',
    notes: 'Wavy zigzag trailing stems; being a jungle cactus, it enjoys slightly more humidity than desert cacti.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'christmas-cactus',
    name: 'Christmas Cactus',
    scientificName: 'Schlumbergera bridgesii',
    alternateNames: 'Holiday Cactus',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Coffee Table',
    notes: 'Segmented flat spineless stems that burst into fiery fuchsia blossoms in early winter.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'thanksgiving-cactus',
    name: 'Thanksgiving Cactus',
    scientificName: 'Schlumbergera truncata',
    alternateNames: 'Claw Cactus',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Dining Room Table',
    notes: 'Pointed claw-like stem teeth with exotic multi-tiered blooms in salmon, pink, and white.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'moon-cactus',
    name: 'Moon Cactus',
    scientificName: 'Gymnocalycium mihanovichii',
    alternateNames: 'Ruby Ball Cactus / Hibotan',
    waterFrequencyDays: 16,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Desk',
    notes: 'Grafted neon orange, pink, or yellow sphere sitting atop a green hylocereus rootstock.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'old-man-cactus',
    name: 'Old Man Cactus',
    scientificName: 'Cephalocereus senilis',
    alternateNames: 'White Beard Cactus',
    waterFrequencyDays: 21,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window',
    notes: 'Columnar cactus covered with long shaggy white hairs designed to shield it from harsh desert heat.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bishops-cap-cactus',
    name: "Bishop's Cap Cactus",
    scientificName: 'Astrophytum myriostigma',
    alternateNames: "Bishop's Miter / Star Cactus",
    waterFrequencyDays: 21,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Shelf',
    notes: 'Spineless five-ribbed geometric cactus dusted with tiny white chalky scales; yellow spring blooms.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'ladyfinger-cactus',
    name: 'Ladyfinger Cactus',
    scientificName: 'Mammillaria elongata',
    alternateNames: 'Golden Lace Cactus',
    waterFrequencyDays: 18,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Window Sill',
    notes: 'Clusters of slender cylindrical stems covered with star-shaped golden-yellow spines.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'mistletoe-cactus',
    name: 'Mistletoe Cactus',
    scientificName: 'Rhipsalis baccifera',
    alternateNames: 'Spaghetti Cactus',
    waterFrequencyDays: 8,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bathroom Hanging Pot',
    notes: 'Cascading tangle of spineless pencil-thin green threads; a jungle epiphyte that likes ambient humidity.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'elephant-bush',
    name: 'Elephant Bush',
    scientificName: 'Portulacaria afra',
    alternateNames: 'Spekboom / Dwarf Jade',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Reddish-brown stems studded with tiny fleshy oval leaves; an exceptional carbon-absorbing succulent.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'ghost-plant',
    name: 'Ghost Plant',
    scientificName: 'Graptopetalum paraguayense',
    alternateNames: 'Mother of Pearl Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Rock Garden / Window Box',
    notes: 'Pastel opalescent rosettes that change color from bluish-gray to pinkish-yellow in sunny conditions.',
    imageUrl: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'moonstones-succulent',
    name: 'Moonstones',
    scientificName: 'Pachyphytum oviferum',
    alternateNames: 'Sugar Almond Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Desk',
    notes: 'Chubby plump rounded leaves covered in silvery-lavender powdery bloom resembling smooth river pebbles.',
    imageUrl: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'sempervivum-hens-and-chicks',
    name: 'Hens and Chicks',
    scientificName: 'Sempervivum tectorum',
    alternateNames: 'Houseleek',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Outdoor Planter',
    notes: 'Extremely cold-hardy geometric rosette that multiplies continuously with baby offsets (chicks).',
    imageUrl: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lithops-living-stones',
    name: 'Living Stones',
    scientificName: 'Lithops pseudotruncatella',
    alternateNames: 'Pebble Plants',
    waterFrequencyDays: 28,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window Sill',
    notes: 'Mimic desert stones to evade hungry animals; needs very minimal water, only when visibly puckered.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'gasteria-ox-tongue',
    name: 'Ox Tongue Gasteria',
    scientificName: 'Gasteria batesiana',
    alternateNames: "Lawyer's Tongue",
    waterFrequencyDays: 14,
    lightLevel: 'Low Light',
    defaultLocation: 'Bookshelf Corner',
    notes: 'Rough, tongue-shaped textured leaves with white warty tubercles; handles deep shade with ease.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'tigers-jaws-succulent',
    name: "Tiger's Jaws",
    scientificName: 'Faucaria tigrina',
    alternateNames: "Shark's Jaws",
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window',
    notes: 'Thick triangular leaves edged with soft claw-like white spines; bright yellow daisy-like blooms.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'string-of-buttons',
    name: 'String of Buttons',
    scientificName: 'Crassula perforata',
    alternateNames: 'Necklace Vine / Pagoda Plant',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Sill',
    notes: 'Square stacked leaves threaded along wiry stems like beads on a necklace; pinkish edges in high sun.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'echeveria-topsy-turvy',
    name: 'Topsy Turvy Echeveria',
    scientificName: 'Echeveria runyonii Topsy Turvy',
    alternateNames: 'Upside Down Echeveria',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony',
    notes: 'Fascinating spoon-shaped leaves that curl backward toward the center of the chalky-blue rosette.',
    imageUrl: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'sedum-autumn-joy',
    name: 'Sedum Autumn Joy',
    scientificName: 'Hylotelephium spectabile Autumn Joy',
    alternateNames: 'Stonecrop',
    waterFrequencyDays: 10,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Garden Patio',
    notes: 'Succulent upright perennial with broccoli-like flower heads that turn from pink to copper in autumn.',
    imageUrl: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'haworthia-limifolia',
    name: 'Fairy Washboard',
    scientificName: 'Haworthiopsis limifolia',
    alternateNames: 'File Haworthia',
    waterFrequencyDays: 14,
    lightLevel: 'Medium Light',
    defaultLocation: 'Office Desk',
    notes: 'Symmetrical pinwheel rosette with raised ridges resembling an antique washboard.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'stapelia-carrion-flower',
    name: 'Starfish Flower',
    scientificName: 'Stapelia gigantea',
    alternateNames: 'Zulu Giant / Carrion Plant',
    waterFrequencyDays: 14,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window',
    notes: 'Velvety four-angled cactus-like stems bearing massive, bizarre hairy starfish blooms.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'prickly-pear',
    name: 'Prickly Pear',
    scientificName: 'Opuntia ficus-indica',
    alternateNames: 'Indian Fig / Nopal',
    waterFrequencyDays: 20,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio',
    notes: 'Flat oval pads producing edible sweet fruits and vibrant yellow flowers; requires full sun.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'crassula-campfire',
    name: 'Campfire Crassula',
    scientificName: 'Crassula capitella Campfire',
    alternateNames: 'Red Pagoda',
    waterFrequencyDays: 12,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony',
    notes: 'Propeller-shaped stacked succulent leaves that ignite into fiery neon-red during cool sunny days.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  }
];

succulentPlants.forEach(p => plants.push(createPreset({ ...p, category: 'succulent' })));

// ==========================================
// 3. FERNS & PALMS (32 varieties)
// ==========================================
const palmPlants = [
  {
    slug: 'boston-fern',
    name: 'Boston Fern',
    scientificName: 'Nephrolepis exaltata',
    alternateNames: 'Sword Fern',
    waterFrequencyDays: 4,
    lightLevel: 'Medium Light',
    defaultLocation: 'Humid Bathroom',
    notes: 'Feathery cascading green fronds. Keep soil consistently moist and mist fronds frequently.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'birds-nest-fern',
    name: "Bird's Nest Fern",
    scientificName: 'Asplenium nidus',
    alternateNames: 'Crispy Wave Fern',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Shelf',
    notes: 'Wavy apple-green undivided ribbons unfurling from a fuzzy central rosette nest.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'maidenhair-fern',
    name: 'Maidenhair Fern',
    scientificName: 'Adiantum raddianum',
    alternateNames: 'Delta Maidenhair',
    waterFrequencyDays: 3,
    lightLevel: 'Medium Light',
    defaultLocation: 'Steamy Bathroom',
    notes: 'Airy, delicate fan-shaped leaflets along polished ebony stems; never allow root ball to dry out.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'staghorn-fern',
    name: 'Staghorn Fern',
    scientificName: 'Platycerium bifurcatum',
    alternateNames: "Elkhorn Fern / Antelope's Horn",
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Mounted Wall Display',
    notes: 'Antler-shaped architectural fronds; soak plaque thoroughly once a week and allow to drain.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'blue-star-fern',
    name: 'Blue Star Fern',
    scientificName: 'Phlebodium aureum',
    alternateNames: 'Golden Polypody',
    waterFrequencyDays: 5,
    lightLevel: 'Medium Light',
    defaultLocation: 'Bathroom Shelf',
    notes: 'Silvery blue-green finger fronds with fuzzy golden creeping rhizomes; very beginner-friendly fern.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'kimberly-queen-fern',
    name: 'Kimberly Queen Fern',
    scientificName: 'Nephrolepis obliterata',
    alternateNames: 'Australian Sword Fern',
    waterFrequencyDays: 5,
    lightLevel: 'Medium Light',
    defaultLocation: 'Covered Patio',
    notes: 'Upright, tidy sword fronds that shed far less than Boston Ferns; tolerates gentle outdoor sun.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'crocodile-fern',
    name: 'Crocodile Fern',
    scientificName: 'Microsorum musifolium Crocodyllus',
    alternateNames: 'Alligator Fern',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Shelf',
    notes: 'Glossy long spear fronds tessellated with distinctive scales resembling crocodile hide.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'rabbits-foot-fern',
    name: "Rabbit's Foot Fern",
    scientificName: 'Davallia fejeensis',
    alternateNames: "Hare's Foot Fern",
    waterFrequencyDays: 5,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hanging Planter',
    notes: 'Lacy triangular foliage sprawling out from adorable furry creeping rhizomes that spill over the rim.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'button-fern',
    name: 'Button Fern',
    scientificName: 'Pellaea rotundifolia',
    alternateNames: 'New Zealand Button Fern',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Desk Shelf',
    notes: 'Dark green leathery round leaflets strung along arching fronds; prefers slightly less water than other ferns.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'kangaroo-paw-fern',
    name: 'Kangaroo Paw Fern',
    scientificName: 'Microsorum pustulatum',
    alternateNames: 'Hound Tongue Fern',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Living Room Table',
    notes: 'Deeply lobed glossy leathery leaves with distinctive paw-like shapes; hardy and resilient.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lemon-button-fern',
    name: 'Lemon Button Fern',
    scientificName: "Nephrolepis cordifolia 'Duffii'",
    alternateNames: 'Fishbone Fern',
    waterFrequencyDays: 5,
    lightLevel: 'Medium Light',
    defaultLocation: 'Kitchen Counter',
    notes: 'Miniature rounded leaflets emitting a subtle fresh lemon scent when gently crushed.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'japanese-painted-fern',
    name: 'Japanese Painted Fern',
    scientificName: 'Athyrium niponicum var. pictum',
    alternateNames: 'Burgundy Lace Fern',
    waterFrequencyDays: 5,
    lightLevel: 'Low Light',
    defaultLocation: 'Shaded Patio Pot',
    notes: 'Breathtaking metallic silvery-gray fronds with contrasting wine-red central stems.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'foxtail-fern',
    name: 'Foxtail Fern',
    scientificName: "Asparagus densiflorus 'Meyeri'",
    alternateNames: "Fox Tail Asparagus",
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Plush emerald plumes resembling fluffy fox tails; stores moisture in tuberous subterranean roots.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'asparagus-fern',
    name: 'Asparagus Fern',
    scientificName: 'Asparagus setaceus',
    alternateNames: 'Lace Fern',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bookshelf Corner',
    notes: 'Feathery cloud-like horizontal branches; not a true fern, but enjoys bright filtered lighting.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'autumn-fern',
    name: 'Autumn Fern',
    scientificName: 'Dryopteris erythrosora',
    alternateNames: 'Japanese Wood Fern / Copper Shield',
    waterFrequencyDays: 5,
    lightLevel: 'Medium Light',
    defaultLocation: 'Shady Porch',
    notes: 'Young emerging fronds shine in vibrant coppery-bronze before maturing into rich woodland green.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'ostrich-fern',
    name: 'Ostrich Fern',
    scientificName: 'Matteuccia struthiopteris',
    alternateNames: 'Fiddlehead Fern',
    waterFrequencyDays: 4,
    lightLevel: 'Low Light',
    defaultLocation: 'Moist Garden Corner',
    notes: 'Grand architectural vase-shaped fern whose tender spring unfurling crosiers are prized fiddleheads.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'silver-lace-fern',
    name: 'Silver Lace Fern',
    scientificName: 'Pteris ensiformis Evergemiensis',
    alternateNames: 'Slender Brake Fern',
    waterFrequencyDays: 5,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bathroom Sill',
    notes: 'Crisp bright white center stripes down every dainty emerald pinna; thrives in high humidity.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'areca-palm',
    name: 'Areca Palm',
    scientificName: 'Dypsis lutescens',
    alternateNames: 'Butterfly Palm / Golden Cane Palm',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Corner',
    notes: 'Clumping golden-cane trunks with feathery arching fronds; effective natural indoor humidifier.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'parlor-palm',
    name: 'Parlor Palm',
    scientificName: 'Chamaedorea elegans',
    alternateNames: 'Neanthe Bella Palm',
    waterFrequencyDays: 8,
    lightLevel: 'Low Light',
    defaultLocation: 'Office Desk',
    notes: 'Victorian parlor favorite; compact slow grower that tolerates low ambient light and air drafts.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'kentia-palm',
    name: 'Kentia Palm',
    scientificName: 'Howea forsteriana',
    alternateNames: 'Sentry Palm / Thatch Palm',
    waterFrequencyDays: 10,
    lightLevel: 'Low Light',
    defaultLocation: 'Living Room Corner',
    notes: 'Regal, durable architectural palm with arching dark green fronds; highly tolerant of shade.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'ponytail-palm',
    name: 'Ponytail Palm',
    scientificName: 'Beaucarnea recurvata',
    alternateNames: "Elephant's Foot / Bottle Palm",
    waterFrequencyDays: 16,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Window Corner',
    notes: 'Swollen bulbous water-storing caudex topped with a fountain of curly ribbon-like foliage.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'majesty-palm',
    name: 'Majesty Palm',
    scientificName: 'Ravenea rivularis',
    alternateNames: 'River Palm',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bright Sunroom',
    notes: 'Graceful feathery palm native to riverbanks; requires consistent moisture and bright filtered light.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lady-palm',
    name: 'Lady Palm',
    scientificName: 'Rhapis excelsa',
    alternateNames: 'Bamboo Palm / Broadleaf Lady Palm',
    waterFrequencyDays: 9,
    lightLevel: 'Low Light',
    defaultLocation: 'Formal Dining Room',
    notes: 'Glossy fan-shaped leaves divided into finger segments on bamboo-like canes; thrives in dim light.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'sago-palm',
    name: 'Sago Palm',
    scientificName: 'Cycas revoluta',
    alternateNames: 'King Sago / Cycad',
    waterFrequencyDays: 14,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Living Room',
    notes: 'Prehistoric cycad with stiff feather fronds crowning a rugged trunk; slow growing and drought hardy.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'pygmy-date-palm',
    name: 'Pygmy Date Palm',
    scientificName: 'Phoenix roebelenii',
    alternateNames: 'Miniature Date Palm',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bright Sunny Corner',
    notes: 'Gracefully curving crowns with fine-textured feathery fronds; water when top inch of soil dries.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bamboo-palm',
    name: 'Bamboo Palm',
    scientificName: 'Chamaedorea seifrizii',
    alternateNames: 'Reed Palm',
    waterFrequencyDays: 7,
    lightLevel: 'Medium Light',
    defaultLocation: 'Office Corner',
    notes: 'Dense clusters of slender bamboo-like stems with lush feathery foliage; excellent indoor air purifier.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cat-palm',
    name: 'Cat Palm',
    scientificName: 'Chamaedorea cataractarum',
    alternateNames: 'Cascade Palm / Cataract Palm',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Floor',
    notes: 'Trunkless clumping palm with deep green glossy fronds; likes evenly moist soil and bright filtered light.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'chinese-fan-palm',
    name: 'Chinese Fan Palm',
    scientificName: 'Livistona chinensis',
    alternateNames: 'Fountain Palm',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Living Room',
    notes: 'Large emerald fan leaves with weeping leaf tips that create an elegant fountain effect.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'european-fan-palm',
    name: 'Mediterranean Fan Palm',
    scientificName: 'Chamaerops humilis',
    alternateNames: 'European Fan Palm',
    waterFrequencyDays: 10,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Hardy multi-stemmed palm with silver-green fan blades; withstands outdoor chilly breezes.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'harts-tongue-fern',
    name: "Hart's Tongue Fern",
    scientificName: 'Asplenium scolopendrium',
    alternateNames: 'Horse Tongue Fern',
    waterFrequencyDays: 5,
    lightLevel: 'Low Light',
    defaultLocation: 'Shaded Window Nook',
    notes: 'Solid strap-like undulating glossy fronds that remain evergreen; appreciates limestone-enriched soil.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'maidenhair-spleenwort',
    name: 'Maidenhair Spleenwort',
    scientificName: 'Asplenium trichomanes',
    alternateNames: 'Rock Spleenwort',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Rockery / Shelf',
    notes: 'Delicate tufts of miniature round green pinnae along glossy purplish-brown stems.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cinnamon-fern',
    name: 'Cinnamon Fern',
    scientificName: 'Osmundastrum cinnamomeum',
    alternateNames: 'Buckhorn Fern',
    waterFrequencyDays: 4,
    lightLevel: 'Medium Light',
    defaultLocation: 'Garden Pond Edge',
    notes: 'Produces central cinnamon-colored fertile fronds surrounded by a vase of bright green plumes.',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=75'
  }
];

palmPlants.forEach(p => plants.push(createPreset({ ...p, category: 'palm' })));

// ==========================================
// 4. FLOWERING INDOOR & PATIO (45 varieties)
// ==========================================
const floweringPlants = [
  {
    slug: 'peace-lily',
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    alternateNames: 'White Sails / Spath',
    waterFrequencyDays: 6,
    lightLevel: 'Low Light',
    defaultLocation: 'Living Room Corner',
    notes: 'Pure white floral spathes and glossy dark leaves. Droops dramatically when thirsty and perks up fast.',
    imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'peace-lily-sensation',
    name: 'Giant Peace Lily Sensation',
    scientificName: 'Spathiphyllum Sensation',
    alternateNames: 'King Peace Lily',
    waterFrequencyDays: 7,
    lightLevel: 'Low Light',
    defaultLocation: 'Living Room Floor',
    notes: 'Massive ribbed deep emerald leaves reaching 3-4 feet tall with giant porcelain-white blooms.',
    imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32e7355?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'moth-orchid',
    name: 'Moth Orchid',
    scientificName: 'Phalaenopsis aphrodite',
    alternateNames: 'Phalaenopsis Orchid',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bathroom Sill',
    notes: 'Long-lasting blooms on arching sprays. Soak bark medium when root tips turn silvery gray.',
    imageUrl: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'dendrobium-orchid',
    name: 'Dendrobium Orchid',
    scientificName: 'Dendrobium nobile',
    alternateNames: 'Bamboo Orchid',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Bright Window Table',
    notes: 'Sweetly fragrant blossoms sprouting along sturdy cane stems; needs bright filtered light.',
    imageUrl: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'anthurium-flamingo',
    name: 'Flamingo Flower',
    scientificName: 'Anthurium andraeanum',
    alternateNames: 'Tailflower / Painted Tongue',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Table',
    notes: 'Glossy heart-shaped waxy red spathes with bright yellow spadix spikes; flowers nearly year-round.',
    imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'african-violet',
    name: 'African Violet',
    scientificName: 'Saintpaulia ionantha',
    alternateNames: 'Saintpaulia',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Kitchen Window Shelf',
    notes: 'Velvety scalloped leaves with clusters of violet, pink, or white flowers; water bottom-up with room-temp water.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cyclamen-persicum',
    name: 'Persian Cyclamen',
    scientificName: 'Cyclamen persicum',
    alternateNames: "Sowbread / Florist's Cyclamen",
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Cool Bedroom Window',
    notes: 'Reflexed winged flowers hovering over patterned silver-marbled hearts; prefers cooler room temperatures.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'begonia-maculata',
    name: 'Polka Dot Begonia',
    scientificName: 'Begonia maculata Wightii',
    alternateNames: 'Forel Begonia / Angel Wing Begonia',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Dining Table',
    notes: 'Angel-wing leaves dotted with silver polka dots and deep crimson undersides; delicate white floral clusters.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'begonia-rex',
    name: 'Rex Begonia',
    scientificName: 'Begonia rex-cultorum',
    alternateNames: 'King Begonia / Painted-Leaf Begonia',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'Office Bookshelf',
    notes: 'Exquisite swirls of metallic silver, burgundy, and emerald; keep soil evenly moist without overwatering.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'begonia-rieger',
    name: 'Rieger Begonia',
    scientificName: 'Begonia x hiemalis',
    alternateNames: 'Elatior Begonia',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Window',
    notes: 'Profusion of double rose-like blooms in shades of yellow, apricot, red, and pink.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bromeliad-guzmania',
    name: 'Guzmania Bromeliad',
    scientificName: 'Guzmania lingulata',
    alternateNames: 'Scarlet Star',
    waterFrequencyDays: 9,
    lightLevel: 'Medium Light',
    defaultLocation: 'Coffee Table',
    notes: 'Vibrant scarlet floral fountain bract lasting months. Keep fresh water in the central cup urn.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bromeliad-aechmea',
    name: 'Urn Plant',
    scientificName: 'Aechmea fasciata',
    alternateNames: 'Silver Vase Plant',
    waterFrequencyDays: 10,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Shelf',
    notes: 'Powdery silver-banded leaves holding an exotic spiky pink flower head with tiny purple florets.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'hoya-carnosa',
    name: 'Wax Plant Hoya',
    scientificName: 'Hoya carnosa',
    alternateNames: 'Porcelainflower',
    waterFrequencyDays: 12,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Window Splay',
    notes: 'Clusters of fragrant, porcelain star-shaped blooms with red centers; thick succulent trailing vines.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'hoya-kerrii',
    name: 'Sweetheart Hoya',
    scientificName: 'Hoya kerrii',
    alternateNames: 'Valentine Hoya / Lucky Heart',
    waterFrequencyDays: 14,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Desk',
    notes: 'Thick succulent foliage shaped like perfect emerald hearts; treat like a gentle succulent.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'hoya-bella',
    name: 'Miniature Wax Plant',
    scientificName: 'Hoya lanceolata subsp. bella',
    alternateNames: 'Beautiful Hoya',
    waterFrequencyDays: 9,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hanging Planter',
    notes: 'Dainty pointed succulent foliage with nodding umbels of white flowers and purple star crowns.',
    imageUrl: 'https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'clivia-miniata',
    name: 'Kaffir Lily',
    scientificName: 'Clivia miniata',
    alternateNames: 'Bush Lily / St. John’s Lily',
    waterFrequencyDays: 12,
    lightLevel: 'Medium Light',
    defaultLocation: 'Cool Living Room Corner',
    notes: 'Sturdy dark green strap leaves sending up glowing clusters of trumpet-shaped fiery orange flowers.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'amaryllis-hippeastrum',
    name: 'Amaryllis',
    scientificName: 'Hippeastrum hybrid',
    alternateNames: 'Barbados Lily / Winter Amaryllis',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Dining Room Table',
    notes: 'Massive trumpet blossoms atop tall hollow stalks in winter; water moderately until bloom spikes appear.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'gardenia-jasminoides',
    name: 'Cape Jasmine Gardenia',
    scientificName: 'Gardenia jasminoides',
    alternateNames: 'Gardenia',
    waterFrequencyDays: 5,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Window',
    notes: 'Intoxicating sweet perfume from creamy white double blossoms; loves acidic, moist soil and warm air.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'arabian-jasmine',
    name: 'Arabian Jasmine',
    scientificName: 'Jasminum sambac',
    alternateNames: 'Sampaguita / Maid of Orleans',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony Sill',
    notes: 'Sweetly fragrant star-shaped white blossoms used in jasmine tea; blooms throughout warm months.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'madagascar-jasmine',
    name: 'Madagascar Jasmine',
    scientificName: 'Stephanotis floribunda',
    alternateNames: 'Bridal Wreath / Hawaiian Wedding Flower',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunroom Trellis',
    notes: 'Glossy leathery vine with pure white waxy tubular blooms producing a heavenly sweet fragrance.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'gloxinia',
    name: 'Gloxinia',
    scientificName: 'Sinningia speciosa',
    alternateNames: 'Florist’s Gloxinia',
    waterFrequencyDays: 5,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Tabletop Display',
    notes: 'Velvety ruffled bell flowers in rich royal purple, crimson, and two-tone ruffles; water soil directly.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lipstick-plant',
    name: 'Lipstick Plant',
    scientificName: 'Aeschynanthus radicans',
    alternateNames: 'Basket Vine',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Hanging Window Planter',
    notes: 'Bright scarlet tubular flowers emerging from dark maroon calyces resembling tubes of lipstick.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'goldfish-plant',
    name: 'Goldfish Plant',
    scientificName: 'Nematanthus gregarius',
    alternateNames: 'Clog Plant',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Window Basket',
    notes: 'Trailing waxy stems with cheerful puffy orange blooms shaped exactly like swimming goldfish.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'hibiscus-rosa-sinensis',
    name: 'Tropical Hibiscus',
    scientificName: 'Hibiscus rosa-sinensis',
    alternateNames: 'China Rose / Hawaiian Hibiscus',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Spectacular flared blooms with prominent pollen stamens; thirsty plant requiring bright full sun.',
    imageUrl: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'geranium-zonale',
    name: 'Zonal Geranium',
    scientificName: 'Pelargonium x hortorum',
    alternateNames: 'Garden Geranium',
    waterFrequencyDays: 6,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Window Box',
    notes: 'Classic rounded scalloped foliage with dark horseshoe zones; bright clusters of red, pink, and coral.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'petunia-wave',
    name: 'Wave Petunia',
    scientificName: 'Petunia x hybrida',
    alternateNames: 'Trailing Petunia',
    waterFrequencyDays: 3,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Hanging Basket',
    notes: 'Prolific trumpet-shaped blooms spilling over planters all summer long; water daily in hot weather.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'calibrachoa-million-bells',
    name: 'Million Bells',
    scientificName: 'Calibrachoa hybrid',
    alternateNames: 'Mini Petunia',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Porch Hanging Basket',
    notes: 'Hundreds of miniature petunia-like blossoms that self-clean without needing deadheading.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'hydrangea-macrophylla',
    name: 'Bigleaf Hydrangea',
    scientificName: 'Hydrangea macrophylla',
    alternateNames: 'French Hydrangea / Mophead',
    waterFrequencyDays: 4,
    lightLevel: 'Medium Light',
    defaultLocation: 'Shaded Patio',
    notes: 'Enormous spherical flower globes whose color shifts from pink to blue depending on soil pH.',
    imageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bougainvillea',
    name: 'Bougainvillea',
    scientificName: 'Bougainvillea spectabilis',
    alternateNames: 'Paper Flower',
    waterFrequencyDays: 9,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony Trellis',
    notes: 'Explosion of vibrant papery magenta or orange bracts; drought champion that loves hot blazing sun.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'fuchsia-trailing',
    name: 'Trailing Fuchsia',
    scientificName: 'Fuchsia magellanica hybrid',
    alternateNames: "Lady's Eardrops",
    waterFrequencyDays: 4,
    lightLevel: 'Medium Light',
    defaultLocation: 'Shaded Porch Basket',
    notes: 'Intricate pendulous bi-colored ballerina blooms; loves cool shade and moist potting soil.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'zinnia-elegans',
    name: 'Zinnia',
    scientificName: 'Zinnia elegans',
    alternateNames: 'Common Zinnia',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Garden Pot',
    notes: 'Cheerful multi-petaled daisy blooms that attract butterflies all summer; water base to avoid powdery mildew.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'french-marigold',
    name: 'French Marigold',
    scientificName: 'Tagetes patula',
    alternateNames: 'Marigold',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Herb & Garden Border',
    notes: 'Fiery gold and mahogany aromatic blooms; natural companion plant that repels garden pests.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'pansy-viola',
    name: 'Garden Pansy',
    scientificName: 'Viola x wittrockiana',
    alternateNames: 'Johnny Jump Up',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Cool Window Box',
    notes: 'Velvety face-patterned edible petals that flourish in cool spring and autumn weather.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'impatiens-walleriana',
    name: 'Busy Lizzie',
    scientificName: 'Impatiens walleriana',
    alternateNames: 'Touch-Me-Not',
    waterFrequencyDays: 3,
    lightLevel: 'Low Light',
    defaultLocation: 'Shaded Patio Planter',
    notes: 'Non-stop colorful blooms that light up shady patios and porches; needs consistently moist soil.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'miniature-rose',
    name: 'Miniature Rose',
    scientificName: 'Rosa chinensis minima',
    alternateNames: 'Patio Rose',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony Pot',
    notes: 'Perfect dwarf rose blooms with delicate fragrance; requires 6+ hours of direct sun daily.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'mandevilla',
    name: 'Mandevilla',
    scientificName: 'Mandevilla sanderi',
    alternateNames: 'Dipladenia / Brazilian Jasmine',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Patio Trellis Pot',
    notes: 'Vigorous climber boasting trumpet flowers in vibrant pink, crimson, and white all summer.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'plumeria-frangipani',
    name: 'Frangipani',
    scientificName: 'Plumeria rubra',
    alternateNames: 'Temple Tree / Plumeria',
    waterFrequencyDays: 9,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Deck',
    notes: 'Unforgettably fragrant pinwheel blooms used in Hawaiian leis; let soil dry between waterings.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'kalanchoe-calandiva',
    name: 'Calandiva Kalanchoe',
    scientificName: 'Kalanchoe blossfeldiana Calandiva',
    alternateNames: 'Flaming Katy Rose',
    waterFrequencyDays: 10,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Counter',
    notes: 'Succulent dark green foliage crowned with clusters of tiny double rose-like blossoms for weeks.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'crossandra-firecracker',
    name: 'Firecracker Flower',
    scientificName: 'Crossandra infundibuliformis',
    alternateNames: 'Kanakambaram',
    waterFrequencyDays: 6,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunny Room Shelf',
    notes: 'Glossy leaves with salmon-apricot fan petals; thrives in warm humid indoor environments.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'streptocarpus-cape-primrose',
    name: 'Cape Primrose',
    scientificName: 'Streptocarpus hybrid',
    alternateNames: 'False African Violet',
    waterFrequencyDays: 6,
    lightLevel: 'Medium Light',
    defaultLocation: 'East-Facing Window Sill',
    notes: 'Trumpet-shaped blossoms on slender stems rising above quilted leaves; long-blooming houseplant.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'medinilla-magnifica',
    name: 'Showy Medinilla',
    scientificName: 'Medinilla magnifica',
    alternateNames: 'Rose Grape / Chandelier Plant',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Feature Table Display',
    notes: 'Spectacular pendulous pink flower chandeliers cascading from bold tiered winged stems.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cattleya-orchid',
    name: 'Cattleya Orchid',
    scientificName: 'Cattleya labiata',
    alternateNames: 'Corsage Orchid',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Sunlit Bathroom',
    notes: 'Exotic, intensely fragrant large blossoms with ruffled lips; allow potting medium to dry between soakings.',
    imageUrl: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'oncidium-orchid',
    name: 'Dancing Lady Orchid',
    scientificName: 'Oncidium hybrid',
    alternateNames: 'Golden Shower Orchid',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Living Room Table',
    notes: 'Clouds of tiny golden-yellow blossoms resembling skirted dancing ladies; light, cheerful fragrance.',
    imageUrl: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'tillandsia-pink-quill',
    name: 'Pink Quill Bromeliad',
    scientificName: 'Wallisia cyanea',
    alternateNames: 'Tillandsia Cyanea',
    waterFrequencyDays: 7,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Office Desk',
    notes: 'Feathery foliage supporting a flat bright pink paddle bract from which royal blue florets emerge.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'crown-imperial',
    name: 'Crown Imperial',
    scientificName: 'Fritillaria imperialis',
    alternateNames: "Kaiser's Crown",
    waterFrequencyDays: 7,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Spring Garden Border',
    notes: 'Nodding bell flowers crowned by an upright tuft of glossy green leaves; majestic spring feature.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  }
];

floweringPlants.forEach(p => plants.push(createPreset({ ...p, category: 'flowering' })));

// ==========================================
// 5. COMMON HERBS & KITCHEN GREENS (34 varieties)
// ==========================================
const herbPlants = [
  {
    slug: 'sweet-basil',
    name: 'Sweet Basil',
    scientificName: 'Ocimum basilicum',
    alternateNames: 'Genovese Basil / Italian Basil',
    waterFrequencyDays: 3,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Window Sill',
    notes: 'Thirsty aromatic culinary staple. Water whenever the topsoil feels dry and pinch flower buds.',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'thai-basil',
    name: 'Thai Basil',
    scientificName: 'Ocimum basilicum var. thyrsiflora',
    alternateNames: 'Horapha / Asian Basil',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Window',
    notes: 'Anise-scented foliage with purple stems and pink blossoms; essential for curries and noodle soups.',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'holy-basil-tulsi',
    name: 'Holy Basil (Tulsi)',
    scientificName: 'Ocimum tenuiflorum',
    alternateNames: 'Tulsi / Sacred Basil',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Revered Ayurvedic herbal tea plant with spicy peppery clove notes; thrives in warm sunny rooms.',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'rosemary',
    name: 'Rosemary',
    scientificName: 'Salvia rosmarinus',
    alternateNames: 'Dew of the Sea',
    waterFrequencyDays: 7,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Kitchen Window',
    notes: 'Woody Mediterranean pine-scented needles. Allow soil to dry moderately and provide direct sun.',
    imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'spearmint',
    name: 'Spearmint',
    scientificName: 'Mentha spicata',
    alternateNames: 'Garden Mint',
    waterFrequencyDays: 3,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Counter Pot',
    notes: 'Vigorous sweet mint; best grown in its own isolated container to prevent spreading into other plants.',
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'peppermint',
    name: 'Peppermint',
    scientificName: 'Mentha x piperita',
    alternateNames: 'Brandy Mint',
    waterFrequencyDays: 3,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Balcony Herb Planter',
    notes: 'High menthol content cooling leaves; perfect for fresh teas. Keep soil consistently moist.',
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'apple-mint',
    name: 'Apple Mint',
    scientificName: 'Mentha suaveolens',
    alternateNames: 'Woolly Mint',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Patio Herb Pot',
    notes: 'Velvety round fuzzy leaves with gentle fruity apple notes; delightful in iced teas and fruit salads.',
    imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'english-thyme',
    name: 'English Thyme',
    scientificName: 'Thymus vulgaris',
    alternateNames: 'Common Thyme / Garden Thyme',
    waterFrequencyDays: 6,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Window',
    notes: 'Tiny aromatic culinary leaves on woody sprigs; water when soil surface feels dry and provide bright sun.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lemon-thyme',
    name: 'Lemon Thyme',
    scientificName: 'Thymus citriodorus',
    alternateNames: 'Citrus Thyme',
    waterFrequencyDays: 6,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window Sill',
    notes: 'Wonderful tangy lemon-scented foliage with golden-green margins; fantastic with roast vegetables and poultry.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'flat-leaf-parsley',
    name: 'Flat-Leaf Italian Parsley',
    scientificName: 'Petroselinum crispum var. neapolitanum',
    alternateNames: 'Italian Parsley',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Counter',
    notes: 'Robust culinary flavor for sauces and marinades; prefers consistent moisture and rich well-drained soil.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'curly-parsley',
    name: 'Curly Parsley',
    scientificName: 'Petroselinum crispum',
    alternateNames: 'Crisped Parsley',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Shelf',
    notes: 'Frizzled emerald ruffled fronds ideal for table garnishes and soups; easy to snip as needed.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'cilantro-coriander',
    name: 'Cilantro (Coriander)',
    scientificName: 'Coriandrum sativum',
    alternateNames: 'Chinese Parsley / Coriander',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Window',
    notes: 'Fresh pungent leaves for salsas and curries; prefers cooler conditions to prevent premature bolting.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'greek-oregano',
    name: 'Greek Oregano',
    scientificName: 'Origanum vulgare hirtum',
    alternateNames: 'Wild Marjoram',
    waterFrequencyDays: 6,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window Sill',
    notes: 'Intense peppery Mediterranean herb for pizza and pasta; allow soil to dry between waterings.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'sweet-marjoram',
    name: 'Sweet Marjoram',
    scientificName: 'Origanum majorana',
    alternateNames: 'Knotted Marjoram',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Kitchen Sill',
    notes: 'Delicate floral citrus notes milder and sweeter than oregano; tender perennial in warm sunny rooms.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'garden-sage',
    name: 'Garden Sage',
    scientificName: 'Salvia officinalis',
    alternateNames: 'Common Sage / Culinary Sage',
    waterFrequencyDays: 7,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony',
    notes: 'Velvety grayish-green aromatic leaves; highly drought-hardy once established in a sunny spot.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'purple-sage',
    name: 'Purple Sage',
    scientificName: 'Salvia officinalis Purpurascens',
    alternateNames: 'Red Sage',
    waterFrequencyDays: 7,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Ornamental smoky purple-tinted foliage with the same rich earthy flavor as traditional culinary sage.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'chives',
    name: 'Garden Chives',
    scientificName: 'Allium schoenoprasum',
    alternateNames: 'Common Chives',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Window Box',
    notes: 'Slender hollow grassy blades with delicate onion flavor; cut at base and enjoy pretty purple edible blooms.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'garlic-chives',
    name: 'Garlic Chives',
    scientificName: 'Allium tuberosum',
    alternateNames: 'Chinese Chives',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Window',
    notes: 'Flat strap-like foliage boasting a pleasant mild garlic taste; wonderful in stir-fries and dumplings.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'dill',
    name: 'Dill',
    scientificName: 'Anethum graveolens',
    alternateNames: 'Dill Weed',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Patio Herb Planter',
    notes: 'Feathery blue-green fronds with signature pickle aroma; keep soil evenly moist in deep pots.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'french-tarragon',
    name: 'French Tarragon',
    scientificName: 'Artemisia dracunculus',
    alternateNames: 'True Tarragon',
    waterFrequencyDays: 6,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Kitchen Window Sill',
    notes: 'Subtle sweet anise and licorice flavor essential for classic French Béarnaise and mustard dressings.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lemon-balm',
    name: 'Lemon Balm',
    scientificName: 'Melissa officinalis',
    alternateNames: 'Sweet Balm',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Herb Garden Table',
    notes: 'Scalloped leaves with zesty lemon fragrance; soothing herb for evening teas and herbal infusions.',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lemongrass',
    name: 'West Indian Lemongrass',
    scientificName: 'Cymbopogon citratus',
    alternateNames: 'Oil Grass / Fever Grass',
    waterFrequencyDays: 4,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Balcony Planter',
    notes: 'Tall citrus-scented stalks for Southeast Asian broths and teas; thrives in warm sunny spots with ample water.',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'chamomile-german',
    name: 'German Chamomile',
    scientificName: 'Matricaria chamomilla',
    alternateNames: 'Wild Chamomile',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Apple-scented feathery foliage bearing miniature daisy blossoms prized for calming herbal sleep teas.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bay-laurel',
    name: 'Bay Laurel',
    scientificName: 'Laurus nobilis',
    alternateNames: 'Sweet Bay / Bay Leaf Tree',
    waterFrequencyDays: 8,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Patio Door',
    notes: 'Slow-growing woody shrub yielding glossy aromatic bay leaves for slow-cooked stews and stocks.',
    imageUrl: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lavender-english',
    name: 'English Lavender',
    scientificName: 'Lavandula angustifolia',
    alternateNames: 'Common Lavender / True Lavender',
    waterFrequencyDays: 10,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Window Sill',
    notes: 'Silvery needle foliage crowned by calming purple floral spikes. Loves dry, lean soil and full sunshine.',
    imageUrl: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'catnip',
    name: 'Catnip',
    scientificName: 'Nepeta cataria',
    alternateNames: 'Catmint',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Balcony Corner',
    notes: 'Aromatic heart-shaped scalloped leaves containing nepetalactone that delights feline friends.',
    imageUrl: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'bronze-fennel',
    name: 'Bronze Fennel',
    scientificName: 'Foeniculum vulgare Rubrum',
    alternateNames: 'Sweet Fennel',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Planter',
    notes: 'Smoky bronze feathery cloud foliage with sweet anise-flavored leaves and seeds.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'borage',
    name: 'Borage',
    scientificName: 'Borago officinalis',
    alternateNames: 'Starflower',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Herb Garden Bed',
    notes: 'Hairy leaves with cool cucumber taste and bright star-shaped blue edible flowers that bees adore.',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'winter-savory',
    name: 'Winter Savory',
    scientificName: 'Satureja montana',
    alternateNames: 'Mountain Savory',
    waterFrequencyDays: 7,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Sill',
    notes: 'Evergreen peppery herb with woody stems; classic spice for hearty bean dishes and roasts.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'french-sorrel',
    name: 'French Sorrel',
    scientificName: 'Rumex acetosa',
    alternateNames: 'Garden Sorrel',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Kitchen Box',
    notes: 'Juicy green spear leaves with a tart lemon-green apple tang; delicious in spring soups and salads.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'lovage',
    name: 'Lovage',
    scientificName: 'Levisticum officinale',
    alternateNames: 'Maggi Herb',
    waterFrequencyDays: 4,
    lightLevel: 'Bright Indirect',
    defaultLocation: 'Garden Pot',
    notes: 'Tall celery-like foliage with rich umami flavor; a single leaf imparts immense savory depth to broth.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'pineapple-sage',
    name: 'Pineapple Sage',
    scientificName: 'Salvia elegans',
    alternateNames: 'Tangerine Sage',
    waterFrequencyDays: 5,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Patio Pot',
    notes: 'Crushed leaves smell unmistakably like fresh ripe pineapple; sends up fiery red autumn tubular blooms.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'tarragon-russian',
    name: 'Russian Tarragon',
    scientificName: 'Artemisia dracunculoides',
    alternateNames: 'False Tarragon',
    waterFrequencyDays: 7,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Patio Herb Pot',
    notes: 'Hardy and vigorous perennial with subtle grassy flavor; exceptionally tolerant of summer heat and drought.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  },
  {
    slug: 'golden-oregano',
    name: 'Golden Oregano',
    scientificName: 'Origanum vulgare Aureum',
    alternateNames: 'Golden Marjoram',
    waterFrequencyDays: 6,
    lightLevel: 'Direct Sun',
    defaultLocation: 'Sunny Sill',
    notes: 'Luminous chartreuse-gold carpeting foliage with delicious mild oregano seasoning flavor.',
    imageUrl: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=400&q=75'
  }
];

herbPlants.forEach(p => plants.push(createPreset({ ...p, category: 'herb' })));

console.log('Total Plants Prepared:', plants.length);

// Generate final module code
const outputCode = `/**
 * KeepGreen Comprehensive Plant Reference Database (${plants.length} Varieties)
 * Curated house and garden library scaled across 5 core categories:
 * Foliage (${foliagePlants.length}), Succulents & Cacti (${succulentPlants.length}), Ferns & Palms (${palmPlants.length}), Flowering (${floweringPlants.length}), Herbs & Edibles (${herbPlants.length}).
 *
 * ZERO LOCALSTORAGE BLOAT: Static source reference only.
 * Remote CDN image URLs are pre-optimized (?auto=format&fit=crop&w=400&q=75).
 */

export const CATEGORY_FALLBACKS = {
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

export function getCategoryFallback(category) {
  if (!category) return CATEGORY_FALLBACKS.foliage;
  const cat = String(category).toLowerCase();
  if (cat.includes('succulent') || cat.includes('cacti') || cat.includes('cactus')) return CATEGORY_FALLBACKS.succulent;
  if (cat.includes('herb') || cat.includes('edible') || cat.includes('vegetable')) return CATEGORY_FALLBACKS.herb;
  if (cat.includes('flower') || cat.includes('bloom')) return CATEGORY_FALLBACKS.flowering;
  if (cat.includes('palm') || cat.includes('fern')) return CATEGORY_FALLBACKS.palm;
  return CATEGORY_FALLBACKS.foliage;
}

export const PLANT_DATABASE = ${JSON.stringify(plants, null, 2)};
`;

fs.writeFileSync(targetPath, outputCode, 'utf8');
console.log('Successfully wrote expanded PLANT_DATABASE with ' + plants.length + ' varieties to ' + targetPath);
