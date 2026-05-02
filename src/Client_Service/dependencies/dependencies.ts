import MongoClientRepository from "../repositories/clientRepository";
import MongoApiKeyRepository from "../repositories/ApiKeyRepository";
import MongoUserRepository from "../../Auth_Service/repositories/user.repositories";
import { ClientService } from "../services/client.service";
import { ClientController } from "../controllers/client.controller";
import authContainer from "../../Auth_Service/dependencies/auth.dependencies";

class Container {
    static init() {
        const repositories = {
            clientRepository: MongoClientRepository,
            apiKeyRepository: MongoApiKeyRepository,
            userRepository: MongoUserRepository
        };

        const services = {
            clientService: new ClientService({
                clientRepository: repositories.clientRepository,
                apiKeyRepository: repositories.apiKeyRepository,
                userRepository: repositories.userRepository
            })
        };

        const controllers = {
            clientController: new ClientController(
                services.clientService,
                authContainer.services.authService
            )
        };

        return { repositories, services, controllers };
    }
}

const initialized = Container.init();

export { Container };
export default initialized;