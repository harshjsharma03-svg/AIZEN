const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function ttsCommand(sock, chatId, text, message, language = 'en') {
    if (!text) {
        await sock.sendMessage(chatId, { 
            text: 'Please provide text for TTS conversion.\n\nExample: *.tts Hello World*',
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

    try {
        // Show processing message
        await sock.sendMessage(chatId, {
            text: '🔊 Converting text to speech...',
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

        // Try multiple TTS APIs
        const apis = [
            `https://api.erdwpe.com/api/soundoftext?text=${encodeURIComponent(text)}&lang=${language}`,
            `https://translate.google.com/translate_tts?ie=UTF-8&tl=${language}&client=tw-ob&q=${encodeURIComponent(text)}`,
            `https://api.voicerss.org/?key=demo&hl=${language}&src=${encodeURIComponent(text)}&f=48khz_16bit_stereo`
        ];

        let audioBuffer = null;

        for (const api of apis) {
            try {
                console.log(`Trying TTS API: ${api}`);
                const response = await axios.get(api, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.data && response.data.byteLength > 0) {
                    audioBuffer = Buffer.from(response.data);
                    console.log(`✅ TTS API success: ${api}`);
                    break;
                }
            } catch (apiError) {
                console.log(`❌ TTS API failed: ${api} - ${apiError.message}`);
                continue;
            }
        }

        if (audioBuffer) {
            // Create temp directory if it doesn't exist
            const tmpDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            const fileName = `tts-${Date.now()}.mp3`;
            const filePath = path.join(tmpDir, fileName);

            // Save audio file temporarily
            fs.writeFileSync(filePath, audioBuffer);

            await sock.sendMessage(chatId, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: message });

            // Clean up temp file
            try {
                fs.unlinkSync(filePath);
            } catch (cleanupError) {
                console.error('Error cleaning up TTS temp file:', cleanupError);
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to generate TTS audio. All APIs are currently unavailable. Please try again later.',
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
        console.error('Error in TTS command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ An error occurred while generating TTS audio.',
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

module.exports = ttsCommand;
