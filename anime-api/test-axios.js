import axios from 'axios';
async function test() {
  try {
    const res = await axios.get('http://localhost:4004/info/112936');
    console.log('Status:', res.status);
    console.log('Data keys:', Object.keys(res.data.data || {}));
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.status, err.response.data);
    }
  }
}
test();
