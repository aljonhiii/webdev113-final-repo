
        let currentUser = null;
        let myReports = [];
        let mapInstance = null; 
        let markerInstance = null; 
        
        // Pagination Variables
        let currentPage = 1;
        const itemsPerPage = 5;

        document.addEventListener("DOMContentLoaded", () => {
            initDatabase(); 
            
            const sessionData = localStorage.getItem('brgy_active_session') || sessionStorage.getItem('brgy_active_session');
            if (!sessionData) { window.location.href = '../login/login.html'; return; }
            
            currentUser = JSON.parse(sessionData);
            document.getElementById('profileName').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('userInitial').innerText = currentUser.firstName.charAt(0).toUpperCase();

            // 🌟 CALL PROFILE COMPLETION CHECK HERE
            checkProfileCompletion(currentUser);

            loadUserReports();
        });

        // ==========================================
        // PROFILE COMPLETION LOGIC
        // ==========================================
        function checkProfileCompletion(user) {
            const requiredKeys = [
                'phone', 'address', 'weight', 'height', 'bloodType', 'civilStatus', 
                'education', 'employment', 'income', 'householdSize', 'isHeadOfFamily', 
                'dwellingType', 'householdNumber', 'emergencyName', 'emergencyRel', 'emergencyPhone'
            ];
            let filledCount = 0;
            const totalRequired = requiredKeys.length + 1; // +1 for profile picture

            requiredKeys.forEach(key => {
                if (user[key] && String(user[key]).trim() !== "") filledCount++;
            });

            if (user.profilePic && user.profilePic.startsWith('data:image')) filledCount++;

            const percentage = Math.round((filledCount / totalRequired) * 100);
            const sidebarBadge = document.getElementById('sidebarCompletionBadge');
            
            if (sidebarBadge) {
                if (percentage < 100) {
                    sidebarBadge.innerText = `${percentage}%`;
                    sidebarBadge.classList.remove('hidden');
                } else {
                    sidebarBadge.classList.add('hidden');
                }
            }
        }

        // ==========================================
        // FETCH & PAGINATION LOGIC
        // ==========================================
        function loadUserReports() {
            const allReports = getTable('brgy_reports');
            myReports = allReports.filter(report => report.residentID === currentUser.residentID);
            
            // Update Banner Stats
            document.getElementById('bannerTotal').innerText = myReports.length;
            document.getElementById('bannerActive').innerText = myReports.filter(r => r.status !== 'Resolved' && r.status !== 'Settled' && r.status !== 'Failed').length;

            renderTable();
        }

        function renderTable() {
            const tableBody = document.getElementById('reportsTableBody');
            const totalItems = myReports.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

            if (totalItems === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-16">
                            <div class="empty-state-box">
                                <div class="empty-icon-wrapper">
                                    <svg class="icon-lg text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <p class="empty-title">No submissions yet</p>
                                <p class="empty-desc">You haven't filed any reports or disputes. When you do, they will appear here.</p>
                                <a href="citezen_dashboard.html" class="btn-primary-sm">File a New Report</a>
                            </div>
                        </td>
                    </tr>
                `;
                document.getElementById('paginationInfo').innerText = "Showing 0 entries";
                document.getElementById('prevBtn').disabled = true;
                document.getElementById('nextBtn').disabled = true;
                return;
            }

            // Slice array for pagination
            const startIdx = (currentPage - 1) * itemsPerPage;
            const endIdx = startIdx + itemsPerPage;
            const paginatedItems = myReports.slice(startIdx, endIdx);

            tableBody.innerHTML = ''; 

            paginatedItems.forEach(report => {
                let isDispute = report.reportType === 'Lupon Dispute';
                
                let typeClass = isDispute ? 'badge-amber' : 'badge-gray';
                let typeBadge = `<span class="type-badge ${typeClass}">${isDispute ? 'Formal Dispute' : 'General Incident'}</span>`;

                let statusClass = "status-orange"; 
                let dotClass = "dot-orange";
                if(report.status === 'Resolved' || report.status === 'Settled') { statusClass = "status-green"; dotClass = "dot-green"; }
                if(report.status === 'Failed') { statusClass = "status-red"; dotClass = "dot-red"; }
                if(report.status === 'In Progress' || report.status === 'Sent to Lupon' || report.status === 'Summon Issued' || report.status === 'Mediation') { statusClass = "status-blue"; dotClass = "dot-blue"; }

                const statusBadge = `
                    <div class="status-wrapper">
                        <span class="status-dot ${dotClass}"></span>
                        <span class="status-text ${statusClass}">${report.status}</span>
                    </div>`;

                const row = document.createElement('tr');
                row.className = "table-row";
                row.innerHTML = `
                    <td><span class="ref-id-text">${report.reportID}</span></td>
                    <td><span class="date-text">${report.timestamp}</span></td>
                    <td><span class="category-text">${report.category}</span></td>
                    <td>${typeBadge}</td>
                    <td>${statusBadge}</td>
                    <td class="text-right">
                        <div class="action-buttons">
                            <button onclick="openProgressModal('${report.reportID}')" class="btn-view-details">
                                View Details
                            </button>
                            <button onclick="deleteReport('${report.reportID}')" class="btn-delete" title="Delete Submission">
                                <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Update Pagination UI
            document.getElementById('paginationInfo').innerText = `Showing ${startIdx + 1} to ${Math.min(endIdx, totalItems)} of ${totalItems} entries`;
            document.getElementById('prevBtn').disabled = currentPage === 1;
            document.getElementById('nextBtn').disabled = currentPage === totalPages;
        }

        function changePage(delta) {
            currentPage += delta;
            renderTable();
        }

        // ==========================================
        // DELETE LOGIC
        // ==========================================
        function deleteReport(reportID) {
            if(confirm(`⚠️ Are you sure you want to permanently delete Report ${reportID}?\n\nThis will remove the record from your tracking dashboard.`)) {
                let allReports = getTable('brgy_reports');
                
                // Filter out the deleted report
                allReports = allReports.filter(r => r.reportID !== reportID);
                
                // Save back to DB
                saveTable('brgy_reports', allReports);
                
                // Reset page if needed and reload
                currentPage = 1;
                loadUserReports();
            }
        }

        // ==========================================
        // 🌟 VERTICAL PROGRESS MODAL LOGIC
        // ==========================================
        function openProgressModal(reportID) {
            const report = myReports.find(r => r.reportID === reportID);
            if(!report) return;

            // Animate Modal In
            const modalEl = document.getElementById('progressModal');
            const contentEl = document.getElementById('modalContent');
            modalEl.classList.remove('hidden');
            setTimeout(() => { contentEl.classList.remove('scale-95'); contentEl.classList.add('scale-100'); }, 10);

            document.getElementById('modalSubtitle').innerText = `Ref: ${report.reportID}`;
            document.getElementById('modalDate').innerText = report.timestamp;
            document.getElementById('modalCategory').innerText = report.category;
            document.getElementById('modalDescription').innerText = report.description || "No specific details provided.";
            
            // Timeline Inject
            document.getElementById('modalTimeline').innerHTML = generateVerticalTimeline(report);
            
            // Header Badge
            let sColor = report.status === 'Resolved' || report.status === 'Settled' ? 'badge-lg-green' : 
                         report.status === 'Failed' ? 'badge-lg-red' : 'badge-lg-orange';
            document.getElementById('modalStatusBadge').innerHTML = `<span class="status-badge-lg ${sColor}">${report.status}</span>`;

            // Dynamic Attributes
            let attrHTML = '';
            if(report.location && report.location.trim() !== '') {
                attrHTML += `
                <div class="attr-box mt-6">
                    <span class="attr-label">Location Context</span>
                    <span class="attr-value">${report.location}</span>
                </div>`;
            }
            if(report.proxyReporter) {
                attrHTML += `
                <div class="attr-box attr-proxy mt-6">
                    <span class="attr-label label-blue"><svg class="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Filed via Proxy</span>
                    <span class="attr-value value-blue">${report.proxyReporter.affectedName} <span class="attr-sub">(${report.proxyReporter.relationship})</span></span>
                    <span class="attr-contact">Contact: ${report.proxyReporter.contactNumber || 'N/A'}</span>
                </div>`;
            }
            if(report.respondents && report.respondents.length > 0) {
                attrHTML += `
                <div class="attr-box attr-respondent mt-6">
                    <span class="attr-label label-red">Respondents Named</span>
                    <div class="tag-group">
                        ${report.respondents.map(r => `<span class="tag-respondent"><svg class="icon-xs opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>${r}</span>`).join('')}
                    </div>
                </div>`;
            }
            document.getElementById('modalAttributesList').innerHTML = attrHTML;

            // Setup the Map
            const mapContainer = document.getElementById('modalMapContainer');
            if (report.coordinates && report.coordinates.lat) {
                mapContainer.classList.remove('hidden');
                mapContainer.classList.add('flex');
                setTimeout(() => {
                    const lat = parseFloat(report.coordinates.lat);
                    const lng = parseFloat(report.coordinates.lng);
                    if (!mapInstance) {
                        mapInstance = L.map('modalMap', { zoomControl: false }).setView([lat, lng], 16);
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapInstance);
                        markerInstance = L.marker([lat, lng]).addTo(mapInstance);
                    } else {
                        mapInstance.setView([lat, lng], 16);
                        markerInstance.setLatLng([lat, lng]);
                        mapInstance.invalidateSize(); 
                    }
                }, 250); 
            } else { mapContainer.classList.add('hidden'); mapContainer.classList.remove('flex'); }

            // Setup Photo
            const photoContainer = document.getElementById('modalPhotoContainer');
            const photoImg = document.getElementById('modalPhoto');
            if (report.photoEvidence && report.photoEvidence.startsWith('data:image')) {
                photoImg.src = report.photoEvidence;
                photoContainer.classList.remove('hidden');
                photoContainer.classList.add('flex');
            } else { photoContainer.classList.add('hidden'); photoContainer.classList.remove('flex'); }
        }

        function closeProgressModal() {
            const contentEl = document.getElementById('modalContent');
            contentEl.classList.remove('scale-100');
            contentEl.classList.add('scale-95');
            setTimeout(() => { document.getElementById('progressModal').classList.add('hidden'); }, 150);
        }

        // 🌟 Vertical Timeline Generator
        function generateVerticalTimeline(report) {
            let isDispute = report.reportType === 'Lupon Dispute';
            const normalSteps = ['Pending Verification', 'In Progress', 'Resolved'];
            const disputeSteps = ['Pending Lupon Review', 'Summon Issued', 'Mediation', 'Settled'];
            
            let steps = isDispute ? disputeSteps : normalSteps;
            let currentStatus = report.status;
            let isFailed = (currentStatus === 'Failed'); 
            
            if (isFailed && isDispute) steps[steps.length - 1] = 'Failed';

            let currentIndex = steps.indexOf(currentStatus);
            if (currentIndex === -1) currentIndex = 0; 

            let html = `<div class="timeline-container">`;

            steps.forEach((step, index) => {
                let isCompleted = index < currentIndex;
                let isCurrent = index === currentIndex;
                let isLast = index === steps.length - 1;

                let iconClass = "timeline-icon-pending";
                let textColor = "text-pending";
                let descText = isCompleted ? "Completed step" : "Awaiting action";

                if (isCompleted) {
                    iconClass = "timeline-icon-completed";
                    textColor = "text-completed";
                } else if (isCurrent) {
                    if ((isLast && currentStatus === 'Resolved') || (isLast && currentStatus === 'Settled')) {
                        iconClass = "timeline-icon-closed";
                        textColor = "text-closed";
                        descText = "Case Closed";
                    } else if (isLast && isFailed) {
                        iconClass = "timeline-icon-failed";
                        textColor = "text-failed";
                        descText = "Case Failed/Closed";
                    } else {
                        iconClass = "timeline-icon-current"; 
                        textColor = "text-current";
                        descText = "Currently processing";
                    }
                }

                let innerIcon = `<div class="timeline-dot-hollow"></div>`;
                if (isCompleted) innerIcon = `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
                if (isCurrent && isLast && isFailed) innerIcon = `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>`;
                if (isCurrent && isLast && !isFailed) innerIcon = `<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
                if (isCurrent && !isLast) innerIcon = `<div class="timeline-dot-pulse pulse-ring"></div>`;

                html += `
                    <div class="timeline-item group">
                        ${isCompleted && !isLast ? `<div class="timeline-line-active"></div>` : ''}
                        
                        <div class="timeline-icon ${iconClass}">
                            ${innerIcon}
                        </div>
                        <div class="timeline-content">
                            <h4 class="timeline-title ${textColor}">${step}</h4>
                            <p class="timeline-desc">${descText}</p>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            return html;
        }

        function logout() {
            localStorage.removeItem('brgy_active_session');
            sessionStorage.removeItem('activeSession');
            window.location.href = '../login/login.html'; 
        }
