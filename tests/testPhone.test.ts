import {
  getCountryFromPhone,
  parsePhone,
  validatePhoneNumber,
} from '../service/phoneService'

describe('Phone Utilities', () => {
  describe('parsePhone', () => {
    it('should parse a valid phone number', () => {
      const result = parsePhone('+14155552671')
      expect(result).not.toBeNull()
      expect(result?.number).toBe('+14155552671')
    })

    it('should return null for invalid phone', () => {
      const result = parsePhone('123test')
      expect(result).toBeFalsy()
    })
  })

  describe('validatePhoneNumber', () => {
    it('should return true for valid number', () => {
      expect(validatePhoneNumber('+14155552671')).toBe(true)
      expect(validatePhoneNumber('+381601234567')).toBe(true)
    })

    it('should return false for invalid number', () => {
      expect(validatePhoneNumber('12345')).toBe(false)
      expect(validatePhoneNumber('++123')).toBe(false)
    })
  })

  describe('getCountryFromPhone', () => {
    it('should return country code for valid phone', () => {
      expect(getCountryFromPhone('+14155552671')).toBe('US')
      expect(getCountryFromPhone('+381601234567')).toBe('RS')
    })

    it('should return null for invalid phone', () => {
      expect(getCountryFromPhone('not-a-number')).toBeNull()
    })
  })
})
