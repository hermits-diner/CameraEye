import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import shopRouter from "./shop";
import ordersRouter from "./orders";
import wishlistRouter from "./wishlist";
import newsletterRouter from "./newsletter";
import downloadsRouter from "./downloads";
import instagramRouter from "./instagram";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(shopRouter);
router.use(ordersRouter);
router.use(wishlistRouter);
router.use(newsletterRouter);
router.use(downloadsRouter);
router.use(instagramRouter);
router.use(adminRouter);

export default router;
