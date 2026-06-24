const { Router } = require('express')
const { Stat } = require('../../models')
const manageAllErrors = require('../../utils/routes/error-management')

const router = new Router()

/**
 * GET /api/stats
 * Récupère l'intégralité des statistiques de la base de données.
 */
router.get('/', (req, res) => {
  try {
    res.status(200).json(Stat.get())
  } catch (err) {
    manageAllErrors(res, err)
  }
})

/**
 * GET /api/stats/patient/:patientId
 * Récupère uniquement les parties jouées par UN patient spécifique.
 * C'est cette route que l'écran de statistiques utilise.
 */
router.get('/patient/:patientId', (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId, 10)
    const allStats = Stat.get()

    const patientStats = allStats.filter(stat => stat.patientId === patientId)
    res.status(200).json(patientStats)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

/**
 * GET /api/stats/:statId
 * Récupère le détail d'une seule session de jeu par son ID.
 */
router.get('/:statId', (req, res) => {
  try {
    res.status(200).json(Stat.getById(req.params.statId))
  } catch (err) {
    manageAllErrors(res, err)
  }
})

/**
 * POST /api/stats
 * Enregistre dans notre bd une nouvelle partie qui vient de se terminer.
 */
router.post('/', (req, res) => {
  try {
    const stat = Stat.create(req.body)
    res.status(201).json(stat)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

/**
 * DELETE /api/stats/:statId
 * Supprime une session de jeu de l'historique.
 */
router.delete('/:statId', (req, res) => {
  try {
    Stat.delete(req.params.statId)
    res.status(204).end()
  } catch (err) {
    manageAllErrors(res, err)
  }
})

/**
 * DELETE /api/stats
 * Supprime tout l'historique
 */
router.delete('/', (req, res) => {
  try {
    Stat.deleteAll()
    res.status(204).end()
  } catch (err) {
    manageAllErrors(res, err)
  }
})

module.exports = router