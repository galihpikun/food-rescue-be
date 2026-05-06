import jwt from "jsonwebtoken";

export function jwtMiddleware(req, res, next) {
  console.log("masuk middleware...");
  let token;
  const headerToken = req.headers.authorization;
  
  if (headerToken && headerToken.startsWith("Bearer ")) {
    token = headerToken.split(" ")[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(";");
    const jwtCookie = cookies.find(c => c.trim().startsWith("jwt="));
    if (jwtCookie) {
      token = jwtCookie.split("=")[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Token tidak ditemukan, akses ditolak",
    });
  }
  // ngecek tokennya bener kaga
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        message: "Token tidak valid, akses ditolak",
      });
    }
    req.user = decoded;
    next();
  });
  // data user ada di decoded
}
