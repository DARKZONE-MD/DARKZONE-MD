const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');
const child_process = require('child_process');

// Update state tracking
let isUpdating = false;
let updateQueue = [];

cmd({
    pattern: "update",
    alias: ["upgrade", "sync", "gitpull"],
    react: '🆕',
    desc: "Update the bot to the latest version without downtime",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("This command is only for the bot owner.");
    if (isUpdating) {
        updateQueue.push(message);
        return reply("🔄 Update already in progress. Your request has been queued.");
    }

    try {
        isUpdating = true;
        await reply("🔍 Checking for DARKZONE-MD updates...");

        // Fetch latest commit info
        const { data: commitData } = await axios.get(
            "https://api.github.com/repos/DARKZONE-MD/DARKZONE-MD/commits/main",
            { timeout: 10000 }
        );
        const latestCommitHash = commitData.sha;
        const currentHash = await getCommitHash();

        if (latestCommitHash === currentHash) {
            isUpdating = false;
            return reply("✅ Your DARKZONE-MD bot is already up-to-date!");
        }

        await reply("🚀 New update available! Starting seamless update...");

        // Create backup
        await reply("📂 Creating backup...");
        const backupPath = path.join(__dirname, '../backup_' + Date.now());
        fs.mkdirSync(backupPath);
        copyFolderSync(path.join(__dirname, '..'), backupPath);

        // Download update
        await reply("⬇️ Downloading update package...");
        const zipPath = path.join(__dirname, "../update_temp.zip");
        const writer = fs.createWriteStream(zipPath);
        
        const response = await axios({
            url: "https://github.com/DARKZONE-MD/DARKZONE-MD/archive/main.zip",
            method: 'GET',
            responseType: 'stream',
            timeout: 30000
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Extract update
        await reply("📦 Extracting update...");
        const extractPath = path.join(__dirname, '../update_temp');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        // Apply update
        await reply("🔄 Applying update...");
        const sourcePath = path.join(extractPath, "DARKZONE-MD-main");
        const destinationPath = path.join(__dirname, '..');
        
        safeUpdateFiles(sourcePath, destinationPath);

        // Update dependencies if needed
        await reply("🔧 Checking dependencies...");
        const packageChanged = checkPackageChanges(sourcePath, destinationPath);
        if (packageChanged) {
            await reply("🛠️ Updating dependencies...");
            child_process.execSync('npm install', { cwd: destinationPath, stdio: 'inherit' });
        }

        // Store new commit hash
        await setCommitHash(latestCommitHash);

        // Cleanup
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        // Notify queue
        updateQueue.forEach(msg => {
            client.sendMessage(msg.key.remoteJid, { text: "✅ Update completed successfully!" }, { quoted: msg });
        });
        updateQueue = [];

        await reply("🔄 Update complete! Changes will take effect immediately.");
        isUpdating = false;

    } catch (error) {
        console.error("Update error:", error);
        try {
            // Attempt recovery
            if (backupPath && fs.existsSync(backupPath)) {
                await reply("⚠️ Update failed. Restoring from backup...");
                copyFolderSync(backupPath, path.join(__dirname, '..'));
                fs.rmSync(backupPath, { recursive: true, force: true });
                await reply("✅ Backup restored. Bot is running previous version.");
            }
        } catch (e) {
            console.error("Recovery failed:", e);
            await reply("❌ Critical error! Manual intervention required.");
        } finally {
            isUpdating = false;
            updateQueue.forEach(msg => {
                client.sendMessage(msg.key.remoteJid, { text: "❌ Update failed. Please try manually." }, { quoted: msg });
            });
            updateQueue = [];
        }
    }
});

// Enhanced file operations
function safeUpdateFiles(source, target) {
    const protectedFiles = ['config.js', 'app.json', 'sessions', 'data', 'lib'];
    const skipFiles = protectedFiles.map(f => path.join(target, f));

    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

    fs.readdirSync(source).forEach(item => {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        // Skip protected files/directories
        if (skipFiles.some(skipPath => destPath.startsWith(skipPath))) {
            console.log(`Preserving: ${item}`);
            return;
        }

        const stat = fs.lstatSync(srcPath);
        if (stat.isDirectory()) {
            safeUpdateFiles(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Updated: ${item}`);
        }
    });
}

function checkPackageChanges(source, target) {
    try {
        const newPackage = JSON.parse(fs.readFileSync(path.join(source, 'package.json')));
        const currentPackage = JSON.parse(fs.readFileSync(path.join(target, 'package.json')));

        return JSON.stringify(newPackage.dependencies) !== JSON.stringify(currentPackage.dependencies) ||
               JSON.stringify(newPackage.devDependencies) !== JSON.stringify(currentPackage.devDependencies);
    } catch (e) {
        console.error("Package check failed:", e);
        return false;
    }
}

function copyFolderSync(source, target) {
    if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });

    fs.readdirSync(source).forEach(item => {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);
        const stat = fs.lstatSync(srcPath);

        if (stat.isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

// Auto-update checker
async function checkForUpdates() {
    try {
        const currentHash = await getCommitHash();
        const { data: commitData } = await axios.get(
            "https://api.github.com/repos/DARKZONE-MD/DARKZONE-MD/commits/main",
            { timeout: 5000 }
        );

        if (commitData.sha !== currentHash) {
            console.log('🔔 Update available! Use .update to install');
            // Can add notification logic here
        }
    } catch (e) {
        console.log('Update check failed:', e.message);
    }
}

// Check for updates every 6 hours
setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
checkForUpdates();
