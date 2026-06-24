const { Router } = require('express')
const { Recipe } = require('../../models')
const manageAllErrors = require('../../utils/routes/error-management')
const { buildRecipeWithIngredients } = require('./manager.js') 

const router = new Router()

// Récupérer les recettes (Communes + celles du patient si fourni)
router.get('/', (req, res) => {
  try {
    const allRecipes = Recipe.get()
    const patientId = req.query.patientId // On cherche si le front a envoyé un ?patientId=X

    if (patientId) {
      // Si on demande pour un patient précis :
      // On garde les recettes communes (sans patientId) et les recettes de ce patient
      const filteredRecipes = allRecipes.filter(recipe => 
        !recipe.patientId || recipe.patientId == patientId
      )
      res.status(200).json(filteredRecipes)
    } else {
      // Si on ne précise pas de patient (ex: espace admin global) :
      // On ne renvoie que les recettes communes
      const commonRecipes = allRecipes.filter(recipe => !recipe.patientId)
      res.status(200).json(commonRecipes)
    }
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Récupérer une recette par son ID 
router.get('/:recipeId', (req, res) => {
  try {
    // On appelle la fonction du manager
    const recipe = buildRecipeWithIngredients(req.params.recipeId)
    res.status(200).json(recipe)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Créer une nouvelle recette
router.post('/', (req, res) => {
  try {
    const recipe = Recipe.create(req.body)
    res.status(201).json(recipe)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Modifier une recette existante
router.put('/:recipeId', (req, res) => {
  try {
    const updatedRecipe = Recipe.update(req.params.recipeId, req.body)
    res.status(200).json(updatedRecipe)
  } catch (err) {
    manageAllErrors(res, err)
  }
})

// Supprimer une recette
router.delete('/:recipeId', (req, res) => {
  try {
    Recipe.delete(req.params.recipeId)
    res.status(204).end()
  } catch (err) {
    manageAllErrors(res, err)
  }
})

module.exports = router