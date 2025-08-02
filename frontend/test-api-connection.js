const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour tester un endpoint
async function testEndpoint(method, endpoint, data = null, description = '') {
  try {
    console.log(`\n🔍 Test: ${description || `${method.toUpperCase()} ${endpoint}`}`);
    
    const response = await api.request({
      method,
      url: endpoint,
      data,
    });
    
    console.log(`✅ Succès: ${response.status} - ${response.statusText}`);
    return true;
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.status || 'Pas de réponse'} - ${error.message}`);
    return false;
  }
}

// Fonction pour tester avec authentification
async function testAuthEndpoint(method, endpoint, token, data = null, description = '') {
  try {
    console.log(`\n🔍 Test Auth: ${description || `${method.toUpperCase()} ${endpoint}`}`);
    
    const response = await api.request({
      method,
      url: endpoint,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log(`✅ Succès: ${response.status} - ${response.statusText}`);
    return true;
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.status || 'Pas de réponse'} - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Test de connectivité avec le backend...\n');
  
  let successCount = 0;
  let totalCount = 0;

  // Test 1: Endpoints publics
  console.log('📋 === ENDPOINTS PUBLICS ===');
  
  totalCount++;
  if (await testEndpoint('GET', '/categories', null, 'Récupérer les catégories')) successCount++;
  
  totalCount++;
  if (await testEndpoint('GET', '/products', null, 'Récupérer les produits')) successCount++;
  
  totalCount++;
  if (await testEndpoint('GET', '/products/best-sellers', null, 'Récupérer les meilleures ventes')) successCount++;
  
  totalCount++;
  if (await testEndpoint('GET', '/products/1', null, 'Récupérer un produit spécifique')) successCount++;

  // Test 2: Authentification
  console.log('\n🔐 === AUTHENTIFICATION ===');
  
  totalCount++;
  if (await testEndpoint('POST', '/auth/register', {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  }, 'Inscription utilisateur')) successCount++;

  // Test 3: Endpoints protégés (sans token)
  console.log('\n🔒 === ENDPOINTS PROTÉGÉS (sans token) ===');
  
  totalCount++;
  if (await testAuthEndpoint('GET', '/auth/profile', 'invalid-token', null, 'Profil utilisateur (token invalide)')) successCount++;
  
  totalCount++;
  if (await testAuthEndpoint('GET', '/orders/my-orders', 'invalid-token', null, 'Mes commandes (token invalide)')) successCount++;
  
  totalCount++;
  if (await testAuthEndpoint('GET', '/wishlist', 'invalid-token', null, 'Liste de souhaits (token invalide)')) successCount++;

  // Test 4: Endpoints admin (sans token)
  console.log('\n👑 === ENDPOINTS ADMIN (sans token) ===');
  
  totalCount++;
  if (await testAuthEndpoint('GET', '/orders', 'invalid-token', null, 'Toutes les commandes (token invalide)')) successCount++;
  
  totalCount++;
  if (await testAuthEndpoint('GET', '/users', 'invalid-token', null, 'Tous les utilisateurs (token invalide)')) successCount++;

  // Résumé
  console.log('\n📊 === RÉSUMÉ ===');
  console.log(`✅ Succès: ${successCount}/${totalCount}`);
  console.log(`❌ Échecs: ${totalCount - successCount}/${totalCount}`);
  console.log(`📈 Taux de réussite: ${((successCount / totalCount) * 100).toFixed(1)}%`);

  if (successCount === totalCount) {
    console.log('\n🎉 Tous les endpoints sont accessibles !');
  } else {
    console.log('\n⚠️  Certains endpoints ne répondent pas correctement.');
    console.log('💡 Vérifiez que le backend est démarré sur http://localhost:3000');
  }
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  console.error('❌ Erreur non gérée:', error.message);
});

// Exécution des tests
runTests().catch(console.error); 