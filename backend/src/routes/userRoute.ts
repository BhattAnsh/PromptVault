import { Router, Request, Response } from "express";
import { Login, signup } from "../controllers/authController";
export const usersRouter = Router();

usersRouter.get("/", (req:Request, res:Response) => {
  res.send("this is users route");
});
usersRouter.post("/login", Login);
usersRouter.post("/signup", signup)
