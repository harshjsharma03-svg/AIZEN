const fetch = require('node-fetch');
const axios = require('axios');

async function dareCommand(sock, chatId, message) {
    try {
        const dareMessages = [
            "Send a screenshot of your phone's home screen. 📱",
            "Post an embarrassing photo of yourself. 📸",
            "Call the last person you texted and sing 'Happy Birthday'. 🎂",
            "Do 20 push-ups right now. 💪",
            "Text your crush 'I have a confession to make...' and don't explain for 1 hour. 💕",
            "Post a status saying 'I lost a bet' for 24 hours. 😅",
            "Let the group choose your profile picture for a week. 🖼️",
            "Eat a spoonful of salt. 🧂",
            "Do your best impression of your favorite celebrity. 🎭",
            "Sing the chorus of your favorite song. 🎵",
            "Dance for 30 seconds without music. 💃",
            "Call your mom and tell her you love her. ❤️",
            "Take a selfie making the weirdest face you can. 🤪",
            "Do 50 jumping jacks. 🏃‍♂️",
            "Speak in a British accent for the next 10 minutes. 🇬🇧",
            "Post a childhood photo of yourself. 👶",
            "Do the chicken dance. 🐔",
            "Eat something without using your hands. 🍎",
            "Text your ex 'I miss you' (just kidding, don't actually do this! 😂)",
            "Make up a 30-second song about the person to your left. 🎼"
        ];

        // Try multiple APIs
        let dareMessage = null;

        // Try API 1
        try {
            const response = await axios.get('https://api.truthordarebot.xyz/v1/dare');
            if (response.data && response.data.question) {
                dareMessage = `🔥 ${response.data.question}`;
            }
        } catch (error) {
            console.log('API 1 failed, trying backup...');
        }

        // Try API 2 if first fails
        if (!dareMessage) {
            try {
                const response = await fetch('https://api.truthordare.vip/dare');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.question) {
                        dareMessage = `🔥 ${data.question}`;
                    }
                }
            } catch (error) {
                console.log('API 2 failed, using fallback...');
            }
        }

        // Use random message if APIs fail
        if (!dareMessage) {
            const randomIndex = Math.floor(Math.random() * dareMessages.length);
            dareMessage = `🔥 ${dareMessages[randomIndex]}`;
        }

        // Send the dare message
        await sock.sendMessage(chatId, { 
            text: dareMessage,
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
        console.error('Error in dare command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to get dare. Please try again later!',
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

module.exports = { dareCommand };
