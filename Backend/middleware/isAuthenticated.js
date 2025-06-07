import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        // console.log(token)
        if (!token) {
            return res.status(401).json({ message: "user not authenticated" })
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decode) {
            return res.status(401).json({ message: "invalid token" })
        }
        req.id=decode.userId;
        
        next()
         
    } catch (error) {
        console.log(error)
    }
}
export default isAuthenticated;