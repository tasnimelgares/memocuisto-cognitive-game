const Joi = require('joi');
const BaseModel = require('../utils/base-model.js');

module.exports = new BaseModel('GameConfig', {
  id: Joi.number(),
  patientId: Joi.number().required(),// le patient

  // --- Accompagnement ---
  plusEncouragements: Joi.boolean().required(),
  isLargeMode: Joi.boolean().required(),
  modeMalvoyant: Joi.boolean().required(),
  enleverTexteEchec: Joi.boolean().required(),
  popupInactivite: Joi.boolean().required(),

  // --- Recette ---
  difficulte: Joi.string().valid('facile', 'moyen', 'difficile', 'tout').required(),
  maxIngredientsParRayon: Joi.number().integer().min(1).required(),
  budgetActif: Joi.boolean().required(),
  budgetMax: Joi.number().min(0).required(),
  
  // --- Temps --- (Utilisation de alternatives pour gérer nombre ou texte)
  tempsEtape1: Joi.alternatives().try(Joi.number().min(0), Joi.string().valid('illimite')).required(),
  tempsEtape2: Joi.alternatives().try(Joi.number().min(0), Joi.string().valid('illimite')).required(),
  tempsEtape3: Joi.alternatives().try(Joi.number().min(0), Joi.string().valid('illimite')).required(),

  // --- Aides ---
  // --- Aides ---
  helpEnabled: Joi.boolean().required(), 
  timingsAides: Joi.array().items(Joi.number().min(0)).required(),

  // --- Vocal ---
  typeVoix: Joi.string().valid('feminine', 'masculine', 'proche').required(),
  // Gestion d'un objet où on ne connait pas le nom des clés à l'avance
  audios: Joi.object().pattern(Joi.string(), Joi.string()).required(), 
  
  // --- Mode à deux ---
  roleplayActif: Joi.boolean().required(),
  personnaliseActif: Joi.boolean().required(),

  // --- Visuel ---
  theme: Joi.object({
    name: Joi.string().required(),
    hex: Joi.string().allow('').required(), 
    isDefault: Joi.boolean().required(),
    isDark: Joi.boolean().required()
  }).required()
});
