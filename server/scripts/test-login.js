const axios = require('axios');

async function testLogin() {
  const testEmail = 'test2@test.com';
  const testPassword = 'test123'; // Ganti dengan password yang benar

  try {
    console.log('🔐 Testing login...');
    console.log(`Email: ${testEmail}`);
    
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: testEmail,
      password: testPassword
    });

    console.log('\n✅ Login successful!');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.access_token) {
      console.log('\n📝 Token received:', response.data.access_token.substring(0, 50) + '...');
      
      // Test token dengan request ke protected endpoint
      console.log('\n🔒 Testing protected endpoint...');
      try {
        const productsResponse = await axios.get('http://localhost:3000/products', {
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`
          }
        });
        console.log('✅ Protected endpoint accessible');
        console.log(`Products count: ${productsResponse.data?.length || 0}`);
      } catch (error) {
        console.error('❌ Protected endpoint failed:', error.response?.status, error.response?.data?.message || error.message);
      }
    }
  } catch (error) {
    if (error.response) {
      console.error('\n❌ Login failed:');
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('\n❌ Server not reachable');
      console.error('Make sure server is running on http://localhost:3000');
    } else {
      console.error('\n❌ Error:', error.message);
    }
  }
}

testLogin();

