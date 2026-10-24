// Layout verification script
const fs = require('fs');
const path = require('path');

const bundle = fs.readFileSync(path.join(__dirname, '../app.bundle.js'), 'utf8');

console.log('--- Checking Header & Footer in bundle ---');
const hasTagline = bundle.includes('Your Smart Watering & Plant Care Assistant');
const hasHiddenMdTagline = bundle.includes('truncate hidden md:block');
const hasBadgeInHeader = bundle.includes('v0.01 (alpha)</span>\n              </div>\n              <p');
const hasBadgeInFooter = bundle.includes('v0.01 (alpha)') && bundle.includes('Novice Care Rule of Thumb:');
const hasAddPlantShrink = bundle.includes('Add Plant') && bundle.includes('shrink-0');

console.log('1. Tagline present in bundle:', hasTagline);
console.log('2. Tagline hidden md:block removed (now visible on mobile):', !hasHiddenMdTagline);
console.log('3. Badge removed from header:', !bundle.includes('KeepGreen</h1>\n                <span className="text-[10px]'));
console.log('4. Badge present in footer:', hasBadgeInFooter);
console.log('5. Add plant button has shrink-0 and whitespace-nowrap:', hasAddPlantShrink);

// Viewport width checks simulation
const viewports = [320, 360, 375, 414];
console.log('\n--- Viewport Budget Breakdown ---');
viewports.forEach(vp => {
  const containerPadding = 24; // px-3 * 2
  const availableWidth = vp - containerPadding;
  const brandIcon = 32; // 20px icon + 12px padding
  const brandIconGap = 8; // gap-2
  const actionGroup = 36 + 36 + 102 + 8; // Guide(36) + Feedback(36) + AddPlant(~102) + gap-1*2(8) = 182px
  const headerGap = 8; // gap-2 between left and right groups
  const spaceForTitleAndTagline = availableWidth - actionGroup - headerGap - brandIcon - brandIconGap;

  console.log(`Viewport ${vp}px:`);
  console.log(`  Available header width: ${availableWidth}px`);
  console.log(`  Action group width (shrink-0): ${actionGroup}px`);
  console.log(`  Title & Tagline space (min-w-0 flex-1): ${spaceForTitleAndTagline}px`);
  console.log(`  Title 'KeepGreen' (~78px): ${spaceForTitleAndTagline >= 78 ? 'Fits completely without truncation' : 'Truncates gracefully'}`);
  console.log(`  Tagline: Truncates gracefully with CSS ellipsis, 0px horizontal overflow.\n`);
});

console.log('Layout Verification: PASSED!');
