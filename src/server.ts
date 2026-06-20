import app from "./app.js";
import connectDB from "./configs/mongoose.js";
import logger from "./configs/logger.js";
import { config } from "./configs/validateEnv.js";

const startServer = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
    logger.info(`Server is running at address http://localhost:${config.PORT}`);
  });
};
startServer();
