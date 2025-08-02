import fs from 'fs/promises'
import * as path from 'path'
import { WitnessReport } from '../model/witnessReportsModel.js'
import { saveReport } from '../service/reportHandler.js'

jest.mock('fs/promises')

const mockedFs = fs as jest.Mocked<typeof fs>
const mockFilePath = path.join(path.resolve('reports'), 'reports.json')

describe('saveReport', () => {
  const mockReport: WitnessReport = {
    personOrCase: 'Jane Doe',
    phone: '+1234567890',
    isValidCase: true,
    country: 'US',
    date: '31.07.2025',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create the directory and write new report to file if file does not exist', async () => {
    mockedFs.mkdir.mockResolvedValue(undefined as never)

    // Simulate file not existing
    const enoentError = new Error('File not found') as NodeJS.ErrnoException
    enoentError.code = 'ENOENT'
    mockedFs.readFile.mockRejectedValueOnce(enoentError)

    mockedFs.writeFile.mockResolvedValue(undefined as never)

    await saveReport(mockReport)

    expect(mockedFs.mkdir).toHaveBeenCalledWith(path.resolve('reports'), { recursive: true })

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      mockFilePath,
      JSON.stringify([mockReport], null, 2),
      'utf-8',
    )
  })

  it('should append to existing reports if file exists', async () => {
    mockedFs.mkdir.mockResolvedValue(undefined as never)

    const existing: WitnessReport[] = [
      {
        personOrCase: 'John Smith',
        phone: '+38160000000',
        isValidCase: false,
        country: 'RS',
        date: '30.07.2025',
      },
    ]

    mockedFs.readFile.mockResolvedValue(JSON.stringify(existing))
    mockedFs.writeFile.mockResolvedValue(undefined as never)

    await saveReport(mockReport)

    expect(mockedFs.writeFile).toHaveBeenCalledWith(
      mockFilePath,
      JSON.stringify([...existing, mockReport], null, 2),
      'utf-8',
    )
  })

  it('should log a warning if file content is invalid JSON', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    mockedFs.mkdir.mockResolvedValue(undefined as never)
    mockedFs.readFile.mockResolvedValue('{ invalid json }')
    mockedFs.writeFile.mockResolvedValue(undefined as never)

    await saveReport(mockReport)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading or parsing existing reports:',
      expect.any(SyntaxError),
    )

    consoleSpy.mockRestore()
  })

  it('should log error if something fails during write', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    mockedFs.mkdir.mockResolvedValue(undefined as never)
    mockedFs.readFile.mockRejectedValue({ code: 'ENOENT' })
    mockedFs.writeFile.mockRejectedValue(new Error('Disk full'))

    await saveReport(mockReport)

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save report:',
      expect.any(Error),
    )

    consoleSpy.mockRestore()
  })
})