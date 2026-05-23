require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const exportRoutes = require('./routes/exportRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const fertilizerRoutes = require('./routes/fertilizerRoutes');
const mapRoutes = require('./routes/mapRoutes');
const marketRoutes = require('./routes/marketRoutes');
const storeRoutes = require('./routes/storeRoutes');
const communityRoutes = require('./routes/communityRoutes');
const schemeRoutes = require('./routes/schemeRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://crop-disease-detection-phi.vercel.app',
  'https://crop-disease-detection-chi.vercel.app',
  'https://crop-disease-detection-application.vercel.app',
  'https://crop-disease-detection-application-oh22l14f9.vercel.app',
  'https://crop-disease-detection-application-5fkxyxxj6.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/schemes', schemeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const setupSocket = require('./socket');
setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
