const { Router } = require('express')
const { Note } = require('../../models')
const manageAllErrors = require('../../utils/routes/error-management')
const router = new Router()

router.get('/', (req, res) => {
  try { res.status(200).json(Note.get()) } catch (err) { manageAllErrors(res, err) }
})

router.post('/', (req, res) => {
  try {
    const note = Note.create({ ...req.body })
    res.status(201).json(note)
  } catch (err) { manageAllErrors(res, err) }
})

module.exports = router