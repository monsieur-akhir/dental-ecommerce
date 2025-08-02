const fs = require('fs');
const path = require('path');

// Créer le dossier templates dans dist s'il n'existe pas
const distTemplatesDir = path.join(__dirname, 'dist', 'src', 'email', 'templates');
const srcTemplatesDir = path.join(__dirname, 'src', 'email', 'templates');

if (!fs.existsSync(distTemplatesDir)) {
  fs.mkdirSync(distTemplatesDir, { recursive: true });
}

// Copier les fichiers de templates
const templateFiles = ['base.hbs', 'modern.hbs'];

templateFiles.forEach(file => {
  const srcFile = path.join(srcTemplatesDir, file);
  const distFile = path.join(distTemplatesDir, file);
  
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, distFile);
    console.log(`Copied ${file} to dist folder`);
  } else {
    console.warn(`Template file ${file} not found in src`);
  }
});

console.log('Templates copied successfully!'); 