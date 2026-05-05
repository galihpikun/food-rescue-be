import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  const {
    fullname,
    email,
    password,
    role, 
    restaurantName,
    restaurantAddress,
    restaurantDescription,
  } = req.body;

  if (!fullname || !email || !password)
    return res.status(400).json({
      message: "tolong lengkapi",
      success: false,
    });

    if (role === "MERCHANT" ) {
      if (!restaurantName || !restaurantAddress) {
        return res.status(400).json({
          message: "name restoran dan alamat wajib diisi",
          success: false,
        });
      }
    }

    const emailExists = await prisma.user.findUnique({
      where: { email: email}
    });

    if (emailExists) {
      return res.status(400).json({
        message: "email sudah terdaftar",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      let userData = {
        fullname: fullname,
        email: email,
        password: hashedPassword,
        role: role === "MERCHANT" ? "MERCHANT" : "CUSTOMER"
      }

      if (role === "MERCHANT") {
        userData.restaurant = {
          create: {
            name: restaurantName,
            address: restaurantAddress,
            description: restaurantDescription || null,
          }
        }
      }

      const user = await prisma.user.create({
        data: userData,
        include: {
          restaurant: true,
        },
      });

      delete user.password // hapus password dari objek user, sebelom dikirim responnya

      return res.status(200).json({
        message: role === "MERCHANT" ? "registrasi restoran berhasil" : "registrasi berhasil",
        data: user,
        success: true,
      })
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "internal server error",
        success: false
      })
    }
  }

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
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

export const getProfile = async (req, res) => {
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

export const editProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullname, password } = req.body;

  try {
    let updateData = {};

    if (fullname){ 
        updateData.fullname = fullname;
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      };

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          message: 'tidak ada perubahan yang terjadi!',
          success: false
        })
      };

      const updateUser = await prisma.user.update({
        where: { id : userId },
        data: updateData,
        select: {
          id: true,
          fullname: true,
          email: true,
          role: true,
          updatedAt: true
        }
      });

      return res.status(200).json({
        message: "profile berhasil di update",
        success: true,
        data: updateUser,
      });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    })
  }
}