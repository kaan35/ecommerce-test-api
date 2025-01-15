import { responseService } from "../services/response.service.js";

export const authMiddleware = {
  authenticate: async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return responseService.send(res, responseService.unauthorized());
    }

    const user = await authService.validateToken(token);
    if (!user) {
      return responseService.send(res, responseService.unauthorized());
    }

    req.user = user;
    next();
  },
};
