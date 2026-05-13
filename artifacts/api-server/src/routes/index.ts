import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiToolsRouter from "./ai-tools";
import openaiConversationsRouter from "./openai-conversations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiToolsRouter);
router.use(openaiConversationsRouter);

export default router;
