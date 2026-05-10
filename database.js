// ==========================================
// BARANGAY CONNECT - CORE DATABASE ENGINE (V2.0)
// ==========================================

// 1. SYSTEM INITIALIZATION
function initDatabase() {
    const tables = ['brgy_residents', 'brgy_households', 'brgy_disputes', 'brgy_documents', 'brgy_logs'];
    tables.forEach(table => {
        if (!localStorage.getItem(table)) {
            localStorage.setItem(table, JSON.stringify([]));
        }
    });
}

// 2. UNIVERSAL HELPERS
function saveTable(tableName, dataArray) {
    localStorage.setItem(tableName, JSON.stringify(dataArray));
}

function getTable(tableName) {
    try {
        const data = localStorage.getItem(tableName);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error(`Database Error: Could not parse ${tableName}`, e);
        return [];
    }
}

function generateID(prefix) {
    // Senior Dev Tip: Using timestamp + random ensures better uniqueness in local systems
    return `${prefix}-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
}

// ==========================================
// SYSTEM LOGS (Transparency & Audit)
// ==========================================
function logSystemAction(actionDetails, adminName = "System") {
    let logs = getTable('brgy_logs');
    logs.unshift({
        logID: generateID('LOG'),
        timestamp: new Date().toLocaleString(),
        admin: adminName,
        action: actionDetails
    });
    // Keep logs manageable (optional: only keep last 500)
    if (logs.length > 500) logs.pop();
    saveTable('brgy_logs', logs);
}

// ==========================================
// MODULE 1: RESIDENTS & HOUSEHOLDS
// ==========================================

function addResident(residentData, adminName = "System") {
    let residents = getTable('brgy_residents');
    
    // Improved Duplicate Detection
    let isDuplicate = residents.some(r => 
        r.firstName.toLowerCase() === residentData.firstName.toLowerCase() && 
        r.lastName.toLowerCase() === residentData.lastName.toLowerCase() &&
        r.birthdate === residentData.birthdate
    );

    if (isDuplicate) return { success: false, message: "Resident Identity already exists in database." };

    let newResident = {
        residentID: generateID('RES'),
        ...residentData, // Spread existing data (MiddleName, Contact, etc.)
        employmentStatus: residentData.employmentStatus || "Unemployed",
        is4PsBeneficiary: residentData.is4PsBeneficiary || false,
        historyLogs: [{ date: new Date().toLocaleDateString(), change: "Initial Registration" }]
    };

    residents.push(newResident);
    saveTable('brgy_residents', residents);
    logSystemAction(`Registered: ${newResident.firstName} ${newResident.lastName}`, adminName);
    
    return { success: true, id: newResident.residentID };
}

// ==========================================
// MODULE 3: SMART DOCUMENT REQUESTS
// ==========================================

/**
 * @param {string} residentID 
 * @param {string} documentType 
 * @param {object} payload - The dynamic attributes from the form (Income, Business Name, etc.)
 */
function requestDocument(residentID, documentType, payload) {
    let documents = getTable('brgy_documents');
    let residents = getTable('brgy_residents');
    let resident = residents.find(r => r.residentID === residentID);

    if (!resident) {
        console.error("Auth Error: Resident not found.");
        return false;
    }

    // Handle Payload: If it's a string (from older code), try to parse it. 
    // If it's already an object, use it.
    let attributes = (typeof payload === 'string') ? JSON.parse(payload) : payload;

    let newDoc = {
        requestID: generateID('DOC'),
        residentID: residentID,
        residentName: `${resident.firstName} ${resident.lastName}`,
        documentType: documentType,
        details: attributes, // Store the full dynamic object
        status: "Pending",
        dateRequested: new Date().toLocaleDateString(),
        issueDate: null,
        validityDate: null,
        aiRecommendation: null
    };

    // --- SENIOR DEV AI LOGIC ---
    if (documentType === "Certificate of Indigency") {
        let score = 0;
        // Parse income from the dynamic payload
        const income = parseFloat(attributes.estIncome || attributes.income || 0);
        
        if (resident.employmentStatus === "Unemployed" || income < 12000) score += 50;
        if (resident.is4PsBeneficiary) score += 40;
        
        if (score >= 50) {
            newDoc.aiRecommendation = "🟢 AI Recommendation: APPROVE (Low Income Profile)";
        } else {
            newDoc.aiRecommendation = "🟡 AI Recommendation: MANUAL REVIEW (Income exceeds threshold)";
        }
    }

    if (documentType === "Business Clearance") {
        newDoc.aiRecommendation = "🔵 AI Note: Verify Business Location via Map";
    }

    documents.push(newDoc);
    saveTable('brgy_documents', documents);
    logSystemAction(`Requested: ${documentType} for ${newDoc.residentName}`);
    return newDoc.requestID;
}

function issueDocument(requestID, adminName = "Admin") {
    let documents = getTable('brgy_documents');
    let doc = documents.find(d => d.requestID === requestID);
    
    if (doc && doc.status !== "Issued") {
        doc.status = "Issued";
        let today = new Date();
        doc.issueDate = today.toLocaleDateString();
        
        // Expiration Logic: 6 months for most, 1 year for Business
        let validityMonths = (doc.documentType === "Business Clearance") ? 12 : 6;
        today.setMonth(today.getMonth() + validityMonths);
        doc.validityDate = today.toLocaleDateString();

        saveTable('brgy_documents', documents);
        logSystemAction(`Issued: ${doc.documentType} [#${requestID}]`, adminName);
        return true;
    }
    return false;
}


// ==========================================
// MODULE 4: REPORTING SYSTEM (Incidents & Disputes)
// ==========================================

/**
 * @param {string} residentID 
 * @param {object} reportPayload - The data from the dashboard form
 */
function fileReport(residentID, reportPayload) {
    // 1. Initialize the reports table if it doesn't exist
    if (!localStorage.getItem('brgy_reports')) {
        localStorage.setItem('brgy_reports', JSON.stringify([]));
    }

    let reports = getTable('brgy_reports');
    let residents = getTable('brgy_residents');
    let resident = residents.find(r => r.residentID === residentID);

    if (!resident) {
        console.error("Database Error: Resident session invalid.");
        return false;
    }

    // 2. Create the new report object
    let newReport = {
        reportID: generateID('REP'),
        residentID: residentID,
        residentName: `${resident.firstName} ${resident.lastName}`,
        timestamp: new Date().toLocaleString(),
        ...reportPayload // This spreads the category, description, coordinates, and photo
    };

    // 3. Save to LocalStorage
    reports.unshift(newReport); // Adds to the top of the list
    saveTable('brgy_reports', reports);

    // 4. Log the action for the Admin audit trail
    logSystemAction(`New Report Filed: ${newReport.category} by ${newReport.residentName}`);

    return newReport.reportID;
}

// Initialize Database
initDatabase();