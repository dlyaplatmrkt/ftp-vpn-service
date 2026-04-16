import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import subscriptionsRouter from "./subscriptions";
import configsRouter from "./configs";
import paymentsRouter from "./payments";
import userRouter from "./user";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(subscriptionsRouter);
router.use(configsRouter);
router.use(paymentsRouter);
router.use(userRouter);

export default router;
