const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/events', eventRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
