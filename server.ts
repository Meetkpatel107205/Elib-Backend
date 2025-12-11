import app from './src/app.js';
import { config } from './src/config/config.js';
import connectDB from './src/config/db.js';
const startServer = async () => {

    // Connect database
    await connectDB();

    const port = process.env.PORT || config.port || 3000;

    app.listen(port, () => {
        console.log(`Listening on port: ${port}`);
    });
};

startServer();