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
    const { search = "", page = 1, limit = 10} = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

  const searchCondition = search 
  ? {
    name: {
      contains: search,
      mode: "insensitive",
    }
  } : {}; 

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where: searchCondition,
      skip: skip,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        restaurant: { select: { name: true}},
        category: true
      ,}
    }),
    prisma.product.count({
      where: searchCondition,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limitNumber);

  return res.status(200).json({
    message: "berhasil fetch produk",
    success: true,
    data: products,
    pagination: {
      currentPage: pageNumber,
      totalPages: totalPages,
      totalItems: totalItems,
      limit: limitNumber,
    },
  });
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'internal server error',
      success: false
    });
  }
};

export const editProduct = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;

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

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { restaurant: true },
    });

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
        success: false,
      });
    }

    if (product.restaurant.userId !== userId) {
      return res.status(403).json({
        message: "Kamu tidak berhak mengedit produk ini",
        success: false,
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name || product.name,
        description: description || product.description,
        type: type || product.type,
        originalPrice: originalPrice ? Number(originalPrice) : product.originalPrice,
        sellingPrice: sellingPrice ? Number(sellingPrice) : product.sellingPrice,
        stock: stock !== undefined ? Number(stock) : product.stock, 
        imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
        categoryId: categoryId ? Number(categoryId) : product.categoryId,
        flashSaleStartTime: flashSaleStartTime ? new Date(flashSaleStartTime) : product.flashSaleStartTime,
        flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : product.flashSaleEndTime,
      },
    });

    return res.status(200).json({
      message: "Produk berhasil diperbarui!",
      success: true,
      data: updatedProduct,
    });

  } catch (error) {
    console.error(error);
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