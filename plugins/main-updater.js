const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: '🆕',
    desc: "Update the bot to the latest version from the official repository.",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {
    if (!isOwner) {
        return reply("🔒 This command is exclusively for the bot owner.");
    }

    try {
        await reply("🔍 Checking for updates on GitHub...");

        // 1. Added timeout to prevent hanging
        const repoURL = "https://api.github.com/repos/DARKZONE-MD/DARKZONE-MD/commits/main";
        const { data: commitData } = await axios.get(repoURL, { timeout: 10000 });
        const latestCommitHash = commitData.sha;

        const currentHash = await getCommitHash();
        if (latestCommitHash === currentHash) {
            return reply("✅ You are already on the latest version of DARKZONE-MD!");
        }

        await reply("🚀 An update is available! Starting the update process...");

        // 2. Added error handling for download
        const downloadURL = "https://github.com/DARKZONE-MD/DARKZONE-MD/archive/main.zip";
        const zipPath = path.join(__dirname, "..", "latest_update.zip"); // Changed path to parent directory
        const response = await axios.get(downloadURL, { 
            responseType: "arraybuffer",
            timeout: 30000 
        });
        fs.writeFileSync(zipPath, response.data);
        await reply("📥 Download complete.");

        // 3. Improved extraction with better error handling
        await reply("📦 Extracting files...");
        const extractPath = path.join(__dirname, "..", 'temp_update');
        try {
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);
        } catch (extractError) {
            console.error("Extraction failed:", extractError);
            throw new Error("Failed to extract update package");
        }

        // 4. More robust file copying
        await reply("🔄 Installing the update...");
        const sourcePath = path.join(extractPath, "DARKZONE-MD-main");
        const destinationPath = path.join(__dirname, ".."); // Bot root directory
        
        // 5. Added delay before copying
        await new Promise(resolve => setTimeout(resolve, 2000));
        copyFolderSync(sourcePath, destinationPath);

        // 6. Update commit hash before cleanup
        await setCommitHash(latestCommitHash);

        // 7. Safer cleanup with error handling
        try {
            fs.unlinkSync(zipPath);
            fs.rmSync(extractPath, { recursive: true, force: true });
        } catch (cleanupError) {
            console.warn("Cleanup warning:", cleanupError);
        }

        // 8. Changed exit approach
        await reply("✅ Update successful! The bot will now restart...");
        setTimeout(() => process.exit(0), 2000);

    } catch (error) {
        console.error("UPDATE ERROR:", error);
        return reply(`❌ Update failed: ${error.message}\nPlease try manually or check logs.`);
    }
});

// Improved folder copy function
function copyFolderSync(source, target) {
    const filesToSkip = ["config.js", "app.json", "data", "session", "database"]; // Added more critical directories
    
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        if (filesToSkip.includes(item)) {
            console.log(`⚠️ Preserving: ${item}`);
            continue;
        }

        try {
            const stat = fs.lstatSync(srcPath);
            if (stat.isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                copyFolderSync(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        } catch (copyError) {
            console.error(`Failed to copy ${item}:`, copyError);
        }
    }
}
