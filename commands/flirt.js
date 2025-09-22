const fetch = require('node-fetch');
const axios = require('axios');

async function flirtCommand(sock, chatId, message) {
    try {
        const flirtMessages = [
            "Are you a magician? Because whenever I look at you, everyone else disappears. ✨",
            "Do you have a map? I keep getting lost in your eyes. 😍",
            "Are you WiFi? Because I'm feeling a connection. 📶",
            "If you were a vegetable, you'd be a cute-cumber! 🥒",
            "Are you Google? Because you have everything I've been searching for. 🔍",
            "Do you have a Band-Aid? I just scraped my knee falling for you. 💕",
            "Are you a camera? Because every time I look at you, I smile. 📸",
            "Is your name Google? Because you have everything I've been searching for. 🌟",
            "Are you a parking ticket? Because you've got 'FINE' written all over you. 🎫",
            "If beauty were time, you'd be an eternity. ⏰",
            "Are you made of copper and tellurium? Because you're Cu-Te! ⚗️",
            "Do you believe in love at first sight, or should I walk by again? 👀",
            "Are you a loan from a bank? Because you have my interest! 💰",
            "If I could rearrange the alphabet, I'd put U and I together. 💌",
            "Are you my phone charger? Because without you, I'd die. 🔋"
        ];

        // Try multiple APIs
        let flirtMessage = null;

        // Try API 1
        try {
            const response = await axios.get('https://api.popcat.xyz/pickuplines');
            if (response.data && response.data.pickupline) {
                flirtMessage = `💕 ${response.data.pickupline}`;
            }
        } catch (error) {
            console.log('API 1 failed, trying backup...');
        }

        // Try API 2 if first fails
        if (!flirtMessage) {
            try {
                const response = await fetch('https://rizzapi.vercel.app/random');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.text) {
                        flirtMessage = `💕 ${data.text}`;
                    }
                }
            } catch (error) {
                console.log('API 2 failed, using fallback...');
            }
        }

        // Use random message if APIs fail
        if (!flirtMessage) {
            const randomIndex = Math.floor(Math.random() * flirtMessages.length);
            flirtMessage = flirtMessages[randomIndex];
        }

        // Send the flirt message
        await sock.sendMessage(chatId, { 
            text: flirtMessage,
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
        console.error('Error in flirt command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get flirt message. Please try again later!',
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

module.exports = { flirtCommand }; 