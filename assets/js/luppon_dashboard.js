
        let currentEditingId = null;

        window.onload = function() {
            initDatabase();
            loadDisputeRecords();
        };

        function logout() {
            window.location.href = '../login/login.html'; 
        }

        // ==========================================
        // FETCH & RENDER TABLE 
        // ==========================================
        function loadDisputeRecords() {
            const tableBody = document.getElementById('disputesTableBody');
            
            let allReports = [];
            try { allReports = getTable('brgy_reports'); } catch(e) {}
            if (!allReports || allReports.length === 0) {
                allReports = JSON.parse(localStorage.getItem('barangayReports')) || [];
            }
            
            const allDisputes = allReports.filter(report => report.reportType === 'Lupon Dispute' || report.isDispute === true);
            const activeDisputes = allDisputes.filter(report => report.status !== 'Settled' && report.status !== 'Failed');
            activeDisputes.reverse(); 

            document.getElementById('stat-total').innerText = allDisputes.length;
            document.getElementById('stat-pending').innerText = allDisputes.filter(r => r.status === 'Pending Lupon Review' || r.status === 'Pending Verification').length;
            document.getElementById('stat-mediation').innerText = activeDisputes.length - allDisputes.filter(r => r.status === 'Pending Lupon Review' || r.status === 'Pending Verification').length;
            document.getElementById('stat-settled').innerText = allDisputes.filter(r => r.status === 'Settled').length;

            if (activeDisputes.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6" class="px-8 py-16 text-center text-slate-400">No active cases</td></tr>`;
                return;
            }

            tableBody.innerHTML = ''; 

            activeDisputes.forEach(report => {
                let respondentText = "N/A";
                if(report.respondents && Array.isArray(report.respondents) && report.respondents.length > 0) {
                    respondentText = report.respondents.length > 1 
                        ? `${report.respondents[0]} <span class="text-slate-400 text-xs font-medium">+${report.respondents.length - 1} more</span>` 
                        : report.respondents[0];
                } else if (report.respondentName) {
                    respondentText = report.respondentName;
                }

                let currentStatus = report.status || "Pending Lupon Review";

                let statusColor = "text-orange-700 bg-orange-50 border-orange-200";
                if(currentStatus === 'Sent to Lupon' || currentStatus === 'Summon Issued' || currentStatus.includes('Mediation') || currentStatus.includes('Pangkat')) {
                    statusColor = "text-blue-700 bg-blue-50 border-blue-200";
                }

                const statusBadge = `<span class="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${statusColor} tracking-wider uppercase shadow-sm">${currentStatus}</span>`;
                const refId = report.reportID || report.reportId || "Unknown-ID";

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><span class="ref-id-text">${refId}</span></td>
                    <td><span class="party-text">${report.residentName || report.complainantName}</span></td>
                    <td><span class="party-text">${respondentText}</span></td>
                    <td><span class="category-text">${report.category || report.disputeType || "Complaint"}</span></td>
                    <td>${statusBadge}</td>
                    <td>
                        <button onclick="openManageModal('${refId}')" class="btn-manage">
                            Manage Case
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // ==========================================
        // MANAGE MODAL (Load 10 fields!)
        // ==========================================
        function openManageModal(reportId) {
            let allReports = [];
            try { allReports = getTable('brgy_reports'); } catch(e) {}
            if (!allReports || allReports.length === 0) { allReports = JSON.parse(localStorage.getItem('barangayReports')) || []; }
            
            const report = allReports.find(r => r.reportID === reportId || r.reportId === reportId);
            if (!report) return;

            currentEditingId = reportId;

            // 1. Load Info
            document.getElementById('modalCaseId').innerText = `Ref: ${report.reportID || report.reportId}`;
            document.getElementById('modalComplainant').innerText = report.residentName || report.complainantName;
            document.getElementById('modalInitialDesc').innerText = report.description || "No description provided.";
            
            if(report.respondents && Array.isArray(report.respondents) && report.respondents.length > 0) {
                document.getElementById('modalRespondent').innerHTML = report.respondents.map(r => `<div>• ${r}</div>`).join('');
            } else if (report.respondentName) {
                document.getElementById('modalRespondent').innerText = report.respondentName;
            } else { document.getElementById('modalRespondent').innerText = "None listed"; }
            
            // 2. Load Master Status
            document.getElementById('updateStatusSelect').value = report.status || 'Pending Lupon Review';
            document.getElementById('hearingDate').value = report.hearingDate || '';

            // 3. LOAD ALL 10 TEXT BOXES
            document.getElementById('discussionNotes').value = report.discussionNotes || '';
            document.getElementById('witnessStatements').value = report.witnessStatements || '';
            document.getElementById('hearing1Decision').value = report.hearing1Decision || '';

            document.getElementById('hearing2Notes').value = report.hearing2Notes || '';
            document.getElementById('witnessStatements2').value = report.witnessStatements2 || '';
            document.getElementById('hearing2Decision').value = report.hearing2Decision || '';

            document.getElementById('hearing3Notes').value = report.hearing3Notes || '';
            document.getElementById('witnessStatements3').value = report.witnessStatements3 || '';
            document.getElementById('hearing3Decision').value = report.hearing3Decision || '';

            document.getElementById('decisionNotes').value = report.decisionNotes || '';

            switchTab(0);

            // Animate Modal In
            const modalEl = document.getElementById('manageModal');
            const contentEl = document.getElementById('modalContent');
            modalEl.classList.remove('hidden');
            setTimeout(() => { contentEl.classList.remove('scale-95'); contentEl.classList.add('scale-100'); }, 10);
        }

        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');

            document.querySelectorAll('[id^="btn-tab-"]').forEach(btn => {
                btn.classList.remove('bg-amber-50', 'border-amber-200', 'shadow-sm');
                btn.classList.add('border-transparent', 'hover:bg-slate-50');
                btn.querySelector('span:nth-child(2)').classList.replace('text-amber-800', 'text-slate-700');
                btn.querySelector('span:nth-child(2)').classList.replace('font-black', 'font-bold');
                let iconDiv = btn.querySelector('div');
                iconDiv.classList.remove('border-amber-500', 'text-amber-600', 'shadow-sm');
                iconDiv.classList.add('border-slate-300', 'text-slate-400');
            });

            let activeBtn = document.getElementById(`btn-tab-${tabId}`);
            activeBtn.classList.add('bg-amber-50', 'border-amber-200', 'shadow-sm');
            activeBtn.classList.remove('border-transparent', 'hover:bg-slate-50');
            activeBtn.querySelector('span:nth-child(2)').classList.replace('text-slate-700', 'text-amber-800');
            activeBtn.querySelector('span:nth-child(2)').classList.replace('font-bold', 'font-black');
            let iconDiv = activeBtn.querySelector('div');
            iconDiv.classList.add('border-amber-500', 'text-amber-600', 'shadow-sm');
            iconDiv.classList.remove('border-slate-300', 'text-slate-400');
        }

        function closeManageModal() {
            const contentEl = document.getElementById('modalContent');
            contentEl.classList.remove('scale-100');
            contentEl.classList.add('scale-95');
            setTimeout(() => { document.getElementById('manageModal').classList.add('hidden'); currentEditingId = null; }, 150);
        }

        // ==========================================
        // SAVE STATUS UPDATE (Save 10 fields!)
        // ==========================================
        function saveStatusUpdate() {
            if (!currentEditingId) return;

            let allReports = [];
            try { allReports = getTable('brgy_reports'); } catch(e) {}
            if (!allReports || allReports.length === 0) { allReports = JSON.parse(localStorage.getItem('barangayReports')) || []; }
            
            const reportIndex = allReports.findIndex(r => r.reportID === currentEditingId || r.reportId === currentEditingId);
            
            if (reportIndex !== -1) {
                // Grab all data
                allReports[reportIndex].status = document.getElementById('updateStatusSelect').value;
                allReports[reportIndex].hearingDate = document.getElementById('hearingDate').value;
                
                allReports[reportIndex].discussionNotes = document.getElementById('discussionNotes').value;
                allReports[reportIndex].witnessStatements = document.getElementById('witnessStatements').value;
                allReports[reportIndex].hearing1Decision = document.getElementById('hearing1Decision').value;

                allReports[reportIndex].hearing2Notes = document.getElementById('hearing2Notes').value;
                allReports[reportIndex].witnessStatements2 = document.getElementById('witnessStatements2').value;
                allReports[reportIndex].hearing2Decision = document.getElementById('hearing2Decision').value;

                allReports[reportIndex].hearing3Notes = document.getElementById('hearing3Notes').value;
                allReports[reportIndex].witnessStatements3 = document.getElementById('witnessStatements3').value;
                allReports[reportIndex].hearing3Decision = document.getElementById('hearing3Decision').value;

                allReports[reportIndex].decisionNotes = document.getElementById('decisionNotes').value;
                
                // Save to correct DB
                try {
                    saveTable('brgy_reports', allReports);
                } catch(e) {
                    localStorage.setItem('barangayReports', JSON.stringify(allReports));
                }
                
                closeManageModal();
                loadDisputeRecords(); // Refresh table
                alert(`Success! Case ${currentEditingId} has been updated.`);
            }
        }
