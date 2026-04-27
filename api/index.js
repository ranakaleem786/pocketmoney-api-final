import "../config/env.js"
import config from "../config/config.js"

import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

import connectDB from '../utils/db.js';
import userRouter from "../routes/user.routes.js"
import adminRouter from '../routes/admin.routes.js'
import bountyRouter from '../routes/bounty.routes.js'

const app = express();


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/bounty", bountyRouter)

app.get('/', (req, res) => {
  res.send("hello Pocket Money")
});

// console.log("Cloud:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("Key:", process.env.CLOUDINARY_API_KEY);

connectDB();

app.listen(config.port, () => {
  console.log(`server is running on http://localhost:${config.port}`)
});



export default app;
