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
        });
    }
    
}

export const getOrders = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        let orders;

        if (userRole === 'CUSTOMER') {
            orders = await prisma.order.findMany({
                where: { userId: userId },
                include: {
                    product: {
                        select: {
                            name : true,
                            imageUrl: true,
                            restaurant: { select: {name: true}}
                        },
                    },
                },
                orderBy : { createdAt: 'desc'}
            });
        } else if (userRole === 'MERCHANT'){
            const restaurant = await prisma.restaurant.findUnique({
                where: { userId: userId }
            });

            if (!restaurant) {
                return res.status(404).json({
                    message: "restoran tidak ditemukan",
                    success: false
                })
            }

            orders = await prisma.order.findMany({
                where: {
                    product: { restaurantId: restaurant.id},
                },
                include: {
                    user: { select: {
                        fullName: true
                    }},
                    product: { 
                        select: {
                            name: true, 
                            type: true
                        }, 
                    },
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return res.status(200).json({
            success: true,
            message: "berhasil mengambil data order",
            data: orders
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const UpdateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole= req.user.role;

    if (userRole === 'MERCHANT') {
        return res.status(403).json({
            success: false,
            message: "role tidak sesuai"
        })
    }

    const validStatuses = ["WAITING_PAYMENT", "PREPARING", "READY_FOR_PICKUP", "ON_THE_WAY", "COMPLETED", "CANCELLED"];

    if(!validStatuses.includes(status)){
        return res.status(400).json({
            success: false,
            message: "status ga valid"
        })
    }

    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { userId}
        });

        const order = await prisma.order.findUnique({
            where: { id: id },
            include: { product: true } 
        });

        if (!order || order.product.restaurant.userId !== userId) {
            return res.status(404).json({
                message: "bukan milikmu ordernya",
                success: false
            })
        }
        
        const updateOrder = await prisma.order.update({
            where: { id: id},
            data: { status: status }
        });

        return res.status(200).json({
            success: true,
            message: `status pesanan berhasil diubah jadi ${status}`,
            data: updateOrder 
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}