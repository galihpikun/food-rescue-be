import express from 'express';
import routeAuth from './routes/authRoute.js';
import { jwtMiddleware } from './middlewares/authMiddleware.js';
import routeRestaurant from './routes/restaurantRoute.js';


const app = express();
const port = 8000;

app.use(express.json());

// Routes
app.use('/api/auth', routeAuth);

app.use('/api/restaurants', routeRestaurant)

// Protected Route
app.get('/', jwtMiddleware, (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
