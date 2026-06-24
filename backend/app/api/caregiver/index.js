const { Router } = require('express');
const { Caregiver } = require('../../models');
const manageAllErrors = require('../../utils/routes/error-management');

const router = new Router();

// Fonction utilitaire pour récupérer le mot de passe (ou le créer s'il n'existe pas encore)
const getCaregiverConfig = () => {
  const configs = Caregiver.get();
  if (configs.length === 0) {
    // Si la "base de données" est vide, on initialise avec le mot de passe par défaut
    return Caregiver.create({ password: "1234" });
  }
  return configs[0]; // On retourne la configuration existante
};

// POST /api/caregiver/verify-password
router.post('/verify-password', (req, res) => {
  try {
    const config = getCaregiverConfig();
    const passwordSaisi = req.body.password;

    if (passwordSaisi === config.password) {
      res.status(200).json({ success: true });
    } else {
      // 401 = Non autorisé
      res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }
  } catch (err) {
    manageAllErrors(res, err);
  }
});

// PUT /api/caregiver/update-password
router.put('/update-password', (req, res) => {
  try {
    const config = getCaregiverConfig();
    const nouveauPassword = req.body.password;

    // On met à jour l'entrée existante avec le nouveau mot de passe
    const updatedConfig = Caregiver.update(config.id, { password: nouveauPassword });
    
    res.status(200).json({ success: true, message: "Mot de passe mis à jour avec succès" });
  } catch (err) {
    manageAllErrors(res, err);
  }
});

module.exports = router;