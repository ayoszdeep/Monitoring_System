import express from "express";
import dependencies from "../dependencies/auth.dependencies";
import authorize from "../../shared/middleware/authorize.middleware";
import authenticate from "../../shared/middleware/authenticate.middleware";
import validate from "../../shared/validators/common.validator";
import requestLogger from "../../shared/loggers/request.logger.middleware";
import { asyncHandler } from "../../shared/utils/helpers/asyncHandler";

import {
  onboardSuperAdminSchema,
  loginSchema,
  registrationSchema,
} from "../validation/authSchema";

import { APPLICATION_ROLES } from "../../shared/constants/roles";

const router = express.Router();
const { controller } = dependencies;
const authController = controller.authController;



router.post(
  "/onboard-super-admin",
  requestLogger,
  validate(onboardSuperAdminSchema),
  asyncHandler(authController.onboardSuperAdmin)
);

router.post(
  "/register",
  requestLogger,
  authenticate,
  authorize([APPLICATION_ROLES.SUPER_ADMIN]),
  validate(registrationSchema),
  asyncHandler(authController.register)
);

router.post(
  "/login",
  requestLogger,
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.get(
  "/profile",
  requestLogger,
  authenticate,
  asyncHandler(authController.getProfile)
);

router.get(
  "/logout",
  requestLogger,
  asyncHandler(authController.logout)
);

export default router;