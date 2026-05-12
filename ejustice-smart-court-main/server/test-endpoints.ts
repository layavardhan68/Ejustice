import axios from 'axios';

const BASE_URL = 'https://ejustice-smart-court.onrender.com/api';

const testEndpoints = async () => {
    try {
        console.log('Testing Users...');
        const users = await axios.get(`${BASE_URL}/users`);
        console.log(`Users count: ${users.data.length}`);

        console.log('Testing Cases...');
        const cases = await axios.get(`${BASE_URL}/cases`);
        console.log(`Cases count: ${cases.data.length}`);

        console.log('Testing Documents...');
        const docs = await axios.get(`${BASE_URL}/documents`);
        console.log(`Documents count: ${docs.data.length}`);

        console.log('Testing Hearings...');
        const hearings = await axios.get(`${BASE_URL}/hearings`);
        console.log(`Hearings count: ${hearings.data.length}`);

        console.log('All tests passed!');
    } catch (err: any) {
        console.error('Test failed:', err?.message);
        if (err?.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
};

testEndpoints();
