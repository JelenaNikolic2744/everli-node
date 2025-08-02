import express from 'express'

import { handleWitnessReport } from '../controller/witnessReportController.js'
import { validateWitnessReport } from '../middleware/validateWitnessReport.js'

const router = express.Router()

router.post('/witness-report', validateWitnessReport, handleWitnessReport)

export { router }
