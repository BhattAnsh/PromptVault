import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI || "mongodb://localhost:27017/PromptVault")
      .then(() => {
        console.log("database is connected");
      });
  } catch (error) {
    console.error("backend not connected");
    console.error({ error: error });
  }
};
