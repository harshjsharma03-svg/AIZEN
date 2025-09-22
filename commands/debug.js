const fs = require('fs');
const path = require('path');

async function debugCommand(sock, chatId, message) {
    try {
        // Check if it's from owner
        if (!message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner!',
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
            return;
        }

        // Get list of command files
        const commandsDir = path.join(__dirname);
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
        
        const debugInfo = `🔍 *Debug Information*

📁 *Commands Directory:* ${commandsDir}
📊 *Total Command Files:* ${commandFiles.length}

📋 *Command Files:*
${commandFiles.map(file => `• ${file}`).join('\n')}

⏰ *Bot Uptime:* ${Math.floor(process.uptime())} seconds
💾 *Memory Usage:* ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
🔧 *Node Version:* ${process.version}
🤖 *Bot Status:* ✅ Online`;

        await sock.sendMessage(chatId, {
            text: debugInfo,
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
        console.error('Error in debug command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get debug information.',
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

module.exports = debugCommand;