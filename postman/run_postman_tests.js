/**
 * Automated Postman Collection Test Runner
 * Executes all positive, negative, and database consistency tests against the live Spring Boot API
 */

const fs = require('fs');
const http = require('http');

const collectionPath = './pharmacy-management-system/postman/Pharmacy_Management_System.postman_collection.json';
const rawData = fs.readFileSync(collectionPath, 'utf8');
const collection = JSON.parse(rawData);

const BASE_URL = 'http://localhost:8080/api';

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
        });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('   PHARMACY MANAGEMENT SYSTEM - AUTOMATED API TEST SUITE');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const results = [];

  for (const folder of collection.item) {
    console.log(`📁 FOLDER: ${folder.name}`);

    for (const reqItem of folder.item) {
      totalTests++;
      const reqName = reqItem.name;
      const method = reqItem.request.method;
      let rawUrl = reqItem.request.url.raw.replace('{{baseUrl}}', BASE_URL);

      const urlObj = new URL(rawUrl);
      let postData = reqItem.request.body?.raw || null;
      if (postData && reqName.includes('(Positive)')) {
        const uniqueSuffix = Date.now().toString().slice(-5);
        postData = postData
          .replace(/Dermatologicals/g, `Dermatologicals_${uniqueSuffix}`)
          .replace(/BTD-2026-X1/g, `BTD-2026-X${uniqueSuffix}`)
          .replace(/orders@apexpharma\.com/g, `orders_${uniqueSuffix}@apexpharma.com`)
          .replace(/Rohan Deshmukh/g, `Rohan Deshmukh ${uniqueSuffix}`);
      }

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      try {
        const response = await httpRequest(options, postData);
        let testPassed = false;
        let reason = '';

        // Check expected conditions based on request type
        if (reqName.includes('(Negative') || reqName.includes('Invalid')) {
          if (response.statusCode === 400 || response.statusCode === 404) {
            testPassed = true;
          } else {
            reason = `Expected 400 or 404, got ${response.statusCode}`;
          }
        } else if (method === 'POST') {
          if (response.statusCode === 201 || (response.statusCode === 200 && response.body?.success)) {
            testPassed = true;
          } else {
            reason = `Expected 201/200, got ${response.statusCode}: ${JSON.stringify(response.body)}`;
          }
        } else {
          if (response.statusCode === 200 && response.body?.success) {
            testPassed = true;
          } else {
            reason = `Expected 200 with success=true, got ${response.statusCode}: ${JSON.stringify(response.body)}`;
          }
        }

        if (testPassed) {
          passedTests++;
          console.log(`  ✅ [PASS] ${reqName} (HTTP ${response.statusCode})`);
          results.push({ name: reqName, status: 'PASSED', code: response.statusCode });
        } else {
          failedTests++;
          console.log(`  ❌ [FAIL] ${reqName} (HTTP ${response.statusCode}) - ${reason}`);
          results.push({ name: reqName, status: 'FAILED', code: response.statusCode, reason });
        }
      } catch (err) {
        failedTests++;
        console.log(`  ❌ [ERROR] ${reqName} - Request error: ${err.message}`);
        results.push({ name: reqName, status: 'ERROR', error: err.message });
      }
    }
    console.log('');
  }

  console.log('================================================================');
  console.log(`TEST SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  fs.writeFileSync(
    './pharmacy-management-system/postman/test_results.json',
    JSON.stringify({ total: totalTests, passed: passedTests, failed: failedTests, details: results }, null, 2)
  );
}

runTests();
