const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function playCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { 
                text: "❓ Please provide a song name to search for.\n\nExample: `.play Shape of You`",
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

        // Send loading message
        await sock.sendMessage(chatId, {
            text: "🔍 Searching for your song...",
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

        // Search for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "❌ No songs found for your search!",
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

        // Get the first video result
        const video = videos[0];
        const urlYt = video.url;

        // Send video info with thumbnail
        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎵 *${video.title}*\n📝 *Channel:* ${video.author.name}\n⏰ *Duration:* ${video.timestamp}\n👀 *Views:* ${video.views}\n\n⏳ _Downloading your audio..._`
        }, { quoted: message });

        let audioUrl = null;
        let audioTitle = video.title;

        // Try multiple APIs
        try {
            // API 1: keith
            const response1 = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`, {
                timeout: 30000
            });
            if (response1.data && response1.data.status && response1.data.result && response1.data.result.downloadUrl) {
                audioUrl = response1.data.result.downloadUrl;
                audioTitle = response1.data.result.title || audioTitle;
            }
        } catch (error) {
            console.log('API 1 failed, trying backup...');
        }

        // Try API 2 if first fails
        if (!audioUrl) {
            try {
                const response2 = await axios.get(`https://api.dreaded.site/api/ytdl/audio?url=${urlYt}`, {
                    timeout: 30000
                });
                if (response2.data && response2.data.result && response2.data.result.download && response2.data.result.download.url) {
                    audioUrl = response2.data.result.download.url;
                    audioTitle = response2.data.result.download.filename || audioTitle;
                }
            } catch (error) {
                console.log('API 2 failed, trying backup...');
            }
        }

        // Try API 3 if others fail
        if (!audioUrl) {
            try {
                const response3 = await axios.get(`https://api.lolhuman.xyz/api/ytaudio2?apikey=GataDios&url=${urlYt}`, {
                    timeout: 30000
                });
                if (response3.data && response3.data.status === 200 && response3.data.result) {
                    audioUrl = response3.data.result.link || response3.data.result;
                }
            } catch (error) {
                console.log('API 3 failed...');
            }
        }

        if (!audioUrl) {
            return await sock.sendMessage(chatId, { 
                text: "❌ Failed to fetch audio from all APIs. Please try again later.",
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

        // Try to send the audio directly first
        try {
            await sock.sendMessage(chatId, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                fileName: `${audioTitle}.mp3`,
                ptt: false
            }, { quoted: message });
            return;
        } catch (directError) {
            console.log('Direct send failed, trying download method...');
        }

        // If direct send fails, download and send
        try {
            const tempDir = path.join(__dirname, '../tmp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`);
            const response = await axios({
                url: audioUrl,
                method: 'GET',
                responseType: 'stream',
                timeout: 60000
            });

            const writer = fs.createWriteStream(tempFile);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Check file size (WhatsApp limit is 16MB for audio)
            const stats = fs.statSync(tempFile);
            if (stats.size > 16 * 1024 * 1024) {
                fs.unlinkSync(tempFile);
                return await sock.sendMessage(chatId, { 
                    text: "❌ Audio file is too large (>16MB). Please try a shorter song.",
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

            // Send the audio file
            await sock.sendMessage(chatId, {
                audio: { url: tempFile },
                mimetype: "audio/mpeg",
                fileName: `${audioTitle}.mp3`,
                ptt: false
            }, { quoted: message });

            // Clean up temp file
            setTimeout(() => {
                try {
                    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                } catch (err) {
                    console.error('Error cleaning up temp file:', err);
                }
            }, 5000);

        } catch (downloadError) {
            console.error('Download method failed:', downloadError);
            await sock.sendMessage(chatId, { 
                text: "❌ Download failed. Please try again later.",
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

    } catch (error) {
        console.error('Error in play command:', error);
        await sock.sendMessage(chatId, { 
            text: "❌ An error occurred. Please try again later.",
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

module.exports = playCommand; 

/*Powered by KNIGHT-BOT*
*Credits to Keith MD*`*/