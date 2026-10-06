import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gramasevaRouter from "./gramaseva";

const router: IRouter = Router();

router.use(healthRouter);
router.use(gramasevaRouter);

export default router;
