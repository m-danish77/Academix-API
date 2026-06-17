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

// Local Modules
import connectDB from "./configs/mongoose.js";
import authRouter from "./routes/authRouter.js";
import courseRouter from "./routes/courseRouter.js";
import enrollmentRouter from "./routes/enrollmentRouter.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";

const app: Application = express();
const port = config.PORT || 3000;

/**
 * SECURITY MIDDLEWARE: Helmet.js
 * Why this is necessary:
 * By default, Express leaks sensitive infrastructure data via HTTP response headers
 * (e.g., 'X-Powered-By: Express'), making it easier for attackers to target known framework flaws.
 * It Minimizes attack surface by hiding Express signature headers (e.g., X-Powered-By)
 * and setting secure HTTP headers to mitigate XSS, Clickjacking, and MIME-sniffing.
 */
app.use(helmet());

/**
 * SECURITY: CORS (Cross-Origin Resource Sharing)
 * Gatekeeper for browser requests. Restricts API access strictly to trusted
 * frontends, preventing unauthorized cross-origin data leaks and script execution.
 */

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
    console.log(`Server is running at address http://localhost:${port}`);
  });
};
startServer();
