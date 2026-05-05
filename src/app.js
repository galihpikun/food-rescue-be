import express from 'express';
import cors from 'cors';
import { jwtMiddleware } from './middlewares/authMiddleware.js';

import routeAuth from './routes/authRoute.js';
import routeRestaurant from './routes/restaurantRoute.js';
import routeProduct from './routes/productRoute.js';
import routeOrder from './routes/orderRoute.js';
import routeCategory from './routes/categoryRoute.js';
import reviewRoute from './routes/reviewRoute.js';

const app = express();
const port = 8000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', routeAuth);

app.use('/api/restaurants', routeRestaurant)

app.use('/api/products', routeProduct);

app.use('/api/orders', routeOrder);

app.use('/api/categories', routeCategory);

app.use('/api/reviews', reviewRoute)
// Protected Route
app.get('/', jwtMiddleware, (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
