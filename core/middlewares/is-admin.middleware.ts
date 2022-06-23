import { Request, Response, NextFunction } from "express";

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
    console.log(124124124);
    const { name, email } = req.body;

    if (name === 'admin' && email === 'admin@test.com') {
        res.locals.isAdmin = true;
    }

    next();

    return;
}
