// External Modules
import express, { json, Request, Response } from "express";

// Local Modules
import connectDB from "./configs/mongoose.js";
import authRouter from "./routes/authRouter.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRouter);

app.use((req: Request, res: Response) => {
  res.status(404).send("<h1><center>404 Page Not Found</center></h1>");
});

const port = process.env.PORT || 3000;
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running at address http://localhost:${port}`);
  });
};
startServer();
