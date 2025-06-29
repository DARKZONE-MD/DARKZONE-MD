const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs-extra');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');
const { execSync } = require('child_process');

// Configuration
const REPO_URL = "https://github.com/DARKZONE-MD/DARKZONE-MD";
const PROTECTED_FILES = [
    'config.js',
    'app.json',
    'sessions/',
    'data/',
    'lib/',
    'node_modules/'
];

// Update state
let updateInProgress = false;
const updateQueue = [];

cmd({
    pattern: "update",
    alias: ["upgrade", "gitpull"],
    react: '🆕',
    desc: "Update bot to latest version",
    category: "owner",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only command");
    if (updateInProgress) {
        updateQueue.push(message);
        return reply("🔄 Update in progress. Queued your request.");
    }

    try {
        updateInProgress = true;
        await reply("🔍 Checking for updates...");

        // Get current and latest commit
        const currentHash = await getCommitHash();
        const latestCommit = await getLatestCommit();
        
        if (latestCommit.sha === currentHash) {
            updateInProgress = false;
            return reply("✅ Bot is already up-to-date!");
        }

        // Start update process
        await reply("🚀 New version available! Starting update...");
        
        // Step 1: Create backup
        await reply("📂 Creating backup...");
        const backupDir = await createBackup();
        
        try {
            // Step 2: Download update
            await reply("⬇️ Downloading update...");
            const zipPath = await downloadUpdate();
            
            // Step 3: Extract update
            await reply("📦 Extracting files...");
            const updateDir = await extractUpdate(zipPath);
            
            // Step 4: Apply update
            await reply("🔄 Applying changes...");
            await applyUpdate(updateDir);
            
            // Step 5: Update dependencies if needed
            if (await dependenciesChanged(updateDir)) {
                await reply("🛠️ Updating packages...");
                updateDependencies();
            }
            
            // Finalize update
            await setCommitHash(latestCommit.sha);
            await cleanup(updateDir, zipPath);
            
            await reply("✅ Update successful! Changes applied.");
            
            // Notify queued requests
            notifyQueue("✅ Update completed successfully!");
            
        } catch (updateError) {
            console.error("Update failed:", updateError);
            await handleFailure(backupDir, reply);
        }
        
    } catch (error) {
        console.error("Update process error:", error);
        await reply(`❌ Update failed: ${error.message}`);
    } finally {
        updateInProgress = false;
    }
});

// ==================== Core Functions ====================

async function getLatestCommit() {
    const { data } = await axios.get(`${REPO_URL}/commits/main`, {
        timeout: 10000,
        headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    return data;
}

async function createBackup() {
    const backupDir = path.join(__dirname, '../../backup_' + Date.now());
    await fs.ensureDir(backupDir);
    await fs.copy(path.join(__dirname, '../..'), backupDir, {
        filter: src => !PROTECTED_FILES.some(pf => src.includes(pf))
    });
    return backupDir;
}

async function downloadUpdate() {
    const zipPath = path.join(__dirname, '../../update_temp.zip');
    const writer = fs.createWriteStream(zipPath);
    
    const response = await axios({
        url: `${REPO_URL}/archive/main.zip`,
        method: 'GET',
        responseType: 'stream',
        timeout: 60000
    });

    await new Promise((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
    });

    return zipPath;
}

async function extractUpdate(zipPath) {
    const extractDir = path.join(__dirname, '../../update_temp');
    await fs.ensureDir(extractDir);
    
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);
    
    return path.join(extractDir, "DARKZONE-MD-main");
}

async function applyUpdate(updateDir) {
    const botDir = path.join(__dirname, '../..');
    const files = await getUpdateableFiles(updateDir, botDir);
    
    for (const file of files) {
        const src = path.join(updateDir, file);
        const dest = path.join(botDir, file);
        await fs.ensureDir(path.dirname(dest));
        await fs.copy(src, dest);
    }
}

async function getUpdateableFiles(source, destination) {
    const files = [];
    
    async function scanDir(currentPath, relativePath = '') {
        const items = await fs.readdir(path.join(source, relativePath));
        
        for (const item of items) {
            const fullPath = path.join(source, relativePath, item);
            const relPath = path.join(relativePath, item);
            const destPath = path.join(destination, relPath);
            const stat = await fs.stat(fullPath);

            // Skip protected files
            if (PROTECTED_FILES.some(pf => relPath.startsWith(pf))) {
                continue;
            }

            if (stat.isDirectory()) {
                await scanDir(currentPath, relPath);
            } else {
                // Only update changed files
                if (!(await fs.pathExists(destPath)) {
                    files.push(relPath);
                } else {
                    const destStat = await fs.stat(destPath);
                    if (stat.mtimeMs > destStat.mtimeMs) {
                        files.push(relPath);
                    }
                }
            }
        }
    }
    
    await scanDir(source);
    return files;
}

async function dependenciesChanged(updateDir) {
    try {
        const currentPkg = require(path.join(__dirname, '../../package.json'));
        const newPkg = require(path.join(updateDir, 'package.json'));
        
        return JSON.stringify(currentPkg.dependencies) !== JSON.stringify(newPkg.dependencies) ||
               JSON.stringify(currentPkg.devDependencies) !== JSON.stringify(newPkg.devDependencies);
    } catch (e) {
        console.error("Dependency check error:", e);
        return false;
    }
}

function updateDependencies() {
    execSync('npm install --production', {
        cwd: path.join(__dirname, '../..'),
        stdio: 'inherit'
    });
}

async function cleanup(updateDir, zipPath) {
    await fs.remove(updateDir);
    await fs.remove(zipPath);
}

async function handleFailure(backupDir, reply) {
    try {
        await reply("⚠️ Update failed! Attempting recovery...");
        
        if (await fs.pathExists(backupDir)) {
            await fs.copy(backupDir, path.join(__dirname, '../..'), {
                overwrite: true
            });
            await fs.remove(backupDir);
            await reply("✅ Recovery successful! Running previous version.");
        } else {
            await reply("❌ Backup not found! Manual recovery needed.");
        }
    } catch (recoveryError) {
        console.error("Recovery failed:", recoveryError);
        await reply("❌ Critical error! Both update and recovery failed.");
    }
}

function notifyQueue(message) {
    updateQueue.forEach(msg => {
        client.sendMessage(msg.key.remoteJid, { text: message }, { quoted: msg });
    });
    updateQueue.length = 0;
}

// Auto-update checker
setInterval(async () => {
    try {
        const currentHash = await getCommitHash();
        const latestCommit = await getLatestCommit();
        
        if (latestCommit.sha !== currentHash) {
            console.log(`🔔 Update available: ${latestCommit.sha.substring(0, 7)}`);
            // Optional: Notify owner about available update
        }
    } catch (e) {
        console.log('Update check failed:', e.message);
    }
}, 6 * 60 * 60 * 1000); // Check every 6 hours
