const Joi = require('joi')
const BaseModel = require('../utils/base-model.js')

module.exports = new BaseModel('Note', {
  patientId: Joi.number().required(),
  date: Joi.string().required(),
  texte: Joi.string().required()
})