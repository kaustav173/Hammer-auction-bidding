import { Router } from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
} from "./auth.controller.js";

import { validateRegister, validateLogin } from "./auth.validation.js";

import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validateRegister, registerUser);

router.post("/login", validateLogin, loginUser);

router.post("/refresh", refreshAccessToken);

router.get("/me", authenticate, getCurrentUser);

router.post("/logout", logoutUser);

router.post("/logout-all", logoutAllSessions);

export default router;
