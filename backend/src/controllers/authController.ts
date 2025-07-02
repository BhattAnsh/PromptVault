import { Request, Response } from "express";
import User from "../models/user.model";
export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "email and password required" });
      return;
    }
    
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(401).json({ message: "user not found email is wrong!" });
      return;
    }
    
    const validPass = (await user.comparePassword(password)) as boolean | null;
    if (validPass) {
      res.status(200).json({ message: "Logged in successfully" });
    } else {
      res.status(403).json({ message: "Credentials are wrong" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password || !username) {
      res
        .status(400)
        .json({ message: "username, email and password required" });
        return;
    } else {
      const userExists = await User.findOne({email:email});
      console.log(userExists)
      if (userExists != null){
        res.status(400).json({"message":"Email already exists"});
        return;
      }
      const newUser = new User({name: username, email:email, password:password});
      newUser.save();
      res.status(200).json({"message":"Your account is created!"});
      return;
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server errror" });
    return;
  }
};
