const { igdl } = require("ruhend-scraper");
const axios = require('axios');

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

async function instagramCommand(sock, chatId, message) {
    try {
        // Check if message has already been processed
        if (processedMessages.has(message.key.id)) {
            return;
        }
        
        // Add message ID to processed set
        processedMessages.add(message.key.id);
        
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const url = text.split(' ').slice(1).join(' ').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "❓ Please provide an Instagram link.\n\nExample: `.instagram https://www.instagram.com/p/...`",
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

        // Check for various Instagram URL formats
        const instagramPatterns = [
            /https?:\/\/(?:www\.)?instagram\.com\//,
            /https?:\/\/(?:www\.)?instagr\.am\//,
            /https?:\/\/(?:www\.)?instagram\.com\/p\//,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
            /https?:\/\/(?:www\.)?instagram\.com\/tv\//
        ];

        const isValidUrl = instagramPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            return await sock.sendMessage(chatId, { 
                text: "❌ That is not a valid Instagram link. Please provide a valid Instagram post, reel, or video link.",
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

        await sock.sendMessage(chatId, {
            text: "⏳ Downloading Instagram media...",
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

        let downloadData = null;

        // Try multiple APIs
        try {
            // API 1: ruhend-scraper
            downloadData = await igdl(url);
        } catch (error) {
            console.log('API 1 failed, trying backup...');
        }

        // Try API 2 if first fails
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            try {
                const response = await axios.get(`https://api.dreaded.site/api/instagram?url=${encodeURIComponent(url)}`, {
                    timeout: 30000
                });
                if (response.data && response.data.status === 200 && response.data.instagram) {
                    const igData = response.data.instagram;
                    if (igData.media && igData.media.length > 0) {
                        downloadData = { data: igData.media.map(item => ({ url: item.url, type: item.type })) };
                    }
                }
            } catch (error) {
                console.log('API 2 failed, trying backup...');
            }
        }

        // Try API 3 if others fail
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            try {
                const response = await axios.get(`https://api.lolhuman.xyz/api/instagram?apikey=GataDios&url=${encodeURIComponent(url)}`, {
                    timeout: 30000
                });
                if (response.data && response.data.status === 200 && response.data.result) {
                    const result = response.data.result;
                    if (result && Array.isArray(result)) {
                        downloadData = { data: result.map(item => ({ url: item, type: 'unknown' })) };
                    } else if (result && result.link) {
                        downloadData = { data: [{ url: result.link, type: 'unknown' }] };
                    }
                }
            } catch (error) {
                console.log('API 3 failed...');
            }
        }
        
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "❌ No media found at the provided link or all APIs are currently down. Please try again later.",
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

        const mediaData = downloadData.data;
        for (let i = 0; i < Math.min(20, mediaData.length); i++) {
            const media = mediaData[i];
            const mediaUrl = media.url;

            // Check if URL ends with common video extensions
            const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                          media.type === 'video' || 
                          url.includes('/reel/') || 
                          url.includes('/tv/');

            try {
                if (isVideo) {
                    await sock.sendMessage(chatId, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: "📱 *Downloaded by OPTIMUS_PRIME MD*"
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        image: { url: mediaUrl },
                        caption: "📱 *Downloaded by OPTIMUS_PRIME MD*"
                    }, { quoted: message });
                }
            } catch (sendError) {
                console.error('Error sending media:', sendError);
                if (i === 0) { // Only show error for first failed media
                    await sock.sendMessage(chatId, { 
                        text: "❌ Failed to send the media. The file might be too large or corrupted.",
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
        }
    } catch (error) {
        console.error('Error in Instagram command:', error);
        await sock.sendMessage(chatId, { 
            text: "❌ An error occurred while processing the request. Please try again later.",
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

module.exports = instagramCommand; 