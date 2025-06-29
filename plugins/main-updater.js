const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const AdmZip = require("adm-zip");

// Configuration
const REPO_URL = "https://github.com/DARKZONE-MD/DARKZONE-MD";
const PROTECTED_FILES = [
    'config.js',
    'app.json',
    'sessions',
    'data',
    'lib',
    'node_modules'
];

// Update state
let isUpdating = false;

cmd({
    pattern: "update",
    alias: ["upgrade", "gitpull"],
    react: '🆕',
    desc: "Safely update bot without downtime",
    category: "owner",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) return reply("❌ Owner only command");
    if (isUpdating) return reply("🔄 Update already in progress");

    try {
        isUpdating = true;
        await reply("🔍 Checking for updates...");

        // Get current commit
        let currentHash;
        try {
            currentHash = (await exec('git rev-parse HEAD', { cwd: __dirname })).stdout.trim();
        } catch {
            currentHash = "unknown";
        }

        // Get latest commit
        const { data: latestCommit } = await axios.get(`${REPO_URL}/commits/main`, {
            timeout: 10000
        });
        
        if (latestCommit.sha === currentHash) {
            isUpdating = false;
            return reply("✅ Bot is already up-to-date!");
        }

        // Start update process
        await reply("🚀 New version found! Starting safe update...");
        
        // Step 1: Create backup
        await reply("📂 Creating backup...");
        const backupDir = path.join(__dirname, '../../backup_' + Date.now());
        await fs.promises.mkdir(backupDir, { recursive: true });
        await copyFolder(__dirname + '/../..', backupDir);

        try {
            // Step 2: Clone fresh copy
            await reply("⬇️ Downloading updates...");
            const tempDir = path.join(__dirname, '../../temp_update');
            await exec(`git clone ${REPO_URL}.git ${tempDir}`, { cwd: __dirname });

            // Step 3: Copy files (excluding protected)
            await reply("🔄 Applying updates...");
            await copyUpdateFiles(tempDir, __dirname + '/../..');

            // Step 4: Update dependencies if needed
            if (await checkDependencies(tempDir)) {
                await reply("🛠️ Updating packages...");
                await exec('npm install --production', { cwd: __dirname + '/../..' });
            }

            // Cleanup
            await fs.promises.rm(tempDir, { recursive: true, force: true });
            await reply("✅ Update successful! Changes applied immediately.");
            
        } catch (updateError) {
            console.error("Update failed:", updateError);
            await reply("⚠️ Update failed! Restoring backup...");
            
            // Restore from backup
            await copyFolder(backupDir, __dirname + '/../..');
            await reply("✅ Backup restored. Running previous version.");
            
            throw updateError;
        } finally {
            // Cleanup backup
            await fs.promises.rm(backupDir, { recursive: true, force: true });
            isUpdating = false;
        }

    } catch (error) {
        console.error("Update process error:", error);
        await reply(`❌ Update failed: ${error.message}`);
        isUpdating = false;
    }
});

// ============== Helper Functions ==============

async function copyFolder(src, dest) {
    await fs.promises.mkdir(dest, { recursive: true });
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (PROTECTED_FILES.includes(entry.name)) {
            continue;
        }

        if (entry.isDirectory()) {
            await copyFolder(srcPath, destPath);
        } else {
            await fs.promises.copyFile(srcPath, destPath);
        }
    }
}

async function copyUpdateFiles(src, dest) {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Skip protected files and directories
        if (PROTECTED_FILES.includes(entry.name)) {
            continue;
        }

        if (entry.isDirectory()) {
            await fs.promises.mkdir(destPath, { recursive: true });
            await copyUpdateFiles(srcPath, destPath);
        } else {
            await fs.promises.copyFile(srcPath, destPath);
        }
    }
}

async function checkDependencies(tempDir) {
    try {
        const currentPkg = require(path.join(__dirname, '../../package.json'));
        const newPkg = require(path.join(tempDir, 'package.json'));
        
        return JSON.stringify(currentPkg.dependencies) !== JSON.stringify(newPkg.dependencies) ||
               JSON.stringify(currentPkg.devDependencies) !== JSON.stringify(newPkg.devDependencies);
    } catch (e) {
        console.error("Dependency check error:", e);
        return false;
    }
}
