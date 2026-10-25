// Helper to compute a dynamic date relative to today (YYYY-MM-DD)
// This ensures that whenever the app is first opened, the starter demo plants
// showcase all 3 status badge states (Green, Amber, Red).
export function getRelativeDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const VERSION_KEY = 'keepgreen_data_version';
export const CURRENT_VERSION = '0.2-alpha-1';
export const STORAGE_KEY = 'keepgreen_plants';

export const INITIAL_PLANTS = [
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

export const STARTER_PRESETS = INITIAL_PLANTS;
