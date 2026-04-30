import express from 'express';
import { login, register, getMe } from '../controllers/authController.js';

const routeAuth = express.Router();

routeAuth.post('/register', register);
routeAuth.post('/login', login);
routeAuth.get('/me', jwtMiddleware, getMe);

export default routeAuth;