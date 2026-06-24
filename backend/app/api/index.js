const { Router } = require('express')
const RecipesRouter = require('./recipes')
const IngredientsRouter = require('./ingredients')
const PatientsRouter = require('./patients')
const GameConfigsRouter = require('./game-configs')
const StatsRouter = require('./stats')
const NotesRouter = require('./notes')
const caregiverRouter = require('./caregiver');

const router = new Router()

router.get('/status', (req, res) => res.status(200).json('ok'))

router.use('/recipes', RecipesRouter)
router.use('/ingredients', IngredientsRouter)
router.use('/patients', PatientsRouter)
router.use('/game-configs', GameConfigsRouter)
router.use('/stats', StatsRouter)
router.use('/notes', NotesRouter)
router.use('/caregiver', caregiverRouter)

module.exports = router