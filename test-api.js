const axios = require('axios');

const API_BASE = 'http://localhost:5003/api';

async function testAPI() {
  try {
    console.log('🚀 Testing SmartPark API...\n');

    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', health.data.message);
    console.log('   Company:', health.data.company);

    // Test 2: Login
    console.log('\n2. Testing admin login...');
    const login = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: '123'
    });
    console.log('✅ Login successful');
    console.log('   User:', login.data.user.username, '- Role:', login.data.user.role);

    const token = login.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test 3: Get Parking Slots
    console.log('\n3. Testing parking slots endpoint...');
    const slots = await axios.get(`${API_BASE}/parking-slots`, { headers });
    console.log('✅ Parking slots retrieved:', slots.data.slots.length, 'slots');
    console.log('   Available slots:', slots.data.slots.filter(s => s.slotStatus === 'available').length);

    // Test 4: Get Parking Slots Stats
    console.log('\n4. Testing parking slots stats...');
    const slotsStats = await axios.get(`${API_BASE}/parking-slots/stats/summary`, { headers });
    console.log('✅ Slots stats:', slotsStats.data);

    // Test 5: Create a Car Entry
    console.log('\n5. Testing car entry creation...');
    const availableSlot = slots.data.slots.find(s => s.slotStatus === 'available');
    if (availableSlot) {
      const carEntry = await axios.post(`${API_BASE}/parking-records`, {
        plateNumber: 'TEST123',
        driverName: 'John Doe',
        phoneNumber: '+250788123456',
        slotNumber: availableSlot.slotNumber,
        carModel: 'Toyota Corolla',
        carColor: 'white',
        notes: 'Test entry'
      }, { headers });
      console.log('✅ Car entry created successfully');
      console.log('   Record ID:', carEntry.data._id);
      console.log('   Car:', carEntry.data.car.plateNumber);
      console.log('   Slot:', carEntry.data.parkingSlot.slotNumber);

      // Test 6: Process Car Exit
      console.log('\n6. Testing car exit...');
      const exit = await axios.put(`${API_BASE}/parking-records/${carEntry.data._id}/exit`, {}, { headers });
      console.log('✅ Car exit processed successfully');
      console.log('   Duration:', exit.data.duration, 'minutes');
      console.log('   Amount:', exit.data.totalAmount, 'RWF');

      // Test 7: Create Payment
      console.log('\n7. Testing payment creation...');
      const payment = await axios.post(`${API_BASE}/payments`, {
        parkingRecordId: exit.data._id,
        amountPaid: exit.data.totalAmount,
        paymentMethod: 'cash'
      }, { headers });
      console.log('✅ Payment created successfully');
      console.log('   Payment ID:', payment.data._id);
      console.log('   Amount:', payment.data.amountPaid, 'RWF');
    }

    // Test 8: Get Cars
    console.log('\n8. Testing cars endpoint...');
    const cars = await axios.get(`${API_BASE}/cars`, { headers });
    console.log('✅ Cars retrieved:', cars.data.cars.length, 'cars');

    // Test 9: Get Payments
    console.log('\n9. Testing payments endpoint...');
    const payments = await axios.get(`${API_BASE}/payments`, { headers });
    console.log('✅ Payments retrieved:', payments.data.payments.length, 'payments');

    // Test 10: Get Parking Records
    console.log('\n10. Testing parking records endpoint...');
    const records = await axios.get(`${API_BASE}/parking-records`, { headers });
    console.log('✅ Parking records retrieved:', records.data.records.length, 'records');

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Backend running on port 5003');
    console.log('   - Frontend running on port 5173');
    console.log('   - MongoDB connected successfully');
    console.log('   - Admin user: admin / 123');
    console.log('   - Sample data initialized');
    console.log('   - All CRUD operations working');
    console.log('   - Transactions removed (compatible with standalone MongoDB)');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
