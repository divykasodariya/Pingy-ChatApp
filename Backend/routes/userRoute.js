import express from 'express'
import { getOtherUsers, getProfile, login, logout, register } from '../controllers/userController.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
const router = express.Router();
router.route("/register").post(register) 
router.route("/login").post(login) 
router.route("/logout").get(logout)
router.route("/").get(isAuthenticated,getOtherUsers);  
// router.route("/auth").post(isAuthenticated)
router.route("/profile").get(isAuthenticated,getProfile);
export default router;