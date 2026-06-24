const Joi = require('joi')
const BaseModel = require('../utils/base-model.js')

module.exports = new BaseModel('Ingredient', {
  name: Joi.string().required(),
  
  selected: Joi.boolean().required(),
  
  // On liste toutes les options possibles
  rayon: Joi.string().valid(
    'frais', 
    'epicerie', 
    'fruit-legume', 
    'boissons', 
    'surgele', 
    'boucherie-poissonnerie', 
    'boulangerie', 
    'epices'
  ).required(),

  zoneStockage: Joi.string().valid(
    'frais',
    'sec',
    'surgele',
    'frais-sec'
  ).required(),
  
  imageUrl: Joi.string().allow('', null).optional(),
  patientId: Joi.alternatives().try(Joi.number(), Joi.string()).allow(null).optional()
})