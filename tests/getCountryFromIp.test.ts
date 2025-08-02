import { getCountryFromIp } from '../service/getCountryByIpService'

describe('getCountryFromIp', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    ;(console.error as jest.Mock).mockRestore()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return country code for valid IP', () => {
    // ;(geoip.lookup as jest.Mock).mockReturnValue({ country: 'US' })

    const result = getCountryFromIp('8.8.8.8')
    expect(result).toBe('US')
  })

  it('should return null for unknown IP', () => {
    // ;(geoip.lookup as jest.Mock).mockReturnValue(null)

    const result = getCountryFromIp('0.0.0.0')
    expect(result).toBeNull()
  })
})
