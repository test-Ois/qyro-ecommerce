/**
 * Programmatic Smoke Test Script
 * ==============================
 * Verifies backend API flows, security controls, registration/login,
 * approval gates, and blocking mechanics.
 * 
 * Run using: node scripts/smokeTest.js
 */

const BASE_URL = "http://localhost:5000/api";

const results = {
  passed: [],
  failed: []
};

function logTest(name, success, details = "") {
  if (success) {
    console.log(`✅ PASSED: ${name}`);
    results.passed.push({ name, details });
  } else {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Details: ${details}`);
    results.failed.push({ name, details });
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("🚀 STARTING QYRO MARKETPLACE RUNTIME SMOKE TESTS");
  console.log("========================================================\n");

  const rand = Math.floor(Math.random() * 1000000);
  const adminEmail = `admin_smoke_${rand}@qyro.com`;
  const sellerEmail = `seller_smoke_${rand}@qyro.com`;
  const password = "SecurePassword@123";

  let superAdminToken = "";
  let adminToken = "";
  let adminId = "";
  let sellerToken = "";
  let sellerId = "";

  // ----------------------------------------------------
  // Test 1: Product Loading & Public Endpoints (Guest Access)
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const productsList = Array.isArray(data) ? data : (data.products || []);
    logTest("Product Loading (Guest -> Products List)", true, `Fetched ${productsList.length} products without login`);

    if (productsList.length > 0) {
      const firstProdId = productsList[0]._id;
      const resDetails = await fetch(`${BASE_URL}/products/${firstProdId}`);
      if (!resDetails.ok) throw new Error(`HTTP ${resDetails.status}`);
      const prodDetails = await resDetails.json();
      logTest("Product Details (Guest -> Product Page)", true, `Fetched detail of product: "${prodDetails.name || firstProdId}" without login`);
    } else {
      logTest("Product Details (Guest -> Product Page)", true, "No products in database to verify detail loading, but list fetched successfully");
    }
  } catch (err) {
    logTest("Product Loading & Public Endpoints (Guest Access)", false, err.message);
  }

  // ----------------------------------------------------
  // Test 2: Super Admin Login & Creation Verification
  // ----------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "superadmin@qyro.com", password: "SuperSecureP@ss1" })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    superAdminToken = data.token;
    logTest("Super Admin Login", true, `Logged in successfully as super_admin`);
  } catch (err) {
    logTest("Super Admin Login", false, err.message);
  }

  // ----------------------------------------------------
  // Test 3: Admin Registration & Pending Approvals Flow
  // ----------------------------------------------------
  try {
    // 3.1 Register Admin
    const resReg = await fetch(`${BASE_URL}/auth/admin-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Smoke Test Admin", email: adminEmail, password })
    });
    if (!resReg.ok) {
      const data = await resReg.json();
      throw new Error(`Register admin failed: ${data.message || resReg.status}`);
    }
    const regData = await resReg.json();
    adminId = regData.user.id;
    logTest("Admin Registration", true, `Admin user registered: ${adminEmail} (pending status)`);

    // 3.2 Login pending admin
    const resLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password })
    });
    if (!resLogin.ok) throw new Error(`HTTP ${resLogin.status}`);
    const loginData = await resLogin.json();
    adminToken = loginData.token;

    // 3.3 Verify pending admin cannot access admin dashboard / stats
    const resStats = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (resStats.status === 403) {
      logTest("Pending Admin Guard (Access Blocked)", true, "Access to admin stats correctly denied (403) for pending admin");
    } else {
      logTest("Pending Admin Guard (Access Blocked)", false, `Expected 403 Forbidden, but received HTTP ${resStats.status}`);
    }
  } catch (err) {
    logTest("Admin Registration & Guards", false, err.message);
  }

  // ----------------------------------------------------
  // Test 4: Super Admin Admin Approval Flow
  // ----------------------------------------------------
  try {
    if (!superAdminToken) throw new Error("Super Admin token unavailable");

    // 4.1 Verify admin is in pending-admins list
    const resPending = await fetch(`${BASE_URL}/admin/pending-admins`, {
      headers: { "Authorization": `Bearer ${superAdminToken}` }
    });
    if (!resPending.ok) throw new Error(`Fetch pending list failed: HTTP ${resPending.status}`);
    const pendingList = await resPending.json();
    const isFound = pendingList.some(u => u._id === adminId);
    logTest("Super Admin Approved List Check", isFound, `Admin account is in pending approval list: ${isFound}`);

    // 4.2 Super Admin approves Admin
    const resApprove = await fetch(`${BASE_URL}/admin/admins/${adminId}/approve`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${superAdminToken}` }
    });
    if (!resApprove.ok) throw new Error(`Admin approval failed: HTTP ${resApprove.status}`);
    logTest("Super Admin Admin Approval Action", true, `Approved admin account ${adminEmail}`);

    // 4.3 Now check if approved admin can access stats
    const resStatsApproved = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    if (resStatsApproved.ok) {
      logTest("Approved Admin Access Verification", true, "Approved admin can now successfully access admin stats (200)");
    } else {
      logTest("Approved Admin Access Verification", false, `Expected 200 OK, but received HTTP ${resStatsApproved.status}`);
    }
  } catch (err) {
    logTest("Super Admin Admin Approval Flow", false, err.message);
  }

  // ----------------------------------------------------
  // Test 5: Seller Registration & Guards Flow
  // ----------------------------------------------------
  try {
    // 5.1 Register seller
    const resReg = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Smoke Test Seller",
        email: sellerEmail,
        password,
        role: "seller",
        shopName: "Smoke Seller Shop",
        shopDescription: "A shop created during smoke testing"
      })
    });
    if (!resReg.ok) {
      const data = await resReg.json();
      throw new Error(`Register seller failed: ${data.message || resReg.status}`);
    }
    logTest("Seller Registration", true, `Seller user registered: ${sellerEmail} (pending status)`);

    // 5.2 Login seller
    const resLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sellerEmail, password })
    });
    if (!resLogin.ok) throw new Error(`HTTP ${resLogin.status}`);
    const loginData = await resLogin.json();
    sellerToken = loginData.token;
    sellerId = loginData.user.id;

    // 5.3 Verify pending seller cannot retrieve seller orders
    const resSellerOrders = await fetch(`${BASE_URL}/orders/seller`, {
      headers: { "Authorization": `Bearer ${sellerToken}` }
    });
    if (resSellerOrders.status === 403) {
      logTest("Pending Seller Guard (Access Blocked)", true, "Access to seller orders correctly denied (403) for pending seller");
    } else {
      logTest("Pending Seller Guard (Access Blocked)", false, `Expected 403 Forbidden, but received HTTP ${resSellerOrders.status}`);
    }
  } catch (err) {
    logTest("Seller Registration & Guards Flow", false, err.message);
  }

  // ----------------------------------------------------
  // Test 6: Super Admin Seller Approval Flow
  // ----------------------------------------------------
  try {
    if (!superAdminToken) throw new Error("Super Admin token unavailable");

    // 6.1 Super Admin approves Seller
    const resApprove = await fetch(`${BASE_URL}/admin/sellers/${sellerId}/approve`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${superAdminToken}` }
    });
    if (!resApprove.ok) throw new Error(`Seller approval failed: HTTP ${resApprove.status}`);
    logTest("Super Admin Seller Approval Action", true, `Approved seller account ${sellerEmail}`);

    // 6.2 Now check if approved seller can view orders
    const resOrdersApproved = await fetch(`${BASE_URL}/orders/seller`, {
      headers: { "Authorization": `Bearer ${sellerToken}` }
    });
    if (resOrdersApproved.ok) {
      logTest("Approved Seller Access Verification", true, "Approved seller can now successfully access seller orders endpoint (200)");
    } else {
      logTest("Approved Seller Access Verification", false, `Expected 200 OK, but received HTTP ${resOrdersApproved.status}`);
    }
  } catch (err) {
    logTest("Super Admin Seller Approval Flow", false, err.message);
  }

  // ----------------------------------------------------
  // Test 7: Super Admin Blocking / Unblocking Mechanics
  // ----------------------------------------------------
  try {
    if (!superAdminToken) throw new Error("Super Admin token unavailable");

    // 7.1 Block Admin
    const resBlockAdmin = await fetch(`${BASE_URL}/admin/admins/${adminId}/block`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${superAdminToken}` }
    });
    if (!resBlockAdmin.ok) throw new Error(`Block admin failed: HTTP ${resBlockAdmin.status}`);
    logTest("Block Admin Action", true, `Admin blocked successfully`);

    // 7.2 Log in blocked admin should fail
    const resLoginBlocked = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password })
    });
    if (resLoginBlocked.status === 403) {
      logTest("Blocked Admin Login Guard", true, "Access denied (403) as expected for blocked admin login attempt");
    } else {
      logTest("Blocked Admin Login Guard", false, `Expected 403 Forbidden, but received HTTP ${resLoginBlocked.status}`);
    }

    // 7.3 Unblock Admin
    const resUnblockAdmin = await fetch(`${BASE_URL}/admin/admins/${adminId}/unblock`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${superAdminToken}` }
    });
    if (!resUnblockAdmin.ok) throw new Error(`Unblock admin failed: HTTP ${resUnblockAdmin.status}`);
    logTest("Unblock Admin Action", true, `Admin unblocked successfully`);

    // 7.4 Log in unblocked admin should succeed
    const resLoginUnblocked = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password })
    });
    if (resLoginUnblocked.ok) {
      logTest("Unblocked Admin Login Check", true, "Unblocked admin login succeeds again");
    } else {
      logTest("Unblocked Admin Login Check", false, `Expected 200 OK, but received HTTP ${resLoginUnblocked.status}`);
    }

    // 7.5 Block Seller
    const resBlockSeller = await fetch(`${BASE_URL}/admin/sellers/${sellerId}/block`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${superAdminToken}` }
    });
    if (!resBlockSeller.ok) throw new Error(`Block seller failed: HTTP ${resBlockSeller.status}`);
    logTest("Block Seller Action", true, `Seller blocked successfully`);

    // 7.6 Log in blocked seller should fail
    const resLoginBlockedSeller = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sellerEmail, password })
    });
    if (resLoginBlockedSeller.status === 403) {
      logTest("Blocked Seller Login Guard", true, "Access denied (403) as expected for blocked seller login attempt");
    } else {
      logTest("Blocked Seller Login Guard", false, `Expected 403 Forbidden, but received HTTP ${resLoginBlockedSeller.status}`);
    }
  } catch (err) {
    logTest("Super Admin Blocking / Unblocking Mechanics", false, err.message);
  }

  // ----------------------------------------------------
  // Test 8: Redirect Loops and Protections Verification
  // ----------------------------------------------------
  try {
    // 8.1 Verify public route (e.g. root endpoint) does not redirect
    const resRoot = await fetch("http://localhost:5000/");
    if (resRoot.status === 200) {
      logTest("Public Route Redirect Check (API Root)", true, "No redirect occurs for API Root (200 OK)");
    } else {
      logTest("Public Route Redirect Check (API Root)", false, `Expected 200 OK, but received HTTP ${resRoot.status}`);
    }

    // 8.2 Verify checkout protection returns 401 instead of redirecting at API level
    const resCheckout = await fetch(`${BASE_URL}/orders`, { method: "POST" });
    if (resCheckout.status === 401) {
      logTest("Protected Route API Integrity Check", true, "Protected API order creation endpoint returns 401 Unauthorized instead of redirect loop");
    } else {
      logTest("Protected Route API Integrity Check", false, `Expected 401 Unauthorized, but received HTTP ${resCheckout.status}`);
    }
  } catch (err) {
    logTest("Redirect Loops and Protections Verification", false, err.message);
  }

  console.log("\n========================================================");
  console.log("🏁 SMOKE TEST RUN COMPLETED");
  console.log(`   Passed: ${results.passed.length}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log("========================================================\n");

  // Output JSON report to stdout for the calling agent
  console.log("REPORT_JSON:" + JSON.stringify(results));
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

runTests();
