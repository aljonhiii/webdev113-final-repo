
        // 1. Initialization
        window.onload = function() {
            initDatabase();
            loadSettledRecords();
        };

        function logout() {
            window.location.href = '../login/login.html'; 
        }

        // 2. Load & Render Archive Table
        function loadSettledRecords() {
            const tableBody = document.getElementById('archiveTableBody');
            
            let allReports = [];
            try { allReports = getTable('brgy_reports'); } catch(e) {}
            if (!allReports || allReports.length === 0) { allReports = JSON.parse(localStorage.getItem('barangayReports')) || []; }
            
            // FILTER: Show ONLY disputes that are 'Settled' or 'Failed'
            const closedCases = allReports.filter(report => 
                (report.reportType === 'Lupon Dispute' || report.isDispute === true) && 
                (report.status === 'Settled' || report.status === 'Failed')
            );
            
            closedCases.reverse(); 

            if (closedCases.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-16">
                            <div class="empty-state-container">
                                <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                <p class="empty-title">No archived records</p>
                                <p class="empty-subtitle">There are currently no settled or failed mediation cases.</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = ''; 

            closedCases.forEach(report => {
                let statusClass = report.status === 'Settled' 
                    ? "status-settled" 
                    : "status-failed";

                let displayStatus = report.status === 'Settled' ? "Settled Successfully" : "Failed Mediation";
                const statusBadge = `<span class="status-badge ${statusClass}">${displayStatus}</span>`;
                
                let respondentText = "N/A";
                if(report.respondents && Array.isArray(report.respondents) && report.respondents.length > 0) {
                    respondentText = report.respondents.length > 1 ? `${report.respondents[0]} (+${report.respondents.length - 1})` : report.respondents[0];
                } else if (report.respondentName) { respondentText = report.respondentName; }

                const refId = report.reportID || report.reportId || "Unknown-ID";

                const row = document.createElement('tr');
                row.className = "table-row-hover";
                row.innerHTML = `
                    <td><span class="ref-id-text">${refId}</span></td>
                    <td><span class="party-text">${report.residentName || report.complainantName}</span></td>
                    <td><span class="party-text">${respondentText}</span></td>
                    <td><span class="category-text">${report.category || report.disputeType || "Complaint"}</span></td>
                    <td>${statusBadge}</td>
                    <td class="text-right">
                        <button onclick="openViewModal('${refId}')" class="btn-view">
                            View Record
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // 3. Modal Logic (Read-Only 10 Fields)
        function openViewModal(reportId) {
            let allReports = [];
            try { allReports = getTable('brgy_reports'); } catch(e) {}
            if (!allReports || allReports.length === 0) { allReports = JSON.parse(localStorage.getItem('barangayReports')) || []; }
            
            const report = allReports.find(r => r.reportID === reportId || r.reportId === reportId);
            if (!report) return;

            const setVal = (id, val, fallback) => {
                document.getElementById(id).innerText = val && val.trim() !== "" ? val : fallback;
            };

            // Intake Data
            setVal('modalCaseId', `Ref: ${report.reportID || report.reportId}`);
            setVal('modalComplainant', report.residentName || report.complainantName);
            
            if(report.respondents && Array.isArray(report.respondents) && report.respondents.length > 0) {
                document.getElementById('modalRespondent').innerHTML = report.respondents.map(r => `<div>• ${r}</div>`).join('');
            } else { setVal('modalRespondent', report.respondentName, "None listed"); }
            
            setVal('modalDescription', report.description, "No statement provided.");

            // Hearing 1
            setVal('modalHearing1Notes', report.discussionNotes, "No notes recorded.");
            setVal('modalHearing1Witnesses', report.witnessStatements, "No statements recorded.");
            setVal('modalHearing1Decision', report.hearing1Decision, "No decision recorded.");

            // Hearing 2
            setVal('modalHearing2Notes', report.hearing2Notes, "No notes recorded.");
            setVal('modalHearing2Witnesses', report.witnessStatements2, "No statements recorded.");
            setVal('modalHearing2Decision', report.hearing2Decision, "No decision recorded.");

            // Hearing 3
            setVal('modalHearing3Notes', report.hearing3Notes, "No notes recorded.");
            setVal('modalHearing3Witnesses', report.witnessStatements3, "No statements recorded.");
            setVal('modalHearing3Decision', report.hearing3Decision, "No decision recorded.");

            // Final Resolution
            setVal('modalDecisionNotes', report.decisionNotes, "No final decision terms recorded.");

            // Setup Badge
            const finalStatusBadge = document.getElementById('modalFinalStatus');
            if (report.status === 'Settled') {
                finalStatusBadge.innerText = 'Case Settled';
                finalStatusBadge.className = 'status-badge-lg status-settled';
            } else {
                finalStatusBadge.innerText = 'Mediation Failed';
                finalStatusBadge.className = 'status-badge-lg status-failed';
            }

            const modalEl = document.getElementById('viewRecordModal');
            const contentEl = document.getElementById('modalContent');
            modalEl.classList.remove('hidden');
            setTimeout(() => { contentEl.classList.remove('scale-95'); contentEl.classList.add('scale-100'); }, 10);
        }

        function closeViewModal() {
            const contentEl = document.getElementById('modalContent');
            contentEl.classList.remove('scale-100');
            contentEl.classList.add('scale-95');
            setTimeout(() => { document.getElementById('viewRecordModal').classList.add('hidden'); }, 150);
        }
