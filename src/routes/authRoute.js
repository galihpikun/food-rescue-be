import express from 'express';
import { login, register } from '../controllers/authController.js';

const routeAuth = express.Router();

routeAuth.post('/register', register);
routeAuth.post('/login', login);

export default routeAuth;