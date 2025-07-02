import express from "express";
import { usersRouter } from "./routes/userRoute";
import { connectDb } from "./db/db";

const app = express();
app.use(express.json());
app.use("/api/users", usersRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  connectDb();
});
