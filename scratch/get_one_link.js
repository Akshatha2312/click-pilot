const mongoose = require('mongoose');
const Link = require('../server/models/Link');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Mongo URI not set');
  process.exit(1);
}

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const link = await Link.findOne().lean();
    console.log(JSON.stringify(link, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error', err);
    process.exit(1);
  });
