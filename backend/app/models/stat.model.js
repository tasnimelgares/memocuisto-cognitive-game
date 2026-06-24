const Joi = require('joi')
const BaseModel = require('../utils/base-model.js')

// sur le meme modele que gameresult
module.exports = new BaseModel('Stat', {
  patientId: Joi.number().required(),

  date: Joi.string().required(), 
  isSoloMode: Joi.boolean().required(),
  config: Joi.object().required(),
  
  global: Joi.object().keys({
      tempsTotal: Joi.number().min(0).required()
  }).required(),

  etape1: Joi.object().keys({
    temps: Joi.number().min(0).required(),
    ingredientsBons: Joi.number().min(0).required(),
    ingredientsTotal: Joi.number().min(0).required(),
    aides: Joi.array().items(Joi.string()).required(),
    clicsValides: Joi.number().min(0).required(),
    clicsHorsCible: Joi.number().min(0).required()
  }).required(),

  etape2: Joi.object().keys({
    temps: Joi.number().min(0).required(),
    objetsBienRanges: Joi.number().min(0).required(),
    objetsTotal: Joi.number().min(0).required(),
    aisance: Joi.number().min(0).max(100).required(),
    aisanceMin: Joi.number().min(0).required(),
    aisanceMax: Joi.number().min(0).required(),
    detailsAisanceParObjet: Joi.array().items(Joi.object().keys({
      objetId: Joi.string().required(),
      distanceReelle: Joi.number().required(),
      distanceOptimale: Joi.number().required(),
      ratio: Joi.number().required()
    })).required(),
    aides: Joi.array().items(Joi.string()).required()
  }).required(),

  etape3: Joi.object().keys({
    temps: Joi.number().min(0).required(),
    etapesBienOrdonnees: Joi.number().min(0).required(),
    etapesTotal: Joi.number().min(0).required(),
    recommencements: Joi.number().min(0).required(),
    aides: Joi.array().items(Joi.string()).required()
  }).required()
})

