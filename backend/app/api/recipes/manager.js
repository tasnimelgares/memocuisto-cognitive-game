const { Recipe, Ingredient } = require('../../models')
const NotFoundError = require('../../utils/errors/not-found-error.js')

/**
 * buildRecipeWithIngredients.
 * Cette fonction récupère une recette et remplace les 'ingredientsIds' 
 * par les vrais objets 'Ingredient' correspondants.
 */
const buildRecipeWithIngredients = (recipeId) => {
  // On récupère la recette de base (ça lance une NotFoundError si elle n'existe pas)
  const recipe = Recipe.getById(recipeId)

  // On parcourt les éléments (qui peuvent être des IDs simples ou des tableaux de choix)
  const ingredients = recipe.ingredientsIds.map((item) => {
    
    // CAS 1 : C'est un tableau d'alternatives (ex: [10, 113])
    if (Array.isArray(item)) {
      return item.map((id) => {
        try {
          return Ingredient.getById(id)
        } catch (err) {
          return null
        }
      }).filter((ing) => ing !== null)
    } 
    
    // CAS 2 : C'est un ID classique (ex: 13)
    else {
      try {
        return Ingredient.getById(item)
      } catch (err) {
        // Si un ingrédient a été supprimé entre temps, on l'ignore ou on renvoie null
        return null
      }
    }
  }).filter((ing) => ing !== null && (!Array.isArray(ing) || ing.length > 0))

  // On retourne la recette fusionnée avec les vrais objets ingrédients
  return { ...recipe, ingredients }
}

module.exports = {
  buildRecipeWithIngredients,
}