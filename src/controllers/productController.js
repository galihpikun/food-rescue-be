import { prisma } from "../config/db.js";

export const createProduct = async (req, res) => {
    const {name, description, type, originalPrice, sellingPrice, stock, imageUrl, categoryId, flashSaleStartTime, flashSaleEndTime} = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "MERCHANT") {
        return res.status(403).json({
            message: "kamu bukan merchant brok",
            success: false
        })
    }

    try {
        const restaurant = await prisma.restaurant.findUniqueOrThrow({
            where : { userId: userId}
        });

        if (!restaurant) {
            return res.status(404).json({
                message: "anda belum membuat profil restaurant",
                success: false
            })
        }

        if (type === "FLASH_SALE" && (!flashSaleStartTime || !flashSaleEndTime)) {
            return res.status(400).json({
                message: "produk flash wajib memiliki waktu mulai dan akhir",
                success: false
            })
        }

        const product = await prisma.product.create({
            data :{
                name,
                description,
                type: type || "REGULAR",
                originalPrice,
                sellingPrice,
                stock: stock || 1,
                imageUrl,
                categoryId,
                restaurantId: restaurant.id,
                flashSaleStartTime: flashSaleStartTime ? new Date(flashSaleStartTime) : null,
                flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,            
            }
        });

        return res.status(201).json({
            message: "berhasil menambahkan makanan!",
            success: true,
            data: product
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}