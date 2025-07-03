const fancyText = require('figlet');
const chalk = require('chalk');
const gradient = require('gradient-string');

// List of fancy text styles
const styles = [
    '3D-ASCII',
    'Alpha',
    'Banner3-D',
    'Doh',
    'Epic',
    'Larry 3D',
    'Slant',
    'Standard',
    'Delta Corps Priest 1',
    'Colossal'
];

// List of gradient colors
const gradients = [
    gradient.rainbow,
    gradient.pastel,
    gradient.mind,
    gradient.cristal,
    gradient.teen,
    gradient.vice
];

// Generate fancy menu text
async function generateFancyMenu(menuText) {
    try {
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        const asciiText = await new Promise((resolve, reject) => {
            fancyText.text(menuText, {
                font: randomStyle,
                horizontalLayout: 'default',
                verticalLayout: 'default',
                width: 80,
                whitespaceBreak: true
            }, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
        
        return randomGradient(asciiText);
    } catch (error) {
        console.error('Error generating fancy text:', error);
        return chalk.bold.blue(menuText); // Fallback to simple colored text
    }
}

// Function to rotate menu text periodically
async function startMenuRotation(menuText, interval = 30000) {
    let currentMenu = await generateFancyMenu(menuText);
    
    // Update menu immediately
    global.menuText = currentMenu;
    
    // Set up periodic rotation
    setInterval(async () => {
        currentMenu = await generateFancyMenu(menuText);
        global.menuText = currentMenu;
    }, interval);
    
    return currentMenu;
}

module.exports = {
    generateFancyMenu,
    startMenuRotation
};
