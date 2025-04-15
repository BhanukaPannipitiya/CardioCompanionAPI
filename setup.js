const fs = require('fs');
const { execSync } = require('child_process');

const folders = [
  'config',
  'controllers',
  'models',
  'routes',
  'services',
  'middleware',
  'utils',
  'tests'
];

folders.forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    console.log(`Created folder: ${folder}`);
  } else {
    console.log(`Folder already exists: ${folder}`);
  }
});

if (!fs.existsSync('package.json')) {
  try {
    execSync('npm init -y', { stdio: 'inherit' });
    console.log('Initialized package.json');
  } catch (error) {
    console.error('Failed to initialize package.json:', error);
  }
} else {
  console.log('package.json already exists');
}