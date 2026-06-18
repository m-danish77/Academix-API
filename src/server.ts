// ✅ 1. IMPORT FIRST – this runs the validation immediately!
import { config } from "./configs/validateEnv.js";

// External Modules
import express, {
  json,
  Request,
  Response,
  NextFunction,
  Application,
} from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import morgan from "morgan";

// Local Modules
import connectDB from "./configs/mongoose.js";
import authRouter from "./routes/authRouter.js";
import courseRouter from "./routes/courseRouter.js";
import enrollmentRouter from "./routes/enrollmentRouter.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import logger from "./configs/logger.js";

const app: Application = express();
const port = config.PORT;

app.use(helmet());

// Only request comming from these urls are allowed
const allowedOrigins = ["http://localhost:3000", "https://yourfrontend.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      // origin comes empty when request comes from mobile application or other than browser like Bruno we want to allow these
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Access denied by CORS security policy"));
      }
    },
    /*
      By default, CORS blocks the transmission of sensitive data across different domains. Setting credentials: true allows your frontend to securely send HTTP cookies, JSON Web Tokens (JWTs) in the authorization header, or session details along with the request. Without this, your authentication system will fail across origins.
    */
    credentials: true,
  }),
);

// Create a stream that Winston understands
const morganStream = {
  write: (message: string) => {
    // Morgan gives us a string. We trim the newline and send it to Winston as 'info level' so it logs nicely
    logger.info(message.trim());
  },
};

// Use morgan with the 'combined' format (standard Apache log format)
// { stream: morganStream }: This is the magic toggle switch. By passing your custom stream object (morganStream) here, you are telling Morgan: "Do not print this information to the terminal screen. Send it directly to the custom write pipeline we built above."
app.use(morgan("combined", { stream: morganStream }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// If someone hits the base_url it should'nt go to the 404 handler
app.get("/", generalLimiter, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Course & Enrollment Management API",
    status: "Healthy",
    timestamp: new Date().toISOString(),
  });
});
// Apply general limit to all API routes below this code
app.use("/api", generalLimiter);
app.use("/api", authRouter);
app.use("/api", courseRouter);
app.use("/api", enrollmentRouter);

// Swagger API Endpoint should be above 404 handler and below all other routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req: Request, res: Response, next: NextFunction) => {
  const err: any = new Error("404 Page Not Found");
  err.status = 404;
  next(err);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // ✅ Log error with request context
  logger.error({
    message: err.message,
    status: err.status || 500,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  const status = err.status || 500;
  const message = err.message || "Something went wrong with server.";

  res.status(status).json({
    success: false,
    message: message,
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    logger.info(`Server is running at address http://localhost:${port}`);
  });
};
startServer();
