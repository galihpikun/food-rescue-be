    import { prisma } from "../config/db.js";

    export const createRestaurant = async (req, res) => {
        const {name, address, description} = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // validasi role (role merchant doang yang boleh create resto)
        if (userRole !== 'MERCHANT') {
            return res.status(403).json({
                success: false,
                message: "role tidak sesuai, tidak boleh membuat resto"
            })
        }

        // validasi field
        if (!name || !address) {
            return res.status(400).json({
                success: false,
                message: "belom lengkap"
            })
        }

        try {
            const existingResto = await prisma.restaurant.findUnique({
                where: {
                    userId: userId
                }
            });

            if (existingResto) {
                return res.status(400).json({
                    success: false,
                    message: "restoran udah ada"
                });
            }

            const restaurant = await prisma.restaurant.create({
                data: {
                    name: name,
                    address: address,
                    description: description || null,
                    userId: userId
                }
            });

            return res.status(200).json({
                success: true,
                message: "Restoran berhasil dibuat",
                data: restaurant
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            })
        }
    }

    export const getRestaurantById = async (req, res) => {
        const { id } = req.params;

        try {
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: id},
                include: {
                    products: true, // return semua produk yg ada di resto ini
                }, 
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: "resto ga ada"
                })
            }

            return res.status(200).json({
                success: true,
                message: "resto ditemukan",
                data: restaurant
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            })
        }
    }