/**
 * @file This script handles the auto-update functionality for the WhatsApp bot.
 * It allows the owner to trigger an update from the chat, which fetches the
 * latest code from a GitHub repository, installs it, and restarts the bot.
 *
 * @dependencies:
 * - axios: To make HTTP requests to the GitHub API.
 * - adm-zip: To handle the extraction of the downloaded .zip file.
 *
 * Make sure you have these packages installed:
 * npm install axios adm-zip
 */

const { cmd } = require("../command");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const AdmZip = require("adm-zip");
const { setCommitHash, getCommitHash } = require('../data/updateDB');

// --- UPDATE COMMAND DEFINITION ---
cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: '🆕',
    desc: "Update the bot to the latest version from the official repository.",
    category: "misc",
    filename: __filename
}, async (client, message, args, { reply, isOwner }) => {

    // 1. Security Check: Ensure only the bot owner can run this command.
    if (!isOwner) {
        return reply("🔒 This command is exclusively for the bot owner.");
    }

    try {
        await reply("🔍 Checking for updates on GitHub...");

        // 2. Fetch Latest Commit: Get the latest commit details from the GitHub repository.
        const repoURL = "https://api.github.com/repos/DARKZONE-MD/DARKZONE-MD/commits/main";
        const { data: commitData } = await axios.get(repoURL);
        const latestCommitHash = commitData.sha;

        // 3. Compare Hashes: Check if the local version is already the latest.
        const currentHash = await getCommitHash();
        if (latestCommitHash === currentHash) {
            return reply("✅ You are already on the latest version of DARKZONE-MD!");
        }

        await reply("🚀 An update is available! Starting the update process...");

        // 4. Download Code: Download the entire repository as a .zip file.
        const downloadURL = "https://github.com/DARKZONE-MD/DARKZONE-MD/archive/main.zip";
        const zipPath = path.join(__dirname, "latest_update.zip"); // Use a more descriptive name
        const { data: zipData } = await axios.get(downloadURL, { responseType: "arraybuffer" });
        fs.writeFileSync(zipPath, zipData);
        await reply("📥 Download complete.");

        // 5. Extract Files: Unzip the downloaded file into a temporary directory.
        await reply("📦 Extracting files...");
        const extractPath = path.join(__dirname, 'latest_update_extracted');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true); // `true` overwrites existing files if any

        // 6. Copy New Files: Replace old files with new ones, preserving critical configs.
        await reply("🔄 Installing the update...");
        const sourcePath = path.join(extractPath, "DARKZONE-MD-main"); // The folder inside the zip
        const destinationPath = path.join(__dirname, '..'); // The root directory of the bot
        copyFolderSync(sourcePath, destinationPath);

        // 7. Update Local Hash: Store the new commit hash to mark the update as complete.
        await setCommitHash(latestCommitHash);

        // 8. Cleanup: Remove the temporary zip file and extracted folder.
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        // 9. Restart Bot: Inform the user and shut down the process.
        // A process manager (like PM2) is required to automatically restart the bot.
        await reply("✅ Update successful! The bot is now restarting...");
        process.exit(0);

    } catch (error) {
        // Generic error handler for any failure during the update process.
        console.error("❌ UPDATE FAILED:", error);
        return reply("❌ The update process failed. Please check the logs or try updating manually.");
    }
});

/**
 * Recursively copies a folder's contents from a source to a target directory.
 * Crucially, it skips specified files like 'config.js' to preserve settings.
 *
 * @param {string} source - The path to the source directory.
 * @param {string} target - The path to the target directory.
 */
function copyFolderSync(source, target) {
    // Files to skip during the update to preserve user configuration.
    const filesToSkip = ["config.js", "app.json"];

    // Ensure the target directory exists.
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    // Get all items (files and folders) from the source directory.
    const items = fs.readdirSync(source);
    for (const item of items) {
        const srcPath = path.join(source, item);
        const destPath = path.join(target, item);

        // Check if the current item should be skipped.
        if (filesToSkip.includes(item)) {
            console.log(`- Skipping '${item}' to preserve custom settings.`);
            continue;
        }

        // If the item is a directory, recurse into it.
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyFolderSync(srcPath, destPath);
        } else {
            // Otherwise, it's a file, so copy it.
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
