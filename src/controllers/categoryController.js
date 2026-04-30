import { prisma } from "../config/db.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.status(200).json({
      message: " Berhasil fetch Kategori",
      success: true,
      code: 200,
      data: categories
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

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      message: "Nama Kategori wajib diisi",
      success: false,
      code: 400,
    });
  }
  try {
    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });
    return res.status(201).json({
      message: "Kategori berhasil dibuat",
      success: true,
      code: 201,
      data: category,
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
