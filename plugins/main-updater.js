const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');
const child_process = require('child_process');

// Update management variables
let isUpdating = false;
const protectedFiles = ['config.js', 'app.json', 'sessions', 'data', 'lib'];

cmd({
    pattern: "update",
    alias: ["upgrade", "sync", "gitpull"],
    react: '🆕',
    desc: "Update the bot to the latest version",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("❌ This command is only for the bot owner.");
    if (isUpdating) return reply("🔄 Update already in progress. Please wait...");

    try {
        isUpdating = true;
        await reply("🔍 Checking for updates...");

        // Get current and latest commit hashes
        const currentHash = await getCommitHash();
        const { data: [latestCommit] } = await axios.get(
            "https://api.github.com/repos/DARKZONE-MD/DARKZONE-MD/commits?per_page=1",
            { timeout: 10000 }
        );
        
        if (latestCommit.sha === currentHash) {
            isUpdating = false;
            return reply("✅ Your bot is already up-to-date!");
        }

        await reply("🚀 New version found! Starting update...");

        // Step 1: Create backup
        await reply("📂 Creating backup...");
        const backupDir = path.join(__dirname, '../backup_' + Date.now());
        fs.mkdirSync(backupDir);
        await copyDirectory(path.join(__dirname, '..'), backupDir);

        // Step 2: Download update
        await reply("⬇️ Downloading update package...");
        const zipPath = path.join(__dirname, '../update_temp.zip');
        const writer = fs.createWriteStream(zipPath);
        
        const response = await axios({
            url: "https://github.com/DARKZONE-MD/DARKZONE-MD/archive/main.zip",
            method: 'GET',
            responseType: 'stream',
            timeout: 30000
        });

        await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Step 3: Extract update
        await reply("📦 Extracting update...");
        const extractDir = path.join(__dirname, '../update_temp');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractDir, true);

        // Step 4: Apply update
        await reply("🔄 Applying update...");
        const updateSource = path.join(extractDir, "DARKZONE-MD-main");
        await applyUpdate(updateSource, path.join(__dirname, '..'));

        // Step 5: Update dependencies if needed
        if (await checkDependenciesChanged(updateSource)) {
            await reply("🛠️ Updating dependencies...");
            child_process.execSync('npm install --production', { 
                cwd: path.join(__dirname, '..'),
                stdio: 'inherit'
            });
        }

        // Step 6: Finalize update
        await setCommitHash(latestCommit.sha);
        fs.unlinkSync(zipPath);
        fs.rmSync(extractDir, { recursive: true, force: true });

        await reply("✅ Update successful! Changes will take effect immediately.");
        isUpdating = false;

    } catch (error) {
        console.error("Update failed:", error);
        await handleUpdateError(error, reply);
        isUpdating = false;
    }
});

// Enhanced update application with proper file handling
async function applyUpdate(source, destination) {
    const filesToUpdate = getUpdateableFiles(source, destination);
    
    for (const file of filesToUpdate) {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);
        
        // Ensure destination directory exists
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        
        // Copy the file
        fs.copyFileSync(srcPath, destPath);
        console.log(`Updated: ${file}`);
    }
}

// Get list of files that need updating (excluding protected files)
function getUpdateableFiles(source, destination) {
    const files = [];
    
    function scanDirectory(dir, relativePath = '') {
        const items = fs.readdirSync(path.join(source, relativePath));
        
        for (const item of items) {
            const fullPath = path.join(source, relativePath, item);
            const relPath = path.join(relativePath, item);
            const destPath = path.join(destination, relPath);
            const stat = fs.statSync(fullPath);

            // Skip protected files/directories
            if (protectedFiles.some(pf => relPath.startsWith(pf))) {
                console.log(`Skipping protected: ${relPath}`);
                continue;
            }

            if (stat.isDirectory()) {
                scanDirectory(dir, relPath);
            } else {
                // Only update if file is different
                if (!fs.existsSync(destPath) || 
                    stat.mtimeMs > fs.statSync(destPath).mtimeMs) {
                    files.push(relPath);
                }
            }
        }
    }
    
    scanDirectory(source);
    return files;
}

// Check if dependencies have changed
async function checkDependenciesChanged(updateSource) {
    try {
        const currentPackage = require(path.join(__dirname, '../package.json'));
        const newPackage = require(path.join(updateSource, 'package.json'));
        
        return JSON.stringify(currentPackage.dependencies) !== JSON.stringify(newPackage.dependencies) ||
               JSON.stringify(currentPackage.devDependencies) !== JSON.stringify(newPackage.devDependencies);
    } catch (e) {
        console.error("Dependency check failed:", e);
        return false;
    }
}

// Handle update errors and attempt recovery
async function handleUpdateError(error, reply) {
    try {
        // Find the most recent backup
        const backupDirs = fs.readdirSync(path.join(__dirname, '..'))
            .filter(dir => dir.startsWith('backup_'))
            .sort()
            .reverse();
        
        if (backupDirs.length > 0) {
            await reply("⚠️ Update failed. Attempting recovery...");
            const latestBackup = path.join(__dirname, '..', backupDirs[0]);
            await copyDirectory(latestBackup, path.join(__dirname, '..'));
            fs.rmSync(latestBackup, { recursive: true, force: true });
            await reply("✅ Recovery successful! Running previous version.");
        } else {
            await reply("❌ Update failed with no backup available. Manual repair needed.");
        }
    } catch (recoveryError) {
        console.error("Recovery failed:", recoveryError);
        await reply("❌ Critical error! Both update and recovery failed. Please reinstall manually.");
    }
}

// Reliable directory copy function
async function copyDirectory(source, target) {
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
    
    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);
        const stat = fs.lstatSync(srcPath);
        
        if (stat.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Auto-update checker (runs every 6 hours)
setInterval(async () => {
    try {
        const currentHash = await getCommitHash();
        const { data: [latestCommit] } = await axios.get(
            "https://api.github.com/repos/DARKZONE-MD/DARKZONE-MD/commits?per_page=1",
            { timeout: 5000 }
        );
        
        if (latestCommit.sha !== currentHash) {
            console.log('🔔 Update available! Commit:', latestCommit.sha.substring(0, 7));
            // Could add notification to bot owner here
        }
    } catch (e) {
        console.log('Update check failed:', e.message);
    }
}, 6 * 60 * 60 * 1000);
