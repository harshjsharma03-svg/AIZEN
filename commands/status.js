async function statusCommand(sock, chatId, message) {
    try {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const statusMessage = `✅ *Bot Status Report*

🤖 *Status:* Online & Active
⏰ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
💾 *Memory:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
🔧 *Node.js:* ${process.version}
📱 *Platform:* ${process.platform}
🚀 *Ready to serve!*

Use .help to see all available commands.`;

        await sock.sendMessage(chatId, {
            text: statusMessage,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '10029Vb7Gh46F1YlLwxJ4UO0q85998@newsletter',
                    newsletterName: 'OPTIMUS_PRIME MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in status command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get status information.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '10029Vb7Gh46F1YlLwxJ4UO0q85998@newsletter',
                    newsletterName: 'OPTIMUS_PRIME MD',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = statusCommand;