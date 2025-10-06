import { Router, Request, Response } from "express";
import { Player } from "../models/Player";

const router = Router();

interface CreatePlayerRequest {
    name: string;
}

router.post("/", async (req: Request<{}, {}, CreatePlayerRequest>, res: Response) => {
    if (!req.body.name) {
        return res.status(400).json({ 
            error: "Name is required" 
        });
    }

    const player = new Player({ name: req.body.name });
    await player.save();
    res.json(player);
});

export default router;
