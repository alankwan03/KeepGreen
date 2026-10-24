const fs = require('fs');
const path = require('path');

function cleanSource(content) {
  return content
    // Remove import statements
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '')
    // Remove duplicate React / ReactDOM / Hook declarations
    .replace(/^\s*const\s*\{[^}]*\}\s*=\s*(?:window\.)?React[^;]*;?\s*$/gm, '')
    .replace(/^\s*const\s+React\s*=.*?;?\s*$/gm, '')
    .replace(/^\s*const\s+ReactDOM\s*=.*?;?\s*$/gm, '')
    // Transform exports into plain top-level declarations
    .replace(/^export\s+default\s+/gm, '')
    .replace(/^export\s+(function|const|let|var|class)\s+/gm, '$1 ');
}

function build() {
  console.log('Building standalone application bundle...');

  const presetsCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/constants/presets.js'), 'utf8'));
  const plantDatabaseCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/data/plantDatabase.js'), 'utf8'));
  const careStatusCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/utils/careStatus.js'), 'utf8'));
  const imageCompressorCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/utils/imageCompressor.js'), 'utf8'));
  const storageCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/hooks/useLocalStorage.js'), 'utf8'));
  const iconsCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/components/Icons.jsx'), 'utf8'));
  const statusBadgeCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/components/StatusBadge.jsx'), 'utf8'));
  const plantCardCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/components/PlantCard.jsx'), 'utf8'));
  const addPlantModalCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/components/AddPlantModal.jsx'), 'utf8'));
  const editPlantModalCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/components/EditPlantModal.jsx'), 'utf8'));
  const quickHelpModalCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/components/QuickHelpModal.jsx'), 'utf8'));
  const feedbackModalCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/components/FeedbackModal.jsx'), 'utf8'));
  const appCode = cleanSource(fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8'));

  const bundle = `// KeepGreen Bundle - Clean React 18 Architecture
(function() {
  'use strict';
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const { useState, useEffect, useCallback, useMemo, useRef } = React;

  // --- 1. Constants & Presets & 80+ Plant Reference Database ---
  ${presetsCode}

  ${plantDatabaseCode}

  // --- 2. Status & Date Engine & Client-Side Image Compressor ---
  ${careStatusCode}

  ${imageCompressorCode}

  // --- 3. Local Storage Reactive Hook ---
  ${storageCode}

  // --- 4. Lucide Icons Library ---
  ${iconsCode}

  // --- 5. Components ---
  ${statusBadgeCode}

  ${plantCardCode}

  ${addPlantModalCode}

  ${editPlantModalCode}

  ${quickHelpModalCode}

  ${feedbackModalCode}

  // --- 6. Main App Component ---
  ${appCode}

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
`;

  fs.writeFileSync(path.join(__dirname, 'app.bundle.js'), bundle, 'utf8');
  console.log('✅ app.bundle.js successfully regenerated with Custom Photo Upload & Image Compression!');
}

build();
