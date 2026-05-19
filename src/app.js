import express from 'express';
import cors from 'cors';
import { jwtMiddleware } from './middlewares/authMiddleware.js';
import { Server } from 'socket.io';
import http from 'http';

import routeAuth from './routes/authRoute.js';
import routeRestaurant from './routes/restaurantRoute.js';
import routeProduct from './routes/productRoute.js';
import routeOrder from './routes/orderRoute.js';
import routeCategory from './routes/categoryRoute.js';
import reviewRoute from './routes/reviewRoute.js';

const app = express();
const port = process.env.PORT || 8000; 

const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://foodrescue.web.id',
  'https://foodrescue.web.id' 
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`client terhubung dengan ID Socket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`client disconnect: ${socket.id}`);
  });
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', routeAuth);
app.use('/api/restaurants', routeRestaurant);
app.use('/api/products', routeProduct);
app.use('/api/orders', routeOrder);
app.use('/api/categories', routeCategory);
app.use('/api/reviews', reviewRoute);

// Default Route
app.get('/', (req, res) => {
  res.send('Api Bekerja!')
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});