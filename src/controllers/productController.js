import { prisma } from "../config/db.js";

export const createProduct = async (req, res) => {
  const {
    name,
    description,
    type,
    originalPrice,
    sellingPrice,
    stock,
    imageUrl,
    categoryId,
    flashSaleStartTime,
    flashSaleEndTime,
  } = req.body;

  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== "MERCHANT") {
    return res.status(403).json({
      message: "kamu bukan merchant brok",
      success: false,
    });
  }

  try {
    const restaurant = await prisma.restaurant.findUniqueOrThrow({
      where: { userId: userId },
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "anda belum membuat profil restaurant",
        success: false,
      });
    }

    if (type === "FLASH_SALE" && (!flashSaleStartTime || !flashSaleEndTime)) {
      return res.status(400).json({
        message: "produk flash wajib memiliki waktu mulai dan akhir",
        success: false,
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        type: type || "REGULAR",
        originalPrice,
        sellingPrice,
        stock: stock || 1,
        imageUrl,
        categoryId,
        restaurantId: restaurant.id,
        flashSaleStartTime: flashSaleStartTime
          ? new Date(flashSaleStartTime)
          : null,
        flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
      },
    });

    return res.status(201).json({
      message: "berhasil menambahkan makanan!",
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    return res.status(200).json({
      message: "Berhasil fetch produk",
      success: true,
      code: 200,
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      code: 500,
    });
  }
};

export const getFlashSalesProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        type: "FLASH_SALE",
      },
    });

    return res.status(200).json({
      message: "Berhasil fetch produk",
      success: true,
      code: 200,
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      code: 500,
    });
  }
};

export const editProduct = async (req, res) => {
  const productId = req.params.id;
  const {
    name,
    description,
    type,
    originalPrice,
    sellingPrice,
    stock,
    imageUrl,
    categoryId,
    flashSaleStartTime,
    flashSaleEndTime,
  } = req.body;

  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== "MERCHANT") {
    return res.status(403).json({
      message: "kamu bukan merchant brok",
      success: false,
    });
  }

  try {
    // Ambil info produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        restaurant: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "produk tidak ditemukan",
        success: false,
      });
    }

    // Validasi cek owner produknya bukan
    if (product.restaurant.userId !== userId) {
      return res.status(403).json({
        message: "bukan owner produk ini",
        success: false,
      });
    }

    const productUpdate = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        type: type || "REGULAR",
        originalPrice,
        sellingPrice,
        stock: stock || 1,
        imageUrl,
        categoryId,
        restaurantId: restaurant.id,
        flashSaleStartTime: flashSaleStartTime
          ? new Date(flashSaleStartTime)
          : null,
        flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
      },
    });

    return res.status(201).json({
      message: "berhasil menambahkan makanan!",
      success: true,
      data: productUpdate,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      code: 500,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== "MERCHANT") {
    return res.status(403).json({
      message: "kamu bukan merchant brok",
      success: false
    });
  }

  try {
    // Cek Produk
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        restaurant: true
      }
    });

    if (!product) {
      return res.status(404).json({
        message: "produk tidak ditemukan",
        success: false
      });
    }

    // Validasi cek owner produknya bukan
    if (product.restaurant.userId !== userId) {
      return res.status(403).json({
        message: "bukan owner produk ini",
        success: false,
      });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return res.status(200).json({
      message: "produk berhasil dihapus",
      success: true
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};