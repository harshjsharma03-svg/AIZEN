const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function attpCommand(sock, chatId, message) {
    try {
        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const text = userMessage.split(' ').slice(1).join(' ').trim();

        if (!text) {
            await sock.sendMessage(chatId, { 
                text: 'Please provide text after the .attp command.\n\nExample: .attp Hello World',
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

        // Show processing message
        await sock.sendMessage(chatId, {
            text: '⏳ Creating animated text sticker...',
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

        // Try multiple ATTP APIs
        const apis = [
            `https://api.erdwpe.com/api/maker/attp?text=${encodeURIComponent(text)}`,
            `https://api.lolhuman.xyz/api/attp?apikey=GataDios&text=${encodeURIComponent(text)}`,
            `https://api.xteam.xyz/attp?text=${encodeURIComponent(text)}&APIKEY=cb15ed422c71a2fb`,
            `https://api.zacros.my.id/randomimg/attp?text=${encodeURIComponent(text)}`
        ];

        let stickerBuffer = null;

        for (const api of apis) {
            try {
                console.log(`Trying ATTP API: ${api}`);
                const response = await axios.get(api, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.data && response.data.byteLength > 0) {
                    stickerBuffer = Buffer.from(response.data);
                    console.log(`✅ ATTP API success: ${api}`);
                    break;
                }
            } catch (apiError) {
                console.log(`❌ ATTP API failed: ${api} - ${apiError.message}`);
                continue;
            }
        }

        if (!stickerBuffer) {
            // Fallback: Create simple text image using a different API
            try {
                const fallbackApi = `https://api.erdwpe.com/api/textpro/matrix?text=${encodeURIComponent(text)}`;
                const response = await axios.get(fallbackApi, { 
                    responseType: 'arraybuffer',
                    timeout: 10000 
                });
                
                if (response.data && response.data.byteLength > 0) {
                    stickerBuffer = Buffer.from(response.data);
                }
            } catch (fallbackError) {
                console.log('Fallback API also failed:', fallbackError.message);
            }
        }

        if (stickerBuffer) {
            await sock.sendMessage(chatId, {
                sticker: stickerBuffer
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to create animated text sticker. All APIs are currently unavailable. Please try again later.',
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

    } catch (error) {
        console.error('Error in ATTP command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while creating the animated text sticker.',
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

module.exports = attpCommand;
