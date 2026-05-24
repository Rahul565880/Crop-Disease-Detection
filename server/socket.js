const { Server } = require('socket.io');

const connectedUsers = {};
const BOT_NAME = 'CropBot 🤖';
const BOT_DELAY = 1500;

const botResponses = [
  { keywords: ['hello', 'hi', 'hey', 'help'], reply: 'Hello! I\'m CropBot. I can help with:\n🌱 Disease identification\n🧪 Treatment recommendations\n🌿 Organic solutions\n🛡️ Prevention tips\n\nJust describe your crop issue!' },
  { keywords: ['tomato', 'tomato'], reply: '🍅 **Tomato Diseases:**\n• Early Blight — brown spots with target rings\n• Late Blight — water-soaked lesions, white mold\n• Leaf Mold — yellow spots, fuzzy gray underside\n• Bacterial Spot — raised black scabs on leaves/fruit\n\nUpload a leaf photo on the Scan page for detection!' },
  { keywords: ['potato', 'potato'], reply: '🥔 **Potato Diseases:**\n• Late Blight — Irish Famine culprit, white mold\n• Early Blight — target-like spots on lower leaves\n• Common Scab — rough patches on tubers\n\nUse the Upload page to scan affected leaves.' },
  { keywords: ['rice', 'paddy'], reply: '🍚 **Rice Diseases:**\n• Blast — diamond-shaped lesions with gray centers\n• Bacterial Blight — yellow to white stripes\n• Sheath Blight — oval spots on leaf sheaths\n\nEnsure proper drainage and avoid excess nitrogen.' },
  { keywords: ['wheat'], reply: '🌾 **Wheat Diseases:**\n• Rust — orange/red pustules on leaves\n• Blight — tan lesions with dark edges\n• Powdery Mildew — white powdery growth\n\nResistant varieties and fungicide rotation recommended.' },
  { keywords: ['corn', 'maize'], reply: '🌽 **Corn Diseases:**\n• Common Rust — reddish-brown pustules\n• Northern Leaf Blight — long gray-green lesions\n• Gray Leaf Spot — rectangular tan lesions\n\nCrop rotation helps reduce disease pressure.' },
  { keywords: ['cotton'], reply: '🏵️ **Cotton Diseases:**\n• Leaf Curl Virus — leaf curling, stunted growth\n• Bacterial Blight — angular water-soaked spots\n• Boll Rot — browning and rotting of bolls\n\nRemove infected plants to prevent spread.' },
  { keywords: ['chilli', 'chili', 'pepper'], reply: '🌶️ **Chilli Diseases:**\n• Anthracnose — sunken circular spots on fruit\n• Leaf Curl — curling and yellowing of leaves\n• Powdery Mildew — white powdery coating\n\nUse disease-free seeds and practice crop rotation.' },
  { keywords: ['organic', 'natural', 'bio'], reply: '🌿 **Organic Solutions:**\n• Neem oil — broad-spectrum fungicide\n• Bacillus thuringiensis — natural pest control\n• Copper fungicide — controls blights and spots\n• Compost tea — boosts plant immunity\n\nAlways test on a small area first!' },
  { keywords: ['prevent', 'avoid', 'stop'], reply: '🛡️ **Prevention Tips:**\n• Use disease-resistant seed varieties\n• Practice crop rotation (3-4 year cycle)\n• Ensure proper spacing for air circulation\n• Water at soil level, avoid wetting leaves\n• Remove and destroy infected plant debris\n• Monitor crops weekly for early signs' },
  { keywords: ['treatment', 'cure', 'spray', 'chemical'], reply: '🧪 **Chemical Treatments:**\n• Mancozeb — broad-spectrum fungicide\n• Chlorothalonil — controls leaf spots/blights\n• Copper oxychloride — bacterial disease control\n\n⚠️ Always follow label instructions and wear PPE.\nCheck the Fertilizer page for NPK recommendations.' },
  { keywords: ['fertilizer', 'npk', 'nutrient'], reply: '🧪 **Fertilizer Advice:**\nUse the **Fertilizer Calculator** page to get NPK recommendations based on your crop and disease!\n\nGeneral guide:\n• High N (nitrogen) — leafy growth\n• High P (phosphorus) — root/flower/fruit\n• High K (potassium) — disease resistance' },
  { keywords: ['price', 'market', 'sell', 'rate'], reply: '💰 **Market Prices:**\nCheck the **Market Prices** page for current mandi rates across Karnataka markets!\n\nFeatures:\n• Crop-wise price comparison\n• Multiple markets\n• Avg/Low/High price bars' },
  { keywords: ['scheme', 'government', 'subsidy'], reply: '📋 **Government Schemes:**\nCheck the **Schemes** page for:\n• PM-KISAN (₹6000/yr direct benefit)\n• PMFBY (crop insurance)\n• KCC (₹3L credit at 7%)\n• Soil Health Card\n• PMKSY (micro-irrigation subsidy)\n\nAll available with eligibility details!' },
];

function getBotReply(text) {
  const lower = text.toLowerCase();
  for (const { keywords, reply } of botResponses) {
    if (keywords.some(k => lower.includes(k))) return reply;
  }
  return `Thanks for your message! I'm CropBot 🤖\n\nTry asking about:\n🌱 Specific crops (tomato, rice, wheat, cotton, chilli)\n🧪 Treatments & organic solutions\n🛡️ Prevention tips\n💰 Market prices\n📋 Government schemes\n\nOr upload a leaf photo on the **Scan** page for AI disease detection!`;
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const botSocketId = 'bot-' + Date.now();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-chat', ({ userId, userName }) => {
      connectedUsers[socket.id] = { userId, userName };
      socket.join('general');
      io.to('general').emit('user-joined', { userId, userName, online: Object.keys(connectedUsers).length });

      // Bot welcome message
      setTimeout(() => {
        io.to('general').emit('new-message', {
          id: 'bot-welcome-' + Date.now(),
          text: `👋 Hello ${userName}! I'm CropBot. Ask me about crop diseases, treatments, or type "help" to see what I can do!`,
          userId: 'bot',
          userName: BOT_NAME,
          timestamp: new Date().toISOString(),
          isBot: true,
        });
      }, 1000);
    });

    socket.on('send-message', ({ text, userId, userName }) => {
      io.to('general').emit('new-message', {
        id: Date.now().toString(),
        text,
        userId,
        userName,
        timestamp: new Date().toISOString(),
        isBot: false,
      });

      // Auto-reply with bot
      setTimeout(() => {
        const reply = getBotReply(text);
        io.to('general').emit('new-message', {
          id: 'bot-' + Date.now(),
          text: reply,
          userId: 'bot',
          userName: BOT_NAME,
          timestamp: new Date().toISOString(),
          isBot: true,
        });
      }, BOT_DELAY);
    });

    socket.on('typing', ({ userId, userName }) => {
      socket.to('general').emit('user-typing', { userId, userName });
    });

    socket.on('disconnect', () => {
      const user = connectedUsers[socket.id];
      delete connectedUsers[socket.id];
      if (user) {
        io.to('general').emit('user-left', { ...user, online: Object.keys(connectedUsers).length });
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = setupSocket;
