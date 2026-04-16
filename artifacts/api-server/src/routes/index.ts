import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import subscriptionRouter from "./subscription";
import configsRouter from "./configs";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(subscriptionRouter);
router.use(configsRouter);
router.use(paymentsRouter);

export default router;
