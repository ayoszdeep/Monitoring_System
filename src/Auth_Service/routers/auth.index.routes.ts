import express from "express";
import authRoutes from "./auth.router";

const router = express.Router();

router.use("/", authRoutes);

export default router;