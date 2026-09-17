import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";

import { updateCurrentUser, deleteCurrentUser } from "./user.controller.js";

import { validateUpdateUser } from "./user.validation.js";

const router = Router();

router.patch("/me", authenticate, validateUpdateUser, updateCurrentUser);

router.delete("/me", authenticate, deleteCurrentUser);

export default router;
