const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI
            ?.replace('${dbuser}', process.env.dbuser)
            ?.replace('${dbpass}', process.env.dbpass);

        const conn = await mongoose.connect(mongoURI || process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
