
import axios from 'axios';

const API_URL = 'https://ejustice-smart-court.onrender.com/api';

async function testAuth() {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`1. Registering Citizen: ${email}`);
    try {
        const regRes = await axios.post(`${API_URL}/auth/register/citizen`, {
            name: 'Test Citizen',
            email,
            password,
            phone: '1234567890'
        });
        console.log('Registration Success:', regRes.data.id);
    } catch (e: any) {
        console.error('Registration Failed:', e.response?.data || e.message);
        return;
    }

    console.log('2. Attempting Login...');
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password,
            role: 'citizen'
        });
        console.log('Login Success:', loginRes.data);
    } catch (e: any) {
        console.error('Login Failed:', e.response?.data || e.message);
    }
}

testAuth();
