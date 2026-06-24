const { Router } = require('express')
const { GameConfig } = require('../../models')
const manageAllErrors = require('../../utils/routes/error-management')

const router = new Router()

router.get('/', (req, res) => {
  try {
    res.status(200).json(GameConfig.get())
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.get('/:configId', (req, res) => {
  try {
    res.status(200).json(GameConfig.getById(req.params.configId))
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.post('/', (req, res) => {
  try {
    const config = GameConfig.create(req.body)
    res.status(201).json(config)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.put('/:configId', (req, res) => {
  try {
    const updatedConfig = GameConfig.update(req.params.configId, req.body)
    res.status(200).json(updatedConfig)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

router.delete('/:configId', (req, res) => {
  try {
    GameConfig.delete(req.params.configId)
    res.status(204).end()
  } catch (err) {
    manageAllErrors(res, err)
  }
})

module.exports = router