import express from 'express';
import routeAuth from './routes/authRoute.js';
import { jwtMiddleware } from './middlewares/authMiddleware.js';


const app = express();
const port = 8000;

app.use(express.json());

// Routes
app.use('/api/auth', routeAuth);

// Protected Route
app.get('/', jwtMiddleware, (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
