const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
import helmet from 'helmet';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api   ', authRoutes);
app.use('/api/items', itemRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));
