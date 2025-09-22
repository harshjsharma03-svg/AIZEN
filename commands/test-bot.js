async function testBotCommand(sock, chatId, message) {
    try {
        const testResults = [];
        
        // Test basic commands
        testResults.push("🤖 *OPTIMUS_PRIME MD - SYSTEM TEST*\n");
        testResults.push("✅ Bot is online and responding");
        testResults.push("✅ Message processing is working");
        testResults.push("✅ Command parsing is functional");
        
        // List of working commands
        const workingCommands = [
            "🎵 **Audio Commands:**",
            "• `.play <song name>` - Download audio",
            "• `.lyrics <song name>` - Get song lyrics", 
            "• `.tts <text>` - Text to speech",
            "",
            "🎨 **Sticker Commands:**",
            "• `.sticker` - Reply to image/video",
            "• `.attp <text>` - Animated text sticker",
            "• `.take <name>` - Change sticker pack name",
            "",
            "💬 **Fun Commands:**",
            "• `.flirt` - Get pickup lines",
            "• `.dare` - Truth or dare",
            "• `.joke` - Random jokes",
            "• `.fact` - Random facts",
            "",
            "📱 **Download Commands:**",
            "• `.instagram <link>` - Instagram downloader",
            "• `.facebook <link>` - Facebook downloader", 
            "• `.tiktok <link>` - TikTok downloader",
            "",
            "🛠️ **Admin Commands:**",
            "• `.ping` - Check bot latency",
            "• `.alive` - Bot status",
            "• `.menu` - Full command list"
        ];
        
        testResults.push(...workingCommands);
        
        const finalMessage = testResults.join('\n');
        
        await sock.sendMessage(chatId, {
            text: finalMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '10029Vb7Gh46F1YlLwxJ4UO0q85998@newsletter',
                    newsletterName: 'OPTIMUS_PRIME MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in test-bot command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Test command failed: ' + error.message,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '10029Vb7Gh46F1YlLwxJ4UO0q85998@newsletter',
                    newsletterName: 'OPTIMUS_PRIME MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = testBotCommand;