import http from 'http';

const testAPI = () => {
  const options = {
    hostname: 'localhost',
    port: 5100,
    path: '/api/comments/1',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      process.exit(0);
    });
  });

  req.on('error', (err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });

  req.end();
};

testAPI();
