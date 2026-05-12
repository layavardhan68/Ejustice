import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const testPost = async () => {
    try {
        console.log("Testing POST /api/cases...");

        const form = new FormData();
        form.append('title', 'Test Case from Script');
        form.append('type', 'Civil');
        form.append('description', 'This is a test case created via script to verify the endpoint.');
        form.append('citizenId', 'citizen-1'); // Using valid user from seed

        // Create a dummy file if not exists
        const dummyFilePath = path.join(__dirname, 'test-file.txt');
        fs.writeFileSync(dummyFilePath, 'This is a test file content.');

        form.append('files', fs.createReadStream(dummyFilePath));

        const response = await axios.post('https://ejustice-smart-court.onrender.com/api/cases', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        console.log("SUCCESS: Case created!");
        console.log("Status:", response.status);
        console.log("Body:", JSON.stringify(response.data, null, 2));

        // Cleanup
        fs.unlinkSync(dummyFilePath);

    } catch (error: any) {
        console.error("FAILED to create case:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
};

testPost();
