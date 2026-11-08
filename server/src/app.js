const { notFound, errorHandler } = require('./middleware/errorHandler');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const publicRoutes = require('./routes/public');

const app = express();

if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY));

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/public', publicRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;