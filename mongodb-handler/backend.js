const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const addAdmin = require('./utils/addAdmin');
const addDeletion = require('./utils/addDeletion');
const proxyMiddleware = require('./middleware/proxy');
const proxyadminMiddleware = require('./middleware/proxyadmin');
const auth = require('./middleware/auth');
const admin = require('./middleware/admin');


// use dotenv to read MONGODB_ENDPOINT in a .env file, mainly for testing
require('dotenv/config')

const corsOptions ={
  origin:'*', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200,
}

const PORT = process.env.PORT || 4000;
const mongodb_endpoint = process.env.MONGODB_ENDPOINT;
console.log("MongoDB Endpoint: " + mongodb_endpoint);

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();

// Proxy to broker
app.use('/proxy', proxyMiddleware);
app.use('/proxyadmin', auth, admin, proxyadminMiddleware);

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(
  mongodb_endpoint,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => console.log('Connection to MongoDB users database established successfully')
)

addAdmin("admin", process.env.ADMIN_PASSWORD);
addDeletion("1","1");

app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/data', dataRoutes);

app.listen(PORT, function() {
    console.log("User backend server running on Port: " + PORT);
});
