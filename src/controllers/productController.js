// src/controllers/productController.js
import { prisma } from "../config/db.js"

export const createProduct = async (req, res) => {
  const {
    name,
    description,
    type,
    originalPrice,
    sellingPrice,
    stock,
    categoryId,
    flashSaleStartTime,
    flashSaleEndTime,
  } = req.body;

  const imageUrl = req.file ? req.file.path : null; 

  const userId = req.user.id;

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
        originalPrice: Number(originalPrice),
        sellingPrice: Number(sellingPrice),
        stock: stock ? Number(stock) : 1, 
        imageUrl, 
        categoryId: Number(categoryId),
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
    categoryId,
    flashSaleStartTime,
    flashSaleEndTime,
  } = req.body;

  const imageUrl = req.file ? req.file.path : undefined;

  const userId = req.user.id;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { restaurant: true },
    });

    if (!product) {
      return res.status(404).json({ message: "produk tidak ditemukan", success: false });
    }

    if (product.restaurant.userId !== userId) {
      return res.status(403).json({ message: "bukan owner produk ini", success: false });
    }

    const productUpdate = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        type: type || "REGULAR",
        originalPrice: Number(originalPrice), 
        sellingPrice: Number(sellingPrice),   
        stock: stock ? Number(stock) : 1,     
        imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl, 
        categoryId: Number(categoryId), 
        flashSaleStartTime: flashSaleStartTime ? new Date(flashSaleStartTime) : null,
        flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
      },
    });

    return res.status(200).json({
      message: "berhasil mengupdate makanan!",
      success: true,
      data: productUpdate,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  const userId = req.user.id;

  try {
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

export const getProductById = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await prisma.product.findUnique({
      where: {id:productId}
    })

    if (!product) {
      return res.status(404).json({
        message: "produk tidak ditemukan",
        success: false
      });
    }

    return res.status(200).json({
      message: "Produk berhasil ditemukan",
      success: true,
      code: 200,
      data:product
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    }); 
  }
}

export const getProductByCategory = async (req,res) => {
  try {
    const categoryById = req.params.id;
    const product = await prisma.product.findMany({
      where: {categoryId:Number(categoryById)}
    })

    if (!product) {
      return res.status(404).json({
        message: "produk tidak ditemukan",
        success: false
      });
    }

    return res.status(200).json({
      message: "Produk berhasil ditemukan",
      success: true,
      code: 200,
      data:product
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
}

export const getOwnedProducts = async (req, res) => {
  const userId = req.user.id;

  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return res.status(404).json({
        message: "kamu belum punya restaurant",
        success: false,
      });
    }

    const products = await prisma.product.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "berhasil mengambil produk",
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};