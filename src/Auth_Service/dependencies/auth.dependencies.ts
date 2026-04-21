import { AuthController } from "../controllers/auth.controllers";
import { AuthService } from "../services/auth.service";
import MongoUserRepository from "../repositories/user.repositories";

class Container {
    static init() {
        const repositories = {
            userRepository: MongoUserRepository,
        };

        const services = {
            authService: new AuthService(repositories.userRepository),
        };

        const controller = {
            authController: new AuthController(services.authService),
        };

        return {
            repositories,
            services,
            controller,
        };
    }
}

const initialized = Container.init();

export { Container };
export default initialized;