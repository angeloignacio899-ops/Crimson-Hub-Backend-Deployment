#!/usr/bin/env node

/**
 * 🔍 COMPREHENSIVE DIAGNOSTIC SCRIPT
 * 
 * This script checks all components of the category system:
 * 1. Backend API availability
 * 2. Category data in database
 * 3. Frontend file structure
 * 4. Route configuration
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(status, message) {
    const statusSymbol = {
        '✅': `${colors.green}✅${colors.reset}`,
        '❌': `${colors.red}❌${colors.reset}`,
        '⚠️': `${colors.yellow}⚠️${colors.reset}`,
        '🔍': `${colors.blue}🔍${colors.reset}`,
    }[status] || status;
    
    console.log(`${statusSymbol} ${message}`);
}

async function runDiagnostics() {
    console.log(`\n${colors.bright}${colors.blue}════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}🔍 CATEGORY SYSTEM DIAGNOSTIC REPORT${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}════════════════════════════════════════════════════════════════${colors.reset}\n`);

    // ===========================
    // TEST 1: Backend API
    // ===========================
    console.log(`${colors.bright}📡 TEST 1: Backend API${colors.reset}`);
    console.log('─'.repeat(60));
    
    try {
        const response = await fetch('http://localhost:5100/api/categories');
        
        if (response.ok) {
            const data = await response.json();
            log('✅', `API Response: ${response.status} OK`);
            log('✅', `Categories found: ${data.length}`);
            
            if (Array.isArray(data) && data.length > 0) {
                data.forEach((cat, idx) => {
                    console.log(`   ${idx + 1}. ID: ${cat.category_id}, Name: ${cat.category_name}`);
                });
            } else {
                log('❌', 'No categories returned from API');
            }
        } else {
            log('❌', `API Response: ${response.status} ERROR`);
            const error = await response.text();
            console.log(`   Error: ${error}`);
        }
    } catch (err) {
        log('❌', `Cannot connect to Backend (http://localhost:5100)`);
        console.log(`   Error: ${err.message}`);
        console.log(`   Make sure backend is running: npm start`);
    }

    // ===========================
    // TEST 2: Frontend Files
    // ===========================
    console.log(`\n${colors.bright}📁 TEST 2: Frontend Files${colors.reset}`);
    console.log('─'.repeat(60));
    
    const frontendPath = 'c:\\Users\\ACER\\Crimson Event Hub\\Frontend';
    const filesToCheck = [
        'src\\components\\organizer\\eventmanagement\\OrganizerEventSubmision.jsx',
    ];
    
    let allFrontendFilesExist = true;
    
    for (const file of filesToCheck) {
        const fullPath = path.join(frontendPath, file);
        if (fs.existsSync(fullPath)) {
            log('✅', `File exists: ${file}`);
            
            // Check for category_id in file
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('category_id')) {
                log('✅', `  ↳ Contains 'category_id' references`);
                if (content.includes('<select') && content.includes('category_id')) {
                    log('✅', `  ↳ Has <select> dropdown for category_id`);
                } else if (content.includes('<input') && content.includes('category')) {
                    log('❌', `  ↳ Has text input (old version) instead of dropdown`);
                } else {
                    log('⚠️', `  ↳ Cannot determine form type`);
                }
            } else {
                log('❌', `  ↳ Missing 'category_id' - old version?`);
            }
        } else {
            log('❌', `File missing: ${file}`);
            allFrontendFilesExist = false;
        }
    }

    // ===========================
    // TEST 3: Backend Files
    // ===========================
    console.log(`\n${colors.bright}🔧 TEST 3: Backend Files${colors.reset}`);
    console.log('─'.repeat(60));
    
    const backendPath = 'c:\\Users\\ACER\\Crimson Event Hub\\Backend';
    const backendFiles = [
        'routes\\category.js',
        'controllers\\categoryController.js',
    ];
    
    for (const file of backendFiles) {
        const fullPath = path.join(backendPath, file);
        if (fs.existsSync(fullPath)) {
            log('✅', `File exists: ${file}`);
        } else {
            log('❌', `File missing: ${file}`);
        }
    }
    
    // Check server.js for category imports
    const serverPath = path.join(backendPath, 'server.js');
    if (fs.existsSync(serverPath)) {
        const serverContent = fs.readFileSync(serverPath, 'utf8');
        if (serverContent.includes('categoryRoutes') && serverContent.includes('/api/categories')) {
            log('✅', `server.js: Category routes imported and configured`);
        } else {
            log('❌', `server.js: Missing category route configuration`);
        }
    }

    // ===========================
    // TEST 4: Summary
    // ===========================
    console.log(`\n${colors.bright}📋 TEST 4: Summary & Recommendations${colors.reset}`);
    console.log('─'.repeat(60));
    
    console.log(`
${colors.bright}If all tests PASS (all ✅):${colors.reset}
  1. Clear browser cache completely
  2. Hard refresh: Ctrl+Shift+R
  3. The dropdown should now appear

${colors.bright}If Backend API test FAILED (❌):${colors.reset}
  1. Make sure backend is running: npm start
  2. Check if MySQL is running
  3. Check database for 'category' table

${colors.bright}If Frontend Files test FAILED (❌):${colors.reset}
  1. Re-check the file contents
  2. Might be using old file version
  3. Clear Vite cache: rm -r .vite

${colors.bright}NEXT STEPS:${colors.reset}
  1. Run: node diagnostics.js (this script)
  2. Report the results
  3. If errors, run the ULTIMATE_FIX_GUIDE.md steps
`);

    console.log(`${colors.bright}${colors.blue}════════════════════════════════════════════════════════════════${colors.reset}\n`);
}

runDiagnostics().catch(err => {
    console.error('Diagnostic error:', err);
    process.exit(1);
});
