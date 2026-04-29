import { Prisma } from "@prisma/client";

export const createOrder = async (req, res) => {
    const {productId, quantity, deliveryType} = req.body;
    const userId = req.user.id;

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { restaurant: true }
        });

        if (!product) {
            return res.status(404).json({
                message: "makanan gaada",
                success: false
            })
        }

        // validasi stok
        if (product.stock < quantity) {
            return res.status(400).json({
                message: "stok makanan tidak cukup",
                success: false
            })
        }
        
        const itemPrice = product.sellingPrice;
        const subtotal = itemPrice * quantity;

        let platformFeeBuyer = 0;
        let platformFeeSeller = 0;

        if (product.restaurant.totalRevenue > 500000) {
            platformFeeBuyer = 2000; // admin 2k buat pembeli
            platformFeeSeller = Math.round(subtotal * 0.05); // potongan 5 persen buat seller
        }

        const totalPaidByBuyer = subtotal + platformFeeBuyer;
        const netSellerRevenue = subtotal - platformFeeSeller;

        const result = await prisma.$transaction(async (tx) => {
            // 1.buat pesanan
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    productId,
                    itemPrice,
                    quantity,
                    platformFeeBuyer,
                    platformFeeSeller,
                    totalPaidByBuyer,
                    netSellerRevenue,
                    deliveryType,
                    status: "WAITING_PAYMENT",
                }
            })

            await tx.product.update({
                where: { id: productId },
                data: {
                    stock: product.stock - quantity
                }
            });

            return newOrder
        });

        return res.status(201).json({
            success: true,
            message: "Pesanan berhasil dibuat!",
            data: result,
        });

        
    } catch (error) {
        console.error(error);
        return res,status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
    
}