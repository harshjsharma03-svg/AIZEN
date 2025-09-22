const axios = require('axios');
const fetch = require('node-fetch');

async function lyricsCommand(sock, chatId, songTitle) {
    if (!songTitle) {
        await sock.sendMessage(chatId, { 
            text: '🔍 Please enter the song name to get the lyrics!\n\nUsage: *.lyrics <song name>*\nExample: *.lyrics Shape of You*',
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
        // Show loading message
        await sock.sendMessage(chatId, {
            text: '🔍 Searching for lyrics...',
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

        // Try multiple lyrics APIs
        const apis = [
            {
                url: `https://api.erdwpe.com/api/search/lyrics?query=${encodeURIComponent(songTitle)}`,
                parse: (data) => ({
                    title: data.title || songTitle,
                    artist: data.artist || 'Unknown Artist',
                    lyrics: data.lyrics
                })
            },
            {
                url: `https://some-random-api.com/lyrics?title=${encodeURIComponent(songTitle)}`,
                parse: (data) => ({
                    title: data.title || songTitle,
                    artist: data.author || 'Unknown Artist', 
                    lyrics: data.lyrics
                })
            },
            {
                url: `https://api.lyricsfreak.com/v1/lyrics?q=${encodeURIComponent(songTitle)}`,
                parse: (data) => ({
                    title: data.song || songTitle,
                    artist: data.artist || 'Unknown Artist',
                    lyrics: data.lyrics
                })
            }
        ];

        let lyricsData = null;

        for (const api of apis) {
            try {
                console.log(`Trying lyrics API: ${api.url}`);
                
                const response = await axios.get(api.url, {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (response.data) {
                    const parsedData = api.parse(response.data);
                    if (parsedData && parsedData.lyrics) {
                        lyricsData = parsedData;
                        console.log(`✅ Lyrics API success: ${api.url}`);
                        break;
                    }
                }
            } catch (apiError) {
                console.log(`❌ Lyrics API failed: ${api.url} - ${apiError.message}`);
                continue;
            }
        }

        if (lyricsData && lyricsData.lyrics) {
            // Format and send lyrics
            const formattedLyrics = `🎵 *Song Lyrics* 🎶

▢ *Title:* ${lyricsData.title}
▢ *Artist:* ${lyricsData.artist}

📜 *Lyrics:*
${lyricsData.lyrics}

🎧 Hope you enjoy the music! 🎶`;

            // Split message if too long
            if (formattedLyrics.length > 4000) {
                const chunks = formattedLyrics.match(/.{1,3500}/g) || [formattedLyrics];
                for (let i = 0; i < chunks.length; i++) {
                    await sock.sendMessage(chatId, {
                        text: i === 0 ? chunks[i] : `*Continued...*\n\n${chunks[i]}`,
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
            } else {
                await sock.sendMessage(chatId, {
                    text: formattedLyrics,
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
        } else {
            await sock.sendMessage(chatId, { 
                text: `❌ Sorry, I couldn't find any lyrics for "${songTitle}".\n\nTry:\n• Check the spelling\n• Use the full song name\n• Include the artist name\n\nExample: *.lyrics Perfect Ed Sheeran*`,
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
        console.error('Error in lyrics command:', error);
        await sock.sendMessage(chatId, { 
            text: `❌ An error occurred while fetching the lyrics for "${songTitle}". Please try again later.`,
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

module.exports = { lyricsCommand };
