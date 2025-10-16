// main entry point for the backend server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to the database
connectDB();

// MiddleWare setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads',express.static('uploads'));

//Routes
app.use('/api/dolls', require('./routes/doll.routes'));
app.use('/api/upload', require('./routes/upload.routes'));

//Health check endpoint
app.get('/', (req, res) =>{
    res.send({message: 'Voodoo Doll API is running!'});
})

// Error handling Middleware
app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).json({message: 'Something went wrong!', error: err.message});
})

// Import error middleware
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { handleMulterError } = require('./middleware/upload.middleware');

// Handle Multer errors
app.use(handleMulterError);

// Handle 404 errors (must be after all routes)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT,() =>{
    console.log(`Server is running on port ${PORT}`);
})

