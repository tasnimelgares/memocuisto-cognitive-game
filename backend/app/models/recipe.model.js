const Joi = require('joi')
const BaseModel = require('../utils/base-model.js')

// On définit le schéma pour une étape (équivalent de RecipeStep)
const stepSchema = Joi.object().keys({
  id: Joi.number().required(),
  text: Joi.string().required(),
  order: Joi.number().required(),
  imgPath: Joi.string().allow('', null).optional(), 
  userOrder: Joi.number().optional(),
  highlighted: Joi.boolean().optional()
})

// On exporte le modèle global (équivalent de Recipe)
module.exports = new BaseModel('Recipe', {
  name: Joi.string().required(),
  
  // .valid() permet de restreindre les choix exacts
  category: Joi.string().valid('plat', 'boisson', 'dessert').required(),
  
  // On utilise Joi.alternatives()
  ingredientsIds: Joi.array().items(
    Joi.alternatives().try(
      Joi.number(), // Accepte un ID simple comme nombre (ex: 13)
      Joi.string(), // Accepte un ID simple comme string (au cas où)
      Joi.array().items(Joi.alternatives().try(Joi.number(), Joi.string())) // Accepte un tableau de choix (ex: [10, 113])
    )
  ).required(),
  
  // tableau qui ne contient que des objets "étape" définis au-dessus
  steps: Joi.array().items(stepSchema).required(),
  
  imageUrl: Joi.string().allow('', null).optional(),
  
  patientId: Joi.number().allow(null).optional()
})