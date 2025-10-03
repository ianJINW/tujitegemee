import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const authToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken

  if (!token) {
    res.sendStatus(401)
    return
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      res.sendStatus(403)
      return
    }
    req.user = user
    next()
  })
}