const Joi = require('joi')
const BaseModel = require('../utils/base-model.js')

module.exports = new BaseModel('Patient', {
  firstName: Joi.string().required(),
  
  lastName: Joi.string().required(),
  
  nickname: Joi.string().allow('', null).optional(),
  
  age: Joi.number().integer().min(0).optional(),
  
  // Gestion de l'objet imbriqué avec Joi.object().keys()
  accessibility: Joi.object().keys({
    isVisuallyImpaired: Joi.boolean().required(),
    isHearingImpaired: Joi.boolean().required()
  }).optional(),
  
  imageUrl: Joi.string().allow('', null).optional()
})