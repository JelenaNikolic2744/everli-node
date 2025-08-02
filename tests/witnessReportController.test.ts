/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleWitnessReport } from '../controller/witnessReportController'
import { checkFbiApiList } from '../service/fbi.service'
import { getCountryFromIp } from '../service/getCountryByIpService'
import {
  getCountryFromPhone,
  validatePhoneNumber,
} from '../service/phoneService'
import { saveReport } from '../service/reportHandler'

jest.mock('../service/fbi.service', () => ({
  checkFbiApiList: jest.fn(),
}))

jest.mock('../service/phoneService', () => ({
  validatePhoneNumber: jest.fn(),
  getCountryFromPhone: jest.fn(),
}))

jest.mock('../service/getCountryByIpService', () => ({
  getCountryFromIp: jest.fn(),
}))

jest.mock('../service/reportHandler', () => ({
  saveReport: jest.fn(),
}))

describe('handleWitnessReport', () => {
  const mockReq = (body: any, ip = '1.2.3.4', headers = {}) => ({
    ip,
    headers,
    body,
  })

  const mockRes = () => {
    const res: any = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if missing fields', async () => {
    const req = mockReq({ phone: '+123456789' })
    const res = mockRes()

    await handleWitnessReport(req as any, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing personOrCase or phone',
    })
  })

  it('returns 400 if no FBI case found', async () => {
    ;(checkFbiApiList as jest.Mock).mockResolvedValue(null)

    const req = mockReq({ personOrCase: 'John', phone: '+123456789' })
    const res = mockRes()

    await handleWitnessReport(req as any, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'No matching case found in FBI database',
    })
  })

  it('returns 400 if phone number invalid', async () => {
    ;(checkFbiApiList as jest.Mock).mockResolvedValue({ title: 'Case' })
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(false)

    const req = mockReq({ personOrCase: 'John', phone: '+123456789' })
    const res = mockRes()

    await handleWitnessReport(req as any, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid phone number' })
  })

  it('saves report with phone country', async () => {
    ;(checkFbiApiList as jest.Mock).mockResolvedValue({ title: 'Case' })
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(true)
    ;(getCountryFromPhone as jest.Mock).mockReturnValue('RS')

    const req = mockReq({ personOrCase: 'John', phone: '+381601234567' })
    const res = mockRes()

    await handleWitnessReport(req as any, res)

    expect(saveReport).toHaveBeenCalledWith(
      expect.objectContaining({
        personOrCase: 'John',
        phone: '+381601234567',
        country: 'RS',
      }),
    )

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Report saved',
      }),
    )
  })

  it('falls back to IP country if phone country is null', async () => {
    ;(checkFbiApiList as jest.Mock).mockResolvedValue({ title: 'Case' })
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(true)
    ;(getCountryFromPhone as jest.Mock).mockReturnValue(null)
    ;(getCountryFromIp as jest.Mock).mockReturnValue('US')

    const req = mockReq(
      { personOrCase: 'John', phone: '+381601234567' },
      '8.8.8.8',
    )
    const res = mockRes()

    await handleWitnessReport(req as any, res)

    expect(saveReport).toHaveBeenCalledWith(
      expect.objectContaining({
        country: 'US',
        ipAddress: '8.8.8.8',
      }),
    )

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Report saved',
      }),
    )
  })

  it('falls back to "Unknown" if no phone or IP country', async () => {
    ;(checkFbiApiList as jest.Mock).mockResolvedValue({ title: 'Case' })
    ;(validatePhoneNumber as jest.Mock).mockReturnValue(true)
    ;(getCountryFromPhone as jest.Mock).mockReturnValue(null)
    ;(getCountryFromIp as jest.Mock).mockReturnValue(null)

    const req = mockReq(
      { personOrCase: 'John', phone: '+381601234567' },
      '8.8.8.8',
    )
    const res = mockRes()

    await handleWitnessReport(req as any, res)

    expect(saveReport).toHaveBeenCalledWith(
      expect.objectContaining({
        country: 'Unknown',
      }),
    )

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Report saved',
      }),
    )
  })
})
