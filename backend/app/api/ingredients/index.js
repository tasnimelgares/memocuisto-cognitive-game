const { Router } = require('express')
const { Ingredient } = require('../../models')
const manageAllErrors = require('../../utils/routes/error-management')

const router = new Router()

// Récupérer tous les ingrédients 
router.get('/', (req, res) => {
  try {
    const allIngredients = Ingredient.get()
    const patientId = req.query.patientId 

    if (patientId) {
      // Les ingrédients communs (pas d'id) + ceux du patient
      const filteredIngredients = allIngredients.filter(ing => 
        !ing.patientId || ing.patientId == patientId
      )
      res.status(200).json(filteredIngredients)
    } else {
      // Seulement les ingrédients communs
      const commonIngredients = allIngredients.filter(ing => !ing.patientId)
      res.status(200).json(commonIngredients)
    }
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Récupérer un ingrédient par son ID 
router.get('/:ingredientId', (req, res) => {
  try {
    res.status(200).json(Ingredient.getById(req.params.ingredientId))
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Créer un nouvel ingrédient 
router.post('/', (req, res) => {
  try {
    const ingredient = Ingredient.create(req.body)
    res.status(201).json(ingredient)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Modifier un ingrédient existant
router.put('/:ingredientId', (req, res) => {
  try {
    const updatedIngredient = Ingredient.update(req.params.ingredientId, req.body)
    res.status(200).json(updatedIngredient)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Supprimer un ingrédient 
router.delete('/:ingredientId', (req, res) => {
  try {
    Ingredient.delete(req.params.ingredientId)
    res.status(204).end()
  } catch (err) {
    manageAllErrors(res, err)
  }
})

module.exports = router