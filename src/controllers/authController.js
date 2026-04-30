import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  // Destructure data dari request body
  const { fullname, email, password } = req.body;

  // Validasi input
  if (!fullname || !email || !password) {
    return res.status(400).json({
      code: 400,
      message: "Please fill all of the fields",
      success: false,
    });
  }

  // if exist check
  const emailExists = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (emailExists) {
    return res.status(400).json({
      code: 400,
      message: "Email sudah ada yang punya, Ubah lol",
      success: false,
    });
  }

  // encrypt password
  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash(password, salt);

  try {
    const user = await prisma.user.create({
      data: {
        fullname: fullname,
        email: email,
        password: hashedPw,
      },
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Berhasil register Data",
      data: user,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  // Destructure data
  const { email, password } = req.body;
  try {
    // If exist check
    const emailExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!emailExists) {
      return res.status(401).json({
        code: 401,
        message: "Invalid Email or password, please reinput",
        success: false,
      });
    }

    // compare password
    const isPwValid = await bcrypt.compare(password, emailExists.password);

    if (!isPwValid) {
      return res.status(400).json({
        code: 401,
        message: "Invalid Email or password, please reinput",
        success: false,
      });
    }

    // Generate TOken JWT
    const token = generateToken({
      id: emailExists.id,
      fullname: emailExists.fullname,
      email: emailExists.email,
      role: emailExists.role
    }, res);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: emailExists.id,
          email: email,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: error.message || "Terjadi kesalahan saat push data",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  // Delete cookie JWT
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return res.status(200).json({
    code: 200,
    success: true,
    message: "Berhasil logout",
  });
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
      }
    })
    if(!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
        success: false
      })
    }

    res.status(200).json({
      data: user,
      success: true,
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}