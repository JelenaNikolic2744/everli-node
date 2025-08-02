import { NextFunction, Request, Response } from 'express'

import { validatePhoneNumber } from '../service/phoneService.js'

export function validateWitnessReport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { personOrCase, phone } = req.body

  if (!personOrCase || !phone) {
    return res.status(400).json({ error: 'Missing personOrCase or phone' })
  }

  if (!validatePhoneNumber(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }

  next()
}
