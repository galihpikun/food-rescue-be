export const isMerchant = (req, res, next) => {
    if (req.user && req.user.role === 'MERCHANT') {
        next();
    } else {
        return res.status(403).json({
            message: 'akses ditolak, fitur ini khusus merchant',
            success: false
        })
    }
}