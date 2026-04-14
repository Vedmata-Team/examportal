import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import usersRouter from "./users";
import statesRouter from "./states";
import districtsRouter from "./districts";
import institutionsRouter from "./institutions";
import classesRouter from "./classes";
import chaptersRouter from "./chapters";
import contentRouter from "./content";
import quizzesRouter from "./quizzes";
import examsRouter from "./exams";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(statesRouter);
router.use(districtsRouter);
router.use(institutionsRouter);
router.use(classesRouter);
router.use(chaptersRouter);
router.use(contentRouter);
router.use(quizzesRouter);
router.use(examsRouter);
router.use(dashboardRouter);

export default router;
