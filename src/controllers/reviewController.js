import { prisma } from "../config/db.js";

export const createReview = async (req, res) => {
    const { orderId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            message: 'rating harus dari 1 sampai 5',
            success: false
        })
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId},
            include: { review: true}
        });

        if (!order) {
            return res.status(404).json({
                message: 'order tidak ditemukan',
                success: false
            })
        };

        if (order.userId !== userId) {
            return res.status(400).json({
                message: 'kamu tidak bisa memberikan rating untuk order ini',
                success: false
            })
        }

        if (order.status !== 'COMPLETED') {
            return res.status(400).json({
                message: 'selesai pesanan terlebih dahulu',
                success: false
            })
        };

        if (order.review) {
            return res.status(400).json({
                message: 'kamu sudah memberi rating untuk order ini',
                success: false
            })
        };

        const review = await prisma.review.create({
            data:{
                rating: Number(rating),
                comment: comment || null, // bisa tanpa komen review
                userId,
                productId: order.productId,
                orderId
            }
        });

        res.status(200).json({
            message: 'review berhasil ditambahkan',
            success: true,
            data: review,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'internal server error',
            success: false
        })
    }
}

export const getReviews = async (req, res) => {
    const productId = req.params.id;
    try {
        const review = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { fullname: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.status(201).json({
            message: 'review berhasil diambil',
            success: true,
            data: review,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'internal server error',
            success: false
        });
    }
}

export const updateReview = async (req, res) => {
    const reviewId = req.params.id;
    const { rating, comment} = req.body;
    const userId = req.user.id;

    if (rating && ( rating < 1 || rating > 5)) {
        return res.status(400).json({
            message: 'rating harus antara 1 sampai 5',
            success: false,
        })
    };

    try {
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return res.status(404).json({
                message: 'review tidak ditemukan',
                success: false,
            })
        };

        if (review.userId !== userId) {
            return res.status(400).json({
                message: 'kamu tidak bisa mengedit review orang lain',
                success: false,
            })
        };

        const MAX_EDITS = 1;
        if (review.editCount >= MAX_EDITS) {
            return res.status(400).json({
                message: `ulasan hanya boleh di edit ${MAX_EDITS}x`,
                success: false,
            })
        };

        const MAX_DAYS_TO_EDIT = 30;
        const reviewDate = new Date(review.createdAt);
        const currentDate = new Date();
        const daysDifference = (currentDate.getTime() - reviewDate.getTime()) / (1000 * 3600* 24); // batas waktu 1 bulan (30 hari)

        if (daysDifference > MAX_DAYS_TO_EDIT) {
            return res.status(400).json({
                message: `batas waktu ${MAX_DAYS_TO_EDIT} hari sudah habis, kamu tidak bisa mengeditnya lagi`,
                success: false,
            })
        };

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating: rating ? Number(rating) : review.rating,
                comment: comment !== undefined ? comment : review.comment,
                editCount: { increment: 1},
            }
        });

        return res.status(200).json({
            message: 'ulasan berhasil diperbarui',
            success: true,
            data: updatedReview,
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'internal server error',
            success: false,
        })
    }
}

export const deleteReview = async (req, res) => {
    const reviewId = req.params.id;
    const userId = req.user.id;

    try {
        const review = await prisma.review.findUnique({
            where: {
                id: reviewId,
            }
        });

        if (!review) {
            return res.status(404).json({
                message: 'review tidak ditemukan',
                success: false,
            })
        };

        if (review.userId !== userId) {
            return res.status(400).json({
                message: 'kamu tidak bisa menghapus review orang lain',
                success: false,
            })
        };

        await prisma.review.delete({
            where: {
                id: reviewId,
            }
        });

        return res.status(200).json({
            message: 'ulasan berhasil dihapus',
            success: true,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'internal server error',
            success: false,
        })
    }
}