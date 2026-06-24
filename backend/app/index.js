const buildServer = require('./build-server.js')
const logger = require('./utils/logger.js')
const seedDatabase = require('./utils/seed.js')

// On exécute la fonction pour créer/remplir les fichiers JSON
seedDatabase()
buildServer((server) => logger.info(`Server is listening on port ${server.address().port}`))
