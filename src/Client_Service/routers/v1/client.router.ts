import express from "express";
import clientDependencies from "../../dependencies/dependencies";

import authenticate from "../../../shared/middleware/authenticate.middleware";
import authorize from "../../../shared/middleware/authorize.middleware";
import validate from "../../../shared/validators/common.validator";
import requestLogger from "../../../shared/loggers/request.logger.middleware";
import { asyncHandler } from "../../../shared/utils/helpers/asyncHandler";

import {
    createClientSchema,
    createClientUserSchema,
    createApiKeySchema
} from "../../validation/client.schema";

import { APPLICATION_ROLES } from "../../../shared/constants/roles";

const router = express.Router();

const { controllers } = clientDependencies;
const clientController = controllers.clientController;



router.post(
    "/admin/clients/onboard",
    requestLogger,
    authenticate,
    authorize([APPLICATION_ROLES.SUPER_ADMIN]),
    validate(createClientSchema),
    asyncHandler(clientController.createClient)
);


router.post(
    "/admin/clients/:clientId/users",
    requestLogger,
    authenticate,
    authorize([
        APPLICATION_ROLES.SUPER_ADMIN,
        APPLICATION_ROLES.CLIENT_ADMIN
    ]),
    validate(createClientUserSchema),
    asyncHandler(clientController.createClientUser)
);


router.post(
    "/admin/clients/:clientId/api/keys",
    requestLogger,
    authenticate,
    authorize([
        APPLICATION_ROLES.SUPER_ADMIN,
        APPLICATION_ROLES.CLIENT_ADMIN
    ]),
    validate(createApiKeySchema),
    asyncHandler(clientController.createApiKey)
);


router.get(
    "/admin/clients/:clientId/api/keys",
    requestLogger,
    authenticate,
    authorize([
        APPLICATION_ROLES.SUPER_ADMIN,
        APPLICATION_ROLES.CLIENT_ADMIN,
        APPLICATION_ROLES.CLIENT_VIEWER
    ]),
    asyncHandler(clientController.getClientApiKeys)
);

export default router;