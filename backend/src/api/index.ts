import express from "express";
// import type MessageResponse from "../interfaces/message-response";

import sessions from "./sessions";
import players from "./players";
import play from "./play";

const router = express.Router();

router.use("/sessions", sessions);
router.use("/players", players);
router.use("/play", play);

export default router;
