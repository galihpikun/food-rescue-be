import express from 'express';
import routeAuth from './routes/authRouter.js';
import { jwtMiddleware } from './middleware/authMiddleware.js';


const app = express()
const port = 3000

app.use(express.json());
// Cek Bearer
app.use(jwtMiddleware);

// Routes
app.use('/api/auth', routeAuth);

// Original Route
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
