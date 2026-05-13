// External Modules
import express, {
  json,
  Request,
  Response,
  NextFunction,
  Application,
} from "express";
import helmet from "helmet";

// Local Modules
import connectDB from "./configs/mongoose.js";
import authRouter from "./routes/authRouter.js";
import courseRouter from "./routes/courseRouter.js";
import enrollmentRouter from "./routes/enrollmentRouter.js";

const app: Application = express();

/**
 * SECURITY MIDDLEWARE: Helmet.js
 * Why this is necessary:
 * By default, Express leaks sensitive infrastructure data via HTTP response headers
 * (e.g., 'X-Powered-By: Express'), making it easier for attackers to target known framework flaws.
 * It Minimizes attack surface by hiding Express signature headers (e.g., X-Powered-By)
 * and setting secure HTTP headers to mitigate XSS, Clickjacking, and MIME-sniffing.
 */
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRouter);
app.use("/api", courseRouter);
app.use("/api", enrollmentRouter);

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

const port = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running at address http://localhost:${port}`);
  });
};
startServer();
