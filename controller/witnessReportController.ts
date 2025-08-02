import { Request, Response } from 'express'

import { WitnessReport } from '../model/witnessReportsModel.js'
import { checkFbiApiList } from '../service/fbi.service.js'
import { getCountryFromIp } from '../service/getCountryByIpService.js'
import {
  getCountryFromPhone,
  validatePhoneNumber,
} from '../service/phoneService.js'
import { saveReport } from '../service/reportHandler.js'

export async function handleWitnessReport(req: Request, res: Response) {
  const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || ''
  const { personOrCase, phone } = req.body

  if (!personOrCase || !phone) {
    return res.status(400).json({ error: 'Missing personOrCase or phone' })
  }

  const fbiCase = await checkFbiApiList(personOrCase)
  if (!fbiCase) {
    return res
      .status(400)
      .json({ error: 'No matching case found in FBI database' })
  }

  if (!validatePhoneNumber(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }

  let country = getCountryFromPhone(phone)
  if (!country) {
    country = getCountryFromIp(ipAddress) ?? 'Unknown'
  }

  const report: WitnessReport = {
    personOrCase,
    phone,
    country,
    isValidCase: true,
    ipAddress,
    date: new Date().toLocaleDateString('sr-RS'),
  }

  await saveReport(report)

  res.json({ message: 'Report saved', report })
}
