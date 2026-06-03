const http = require("http");

function makeRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = "Bearer " + token;
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    console.log("=== Testing Authentication & Link Creation ===\n");

    // Step 1: Try login with test user
    console.log("1. Testing POST /api/auth/login");
    const loginRes = await makeRequest("POST", "/api/auth/login", {
      email: "test@example.com",
      password: "Test1234",
    });
    console.log("   Status:", loginRes.status);
    console.log("   Response:", JSON.stringify(loginRes.data, null, 2));

    if (loginRes.status === 200 && loginRes.data.token) {
      const token = loginRes.data.token;
      console.log("   ✓ Login successful\n");

      // Step 2: Create a link with the token
      console.log("2. Testing POST /api/links/create with Bearer token");
      console.log("   Token (first 50 chars):", token.substring(0, 50) + "...");
      const linkRes = await makeRequest(
        "POST",
        "/api/links/create",
        {
          originalUrl: "https://google.com",
        },
        token
      );
      console.log("   Status:", linkRes.status);
      console.log("   Response:", JSON.stringify(linkRes.data, null, 2));

      if (linkRes.status === 201 && linkRes.data.success) {
        console.log("   ✓ Link creation successful");
      } else {
        console.log("   ✗ Link creation failed");
      }
    } else {
      console.log("   ✗ Login failed\n");
      console.log("   Trying registration first...\n");

      // Try registration
      const regRes = await makeRequest("POST", "/api/auth/register", {
        name: "Test User",
        email: "test@example.com",
        password: "Test1234",
      });
      console.log("   Registration status:", regRes.status);
      console.log("   Response:", JSON.stringify(regRes.data, null, 2));

      if (regRes.status === 201) {
        console.log("\n   Retrying login...\n");
        const loginRes2 = await makeRequest("POST", "/api/auth/login", {
          email: "test@example.com",
          password: "Test1234",
        });

        if (loginRes2.status === 200 && loginRes2.data.token) {
          const token = loginRes2.data.token;
          console.log("   ✓ Login successful after registration\n");

          console.log("3. Testing POST /api/links/create with Bearer token");
          const linkRes = await makeRequest(
            "POST",
            "/api/links/create",
            {
              originalUrl: "https://github.com",
            },
            token
          );
          console.log("   Status:", linkRes.status);
          console.log("   Response:", JSON.stringify(linkRes.data, null, 2));

          if (linkRes.status === 201 && linkRes.data.success) {
            console.log("   ✓ Link creation successful");
          } else {
            console.log("   ✗ Link creation failed");
          }
        }
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
  process.exit(0);
})();
