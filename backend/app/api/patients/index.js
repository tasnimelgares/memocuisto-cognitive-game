const { Router } = require('express')
const { Patient } = require('../../models')
const { Note } = require('../../models')
const { Stat } = require('../../models')
const { GameConfig } = require('../../models')
const manageAllErrors = require('../../utils/routes/error-management')

const router = new Router()

router.get('/', (req, res) => {
  try {
    res.status(200).json(Patient.get())
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.get('/:patientId', (req, res) => {
  try {
    res.status(200).json(Patient.getById(req.params.patientId))
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.post('/', (req, res) => {
  try {
    const patient = Patient.create(req.body)
    res.status(201).json(patient)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.put('/:patientId', (req, res) => {
  try {
    const updatedPatient = Patient.update(req.params.patientId, req.body)
    res.status(200).json(updatedPatient)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.delete('/:patientId', (req, res) => {
  try {
    Patient.delete(req.params.patientId)
    res.status(204).end()
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Récupérer les notes/stats/configs d'un patient spécifique : GET /api/patients/1/notes
router.get('/:patientId/notes', (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10)
    const notes = Note.get().filter(n => n.patientId === patientId)
    res.status(200).json(notes)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.get('/:patientId/stats', (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10)
    const stats = Stat.get().filter(s => s.patientId === patientId)
    res.status(200).json(stats)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.get('/:patientId/configs',(req,res) => {
  try {
    const patientIdFromUrl = req.params.patientId.toString()
    const configs = GameConfig.get().find(g => g.patientId.toString() === patientIdFromUrl)
    res.status(200).json(configs)
  } catch (err){
    manageAllErrors(res,err)
  }
})

// Mettre à jour les configs d'un patient
router.put('/:patientId/configs', (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10);
    const allConfigs = GameConfig.get();
    
    // On cherche si une config existe déjà pour ce patient
    const existingConfig = allConfigs.find(c => c.patientId === patientId);

    if (existingConfig) {
      // si existante on met à jour la config existante via son propre ID
      const updated = GameConfig.update(existingConfig.id, { ...req.body, patientId });
      res.status(200).json(updated);
    } else {
      // sinon on crée la config si elle n'existait pas
      const created = GameConfig.create({ ...req.body, patientId });
      res.status(201).json(created);
    }
  } catch (err) {
    manageAllErrors(res, err);
  }
});
module.exports = router