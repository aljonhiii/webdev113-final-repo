
        let currentUser = null;
        let LOGGED_IN_USER_ID = null;

        // ==========================================
        // 0. AUTHENTICATION & PROFILE 
        // ==========================================
        const docFees = {
            'Barangay Clearance': 50.00,
            'Certificate of Indigency': 0.00, 
            'Cedula': 50.00,
            'Burial Assistance': 0.00,
            'Barangay ID': 150.00,
            'Certificate of Residency': 50.00,
            'Business Clearance': 300.00
        };

        document.addEventListener("DOMContentLoaded", () => {
            initDatabase();
            
            // 🔥 FIXED: Unified session checking without dummy data override
            const sessionData = localStorage.getItem('brgy_active_session') || sessionStorage.getItem('brgy_active_session');
            
            if (!sessionData) {
                window.location.href = '../login/login.html'; 
                return;
            }
            
            currentUser = JSON.parse(sessionData);
            LOGGED_IN_USER_ID = currentUser.residentID;

            document.getElementById('profileName').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
            if(document.getElementById('profileID')) document.getElementById('profileID').innerText = currentUser.residentID;
            document.getElementById('userInitial').innerText = currentUser.firstName.charAt(0).toUpperCase();

            checkProfileCompletion(currentUser);
            renderHistory();
        });

        function checkProfileCompletion(user) {
            const requiredKeys = ['phone', 'address', 'weight', 'height', 'bloodType', 'civilStatus', 'education', 'employment', 'income', 'householdSize', 'isHeadOfFamily', 'dwellingType', 'householdNumber', 'emergencyName', 'emergencyRel', 'emergencyPhone'];
            let filledCount = user.profilePic && user.profilePic.startsWith('data:image') ? 1 : 0;
            
            requiredKeys.forEach(key => { 
                if (user[key] && String(user[key]).trim() !== "") filledCount++; 
            });
            
            const p = Math.round((filledCount / (requiredKeys.length + 1)) * 100);
            const sb = document.getElementById('sidebarCompletionBadge');
            
            if(sb) { 
                if (p < 100) { 
                    sb.innerText = `${p}%`; 
                    sb.classList.remove('hidden'); 
                } else {
                    sb.classList.add('hidden');
                }
            }
        }

        function logout() {
            localStorage.removeItem('brgy_active_session');
            sessionStorage.removeItem('brgy_active_session');
            window.location.href = '../login/login.html'; 
        }

        // ==========================================
        // 1. DATA SCHEMA 
        // ==========================================
        
        const generalFormSchema = [
            { id: 'fullName', step: 1, label: 'Name', type: 'text', placeholder: 'Last Name, First Name, M.I.' },
            { id: 'address', step: 1, label: 'Address', type: 'text' },
            { id: 'civilStatus', step: 1, label: 'Civil Status', type: 'select', options: ['Single', 'Married', 'Widowed', 'Separated'] },
            { id: 'gender', step: 1, label: 'Gender', type: 'select', options: ['Male', 'Female'] },
            { id: 'birthdate', step: 1, label: 'Birthdate', type: 'date' },
            { id: 'birthplace', step: 1, label: 'Birthplace', type: 'text' },

            { id: 'monthsYearsStay', step: 2, label: 'Month/Years of stay', type: 'text', placeholder: 'e.g. 5 Years' },
            { id: 'requestorName', step: 2, label: 'Requestor Name', type: 'text', placeholder: 'If different from above (Optional)' },
            { id: 'relationship', step: 2, label: 'Relationship', type: 'text', placeholder: 'Relationship to subject (Optional)' },
            { id: 'purpose', step: 2, label: 'Purpose', type: 'text', placeholder: 'e.g. Employment, Assistance' },

            { id: 'age', step: 3, label: 'Age', type: 'number' },
            { id: 'contactNo', step: 3, label: 'Contact #', type: 'text' },
            { id: 'is4ps', step: 3, label: "4P's Member", type: 'select', options: ['No', 'Yes'] },
            { id: 'registeredVoter', step: 3, label: 'Registered Voter', type: 'select', options: ['Yes', 'No'] },
            { id: 'precinctNo', step: 3, label: 'Precinct # (Optional)', type: 'text' }
        ];

        const docSchemas = {
            'Barangay Clearance': generalFormSchema,
            'Certificate of Indigency': generalFormSchema,
            'Cedula': generalFormSchema,

            'Burial Assistance': [
                { id: 'fullName', step: 1, label: 'Name of Deceased', type: 'text' },
                { id: 'address', step: 1, label: 'Address', type: 'text' },
                { id: 'civilStatus', step: 1, label: 'Civil Status', type: 'select', options: ['Single', 'Married', 'Widowed', 'Separated'] },
                { id: 'gender', step: 1, label: 'Gender', type: 'select', options: ['Male', 'Female'] },
                { id: 'birthdate', step: 1, label: 'Birthdate', type: 'date' },
                { id: 'dateOfDead', step: 1, label: 'Date of Dead', type: 'date' },

                { id: 'requestorName', step: 2, label: 'Requestor Name', type: 'text' },
                { id: 'relationship', step: 2, label: 'Relationship to Deceased', type: 'text' },
                { id: 'monthsYearsStay', step: 2, label: 'Month/Years of stay', type: 'text' },
                { id: 'purpose', step: 2, label: 'Purpose', type: 'text', placeholder: 'e.g. Burial Assistance' },

                { id: 'age', step: 3, label: 'Age (Requestor)', type: 'number' },
                { id: 'contactNo', step: 3, label: 'Contact #', type: 'text' },
                { id: 'is4ps', step: 3, label: "4P's Member", type: 'select', options: ['No', 'Yes'] },
                { id: 'registeredVoter', step: 3, label: 'Registered Voter', type: 'select', options: ['Yes', 'No'] },
                { id: 'precinctNo', step: 3, label: 'Precinct # (Optional)', type: 'text' }
            ],

            'Barangay ID': [
                { id: 'lastName', step: 1, label: 'Last Name', type: 'text' },
                { id: 'firstName', step: 1, label: 'First Name', type: 'text' },
                { id: 'middleName', step: 1, label: 'Middle Name (Optional)', type: 'text' },
                { id: 'address', step: 1, label: 'Address', type: 'text' },
                { id: 'gender', step: 1, label: 'Gender', type: 'select', options: ['Male', 'Female'] },
                { id: 'birthDate', step: 1, label: 'Birth Date', type: 'date' },

                { id: 'civilStatus', step: 2, label: 'Civil Status', type: 'select', options: ['Single', 'Married', 'Widowed', 'Separated'] },
                { id: 'weight', step: 2, label: 'Weight in Kgs', type: 'number' },
                { id: 'height', step: 2, label: 'Height', type: 'text', placeholder: 'e.g. 5\'5" or 165cm' },
                { id: 'emergencyName', step: 2, label: 'In case of emergency: Name', type: 'text' },
                { id: 'emergencyAddress', step: 2, label: 'Emergency Address', type: 'text' },
                { id: 'emergencyRel', step: 2, label: 'Relationship', type: 'text' },

                { id: 'emergencyContact', step: 3, label: 'Emergency Contact No.', type: 'text' },
                { id: 'voterStatus', step: 3, label: "Voter's Registration", type: 'select', options: ['Registered', 'Not Registered'] },
                { id: 'precinctNo', step: 3, label: 'Precinct No. (Optional)', type: 'text' },
                { id: 'photo', step: 3, label: 'Upload ID Photo', type: 'file' },
                { id: 'signature', step: 3, label: 'Upload E-Signature (Optional)', type: 'file' }
            ],

            'Certificate of Residency': [
                { id: 'fullName', step: 1, label: 'Full Name', type: 'text' },
                { id: 'address', step: 1, label: 'Address', type: 'text' },
                { id: 'yearsStay', step: 2, label: 'Years of Stay', type: 'number' },
                { id: 'purpose', step: 3, label: 'Purpose', type: 'select', options: ['Proof of residency', 'School / Work requirement', 'Others'] }
            ],
            'Business Clearance': [
                { id: 'ownerName', step: 1, label: 'Owner Name', type: 'text' },
                { id: 'businessName', step: 1, label: 'Business Name', type: 'text' },
                { id: 'businessAddress', step: 2, label: 'Business Address', type: 'text' },
                { id: 'businessType', step: 2, label: 'Type of Business', type: 'text' },
                { id: 'purpose', step: 3, label: 'Purpose', type: 'text' }
            ]
        };

        // ==========================================
        // 2. WIZARD ENGINE & SMART AUTO-FILL
        // ==========================================
        let currentStep = 1;
        const totalSteps = 3;
        let activeSchema = [];

        const docTypeSelect = document.getElementById('docType');
        const formWrapper = document.getElementById('documentRequestForm');
        const dynamicContainer = document.getElementById('dynamicFieldsContainer');
        const feeBox = document.getElementById('feeDisplayBox');
        const feeAmountText = document.getElementById('feeAmountText');

        function getAutoFillValue(fieldId) {
            if (!currentUser) return '';
            
            if (currentUser[fieldId]) return currentUser[fieldId];
            
            const map = {
                'fullName': `${currentUser.firstName || ''} ${currentUser.middleName || ''} ${currentUser.lastName || ''}`.replace(/\s+/g, ' ').trim(),
                'firstName': currentUser.firstName || '',
                'lastName': currentUser.lastName || '',
                'middleName': currentUser.middleName || '',
                'address': currentUser.address || '',
                'contactNo': currentUser.phone || '',
                'contactNumber': currentUser.phone || '',
                'phone': currentUser.phone || '',
                'civilStatus': currentUser.civilStatus || '',
                'emergencyName': currentUser.emergencyName || '',
                'emergencyRel': currentUser.emergencyRel || '',
                'emergencyContact': currentUser.emergencyPhone || '',
                'birthDate': currentUser.birthday || '',
                'birthdate': currentUser.birthday || ''
            };

            return map[fieldId] || '';
        }

        docTypeSelect.addEventListener('change', function() {
            const selectedDoc = this.value;
            activeSchema = docSchemas[selectedDoc];
            currentStep = 1;
            
            const fee = docFees[selectedDoc];
            if (fee > 0) {
                feeAmountText.innerText = `₱${fee.toFixed(2)}`;
                feeBox.classList.remove('hidden');
                document.getElementById('submitBtn').innerHTML = `Proceed to Payment <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
            } else {
                feeAmountText.innerText = "FREE";
                feeBox.classList.remove('hidden');
                document.getElementById('submitBtn').innerHTML = `Submit Request <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
            }

            formWrapper.classList.remove('hidden'); 
            renderFormStep();
        });

        function handleFileUpload(event, fieldId) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const field = activeSchema.find(f => f.id === fieldId);
                    if (field) field.tempValue = e.target.result; 
                };
                reader.readAsDataURL(file); 
            }
        }

function renderFormStep() {
            dynamicContainer.innerHTML = '';
            const fieldsForStep = activeSchema.filter(f => f.step === currentStep);
            let delay = 0;

            fieldsForStep.forEach(field => {
                const isFullWidth = field.id.toLowerCase().includes('name') || field.id.toLowerCase().includes('address') || field.type === 'file';
                const colSpan = isFullWidth ? 'md:col-span-2' : '';
                
                // 🔥 EVERYTHING IS NOW OPTIONAL
                const requiredTag = ''; // Removed 'required'
                const asterisk = '';    // Removed '*'

                let autoValue = getAutoFillValue(field.id);
                let autoFillBadge = autoValue ? `<span class="ml-2 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-black tracking-widest shadow-sm border border-emerald-200">Auto-filled</span>` : '';

                let inputHTML = '';
                if(field.type === 'select'){
                    let opts = field.options.map(o => `<option value="${o}" ${autoValue === o ? 'selected' : ''}>${o}</option>`).join('');
                    inputHTML = `<select id="${field.id}" ${requiredTag} class="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 outline-none bg-white cursor-pointer shadow-inner">
                        <option value="" disabled ${!autoValue ? 'selected' : ''}>Select an option</option>
                        ${opts}
                    </select>`;
                } else if(field.type === 'file'){
                    inputHTML = `<div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl bg-white hover:bg-gray-50 transition cursor-pointer shadow-inner">
                        <input type="file" id="${field.id}" accept="image/*" ${requiredTag} class="text-xs font-bold text-gray-500 w-full cursor-pointer" onchange="handleFileUpload(event, '${field.id}')">
                    </div>`;
                } else {    
                    inputHTML = `<input type="${field.type}" id="${field.id}" ${requiredTag} value="${autoValue}" placeholder="${field.placeholder || ''}" class="w-full border border-gray-200 rounded-lg p-3 text-sm font-bold focus:border-blue-500 outline-none shadow-inner">`;
                }

                dynamicContainer.innerHTML += `
                    <div class="${colSpan} space-y-1.5 animate-fade-in" style="animation-delay: ${delay}ms">
                        <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            ${field.label} 
                            ${autoFillBadge}
                        </label>
                        ${inputHTML}
                    </div>
                `;
                delay += 50;
            });
            updateWizardUI();
        }

        function changeStep(direction) {
            if (direction === 1) {
                const inputs = dynamicContainer.querySelectorAll('input, select');
                let allValid = true;
                inputs.forEach(input => {
                    if (!input.checkValidity()) { input.reportValidity(); allValid = false; }
                });
                if (!allValid) return; 
            }

            const fieldsForStep = activeSchema.filter(f => f.step === currentStep);
            fieldsForStep.forEach(f => {
                const el = document.getElementById(f.id);
                if (el) f.tempValue = el.value; 
            });

            currentStep += direction;
            renderFormStep();

            const newFields = activeSchema.filter(f => f.step === currentStep);
            setTimeout(() => {
                newFields.forEach(f => {
                    const el = document.getElementById(f.id);
                    if (el && f.tempValue && f.type !== 'file') el.value = f.tempValue;
                });
            }, 0);
        }

        function updateWizardUI() {
            let percent = (currentStep / totalSteps) * 100;
            document.getElementById('progressBar').style.width = `${percent}%`;
            document.getElementById('stepPercentage').innerText = `${Math.round(percent)}%`;
            document.getElementById('stepIndicatorText').innerText = `Step ${currentStep} of 3`;

            document.getElementById('prevBtn').classList.toggle('hidden', currentStep === 1);
            
            if (currentStep === totalSteps) {
                document.getElementById('nextBtn').classList.add('hidden');
                document.getElementById('submitBtn').classList.remove('hidden');
            } else {
                document.getElementById('nextBtn').classList.remove('hidden');
                document.getElementById('submitBtn').classList.add('hidden');
            }
        }

        // ==========================================
        // 3. UNIVERSAL PAYMENT & SUBMIT
        // ==========================================
        let pendingPayload = {};
        let pendingDocType = "";
        let selectedPaymentMethod = "";

        function submitFinalForm() {
            const inputs = dynamicContainer.querySelectorAll('input, select');
            let allValid = true;
            inputs.forEach(input => {
                if (!input.checkValidity()) { input.reportValidity(); allValid = false; }
            });
            if (!allValid) return; 

            activeSchema.forEach(f => { 
                const el = document.getElementById(f.id);
                pendingPayload[f.id] = f.type === 'file' ? (f.tempValue || "") : (el ? el.value : f.tempValue); 
            });

            pendingDocType = docTypeSelect.value;
            const requiredFee = docFees[pendingDocType];

            if (typeof requestDocument !== 'function') {
                alert("CRITICAL ERROR: Cannot reach database.js.");
                return;
            }

            if (requiredFee > 0) {
                openPaymentModal(requiredFee);
            } else {
                finalizeSubmission("FREE-DOC");
            }
        }

        function openPaymentModal(amount) {
            document.getElementById('selectAmountText').innerText = `₱${amount.toFixed(2)}`;
            document.getElementById('processAmountText').innerText = `₱${amount.toFixed(2)}`;
            
            document.getElementById('paymentSelectionView').classList.remove('hidden');
            document.getElementById('paymentProcessingView').classList.add('hidden');
            document.getElementById('paymentModal').classList.remove('hidden');
            setTimeout(() => { document.getElementById('paymentContent').classList.remove('scale-95'); document.getElementById('paymentContent').classList.add('scale-100'); }, 10);
        }

        function closePaymentModal() {
            const content = document.getElementById('paymentContent');
            content.classList.remove('scale-100');
            content.classList.add('scale-95');
            setTimeout(() => { document.getElementById('paymentModal').classList.add('hidden'); }, 150);
        }

        function backToMethods() {
            document.getElementById('paymentProcessingView').classList.add('hidden');
            document.getElementById('paymentSelectionView').classList.remove('hidden');
        }

        function selectPayment(method) {
            selectedPaymentMethod = method;

            if(method === "Cash at Hall") {
                closePaymentModal();
                finalizeSubmission("PAY AT HALL");
                return;
            }

            document.getElementById('activePaymentTitle').innerText = method;
            
            const header = document.getElementById('paymentHeaderColor');
            const btn = document.getElementById('processPayBtn');
            const merchant = document.getElementById('processMerchantText');
            document.getElementById('paymentPin').value = '';
            document.getElementById('paymentPin').focus();

            if(method === 'GCash') {
                header.className = "payment-header-process bg-blue";
                btn.className = "btn-authorize-pay bg-blue";
                merchant.className = "merchant-text text-blue";
            } else if (method === 'Maya') {
                header.className = "payment-header-process bg-emerald";
                btn.className = "btn-authorize-pay bg-emerald";
                merchant.className = "merchant-text text-emerald";
            } else {
                header.className = "payment-header-process bg-dark";
                btn.className = "btn-authorize-pay bg-dark";
                merchant.className = "merchant-text text-dark";
            }

            document.getElementById('paymentSelectionView').classList.add('hidden');
            document.getElementById('paymentProcessingView').classList.remove('hidden');
        }

        function executeDigitalPayment() {
            const pin = document.getElementById('paymentPin').value;
            if (pin.length < 4) {
                alert("Please enter a 4-digit PIN for this POC.");
                return;
            }

            const btn = document.getElementById('processPayBtn');
            btn.innerHTML = `<svg class="animate-spin h-5 w-5 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
            
            setTimeout(() => {
                let prefix = selectedPaymentMethod === 'GCash' ? 'GC' : selectedPaymentMethod === 'Maya' ? 'MY' : 'CC';
                const fakeRefNumber = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
                
                closePaymentModal();
                btn.innerHTML = `AUTHORIZE PAYMENT`; 
                finalizeSubmission(fakeRefNumber);
            }, 1500);
        }

        function finalizeSubmission(paymentRef) {
            pendingPayload.paymentReference = paymentRef; 

            const rid = requestDocument(LOGGED_IN_USER_ID, pendingDocType, pendingPayload);
            if(rid) {
                formWrapper.classList.add('hidden'); 
                feeBox.classList.add('hidden');
                docTypeSelect.value = ''; 
                currentStep = 1;
                switchTab('history');
            } else {
                alert("System Error: Could not save document.");
            }
        }

        // ==========================================
        // 4. TAB & HISTORY RENDERER
        // ==========================================
        function switchTab(tabName) {
            const reqView = document.getElementById('view-request');
            const histView = document.getElementById('view-history');
            const reqTab = document.getElementById('tab-request');
            const histTab = document.getElementById('tab-history');

            if (tabName === 'request') {
                reqView.classList.remove('hidden');
                histView.classList.add('hidden');
                reqTab.classList.add('active');
                histTab.classList.remove('active');
            } else {
                reqView.classList.add('hidden');
                histView.classList.remove('hidden');
                histTab.classList.add('active');
                reqTab.classList.remove('active');
                renderHistory();
            }
        }

        function renderHistory() {
            const docs = getTable('brgy_documents').filter(d => d.residentID === LOGGED_IN_USER_ID);
            const container = document.getElementById('trackingContainer');
            const empty = document.getElementById('emptyState');
            
            container.innerHTML = '';
            if(docs.length === 0) empty.classList.replace('hidden', 'flex');
            else {
                empty.classList.replace('flex', 'hidden');
                docs.reverse().forEach(d => {
                    let step1Class = 'step-active'; let line1Class = '';
                    let step2Class = 'step-pending'; let line2Class = '';
                    let step3Class = 'step-pending';

                    let actionButton = `<button class="btn-track-status cursor-default">Track Status</button>`;

                    if (d.status === 'Issued') {
                        line1Class = 'line-active';
                        step2Class = 'step-active'; line2Class = 'line-active';
                        step3Class = 'step-active';

                        actionButton = `<button onclick="generatePDF('${d.requestID}')" class="btn-print-doc group-hover-opacity-100">
                                            <svg class="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg> 
                                            Print E-Document
                                        </button>`;
                    }

                    let badgeClass = 'badge-gray';
                    if(d.details.paymentReference) {
                        if(d.details.paymentReference === 'PAY AT HALL') badgeClass = 'badge-amber';
                        else if(d.details.paymentReference.startsWith('GC')) badgeClass = 'badge-blue';
                        else if(d.details.paymentReference.startsWith('MY')) badgeClass = 'badge-emerald';
                        else if(d.details.paymentReference.startsWith('CC')) badgeClass = 'badge-dark';
                    }

                    let paymentBadge = d.details.paymentReference && d.details.paymentReference !== "FREE-DOC" 
                        ? `<span class="payment-badge ${badgeClass}">Paid: ${d.details.paymentReference}</span>`
                        : '';

                    const cardHTML = `
                        <div class="history-card group">
                            <div class="history-card-header">
                                <div>
                                    <div class="history-title-row">
                                        <h4 class="history-title">${d.documentType}</h4>
                                        ${paymentBadge}
                                    </div>
                                    <p class="history-id">Tracking ID: <span>#${d.requestID}</span></p>
                                </div>
                                <div class="text-right">
                                    <p class="history-date-label">Date Filed</p>
                                    <p class="history-date-value">${d.dateRequested}</p>
                                    <div class="history-actions">${actionButton}</div>
                                </div>
                            </div>

                            <div class="history-tracker">
                                <div class="tracker-line-base"></div>
                                <div class="tracker-line-1 ${line1Class}"></div>
                                <div class="tracker-line-2 ${line2Class}"></div>

                                <div class="tracker-step">
                                    <div class="step-dot ${step1Class}"></div>
                                    <span class="step-label ${step1Class}">Submitted</span>
                                </div>
                                <div class="tracker-step">
                                    <div class="step-dot ${step2Class}"></div>
                                    <span class="step-label ${step2Class}">Processing</span>
                                </div>
                                <div class="tracker-step">
                                    <div class="step-dot ${step3Class}"></div>
                                    <span class="step-label ${step3Class}">Ready</span>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += cardHTML;
                });
            }
        }

        // ==========================================
        // 5. ADVANCED PDF GENERATOR
        // ==========================================
        function generatePDF(reqID) {
            const docs = getTable('brgy_documents');
            const doc = docs.find(d => d.requestID === reqID);
            if(!doc) return;

            const details = doc.details;
            const printWindow = window.open('', '', 'width=900,height=800');

            // 🟢 IF DOCUMENT IS BARANGAY ID -> GENERATE PVC CARD LAYOUT
            if (doc.documentType === 'Barangay ID') {
                let printName = `${details.lastName || ''}, ${details.firstName || ''} ${details.middleName ? details.middleName.charAt(0) + '.' : ''}`.toUpperCase();
                let issueDate = doc.issueDate || new Date().toLocaleDateString();
                let validUntil = new Date();
                validUntil.setFullYear(validUntil.getFullYear() + 1);
                validUntil = validUntil.toLocaleDateString();

                let photoBox = details.photo && details.photo.startsWith('data:image') 
                    ? `<img src="${details.photo}" class="w-full h-full object-cover">` 
                    : `<span class="text-[8px] font-bold text-gray-400">PHOTO</span>`;

                let signatureBox = details.signature && details.signature.startsWith('data:image')
                    ? `<img src="${details.signature}" class="h-6 mx-auto object-contain mb-0.5">`
                    : `<div class="h-6"></div>`;

                printWindow.document.write(`
                    <html>
                    <head>
                        <title>Print - Barangay ID Card</title>
                        <script src="https://cdn.tailwindcss.com"><\/script>
                        <style>
                            @media print {
                                @page { size: letter; margin: 0.5in; }
                                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            }
                            .id-card {
                                width: 3.375in;
                                height: 2.125in;
                                border: 1px solid #e5e7eb;
                                position: relative;
                                background-color: white;
                                overflow: hidden;
                                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            }
                            .bg-id-theme { background-color: #1e3a8a; } 
                        </style>
                    </head>
                    <body class="bg-gray-100 p-8 flex flex-col items-center gap-8">
                        
                        <div class="text-center mb-4">
                            <h2 class="text-xl font-black text-gray-800 uppercase">Barangay ID - Print Layout</h2>
                            <p class="text-sm text-gray-500">Ensure printer is set to 100% scale and "Print Background Graphics" is enabled.</p>
                            <button onclick="window.print()" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">Print ID</button>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest text-center">Front Side</p>
                            <div class="id-card shadow-lg rounded-md">
                                <div class="bg-id-theme w-full h-[45px] text-white flex flex-col items-center justify-center relative">
                                    <div class="absolute left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-[6px]">LOGO</div>
                                    <div class="absolute right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-[6px]">LOGO</div>
                                    
                                    <p class="text-[6px] uppercase tracking-widest leading-tight">Republic of the Philippines</p>
                                    <p class="text-[7px] uppercase tracking-widest leading-tight">Zamboanga City</p>
                                    <h1 class="text-[14px] font-black tracking-widest uppercase mt-0.5 shadow-sm">BARANGAY TUMAGA</h1>
                                </div>

                                <div class="absolute top-[52px] left-[10px] w-[70px] h-[70px] border-2 border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    ${photoBox}
                                </div>

                                <div class="absolute top-[52px] left-[90px] right-[10px]">
                                    <h2 class="text-[12px] font-black leading-tight text-gray-900">${printName}</h2>
                                    <p class="text-[7px] text-gray-700 leading-tight mt-0.5">ADDRESS: <span class="font-bold">${details.address || 'N/A'}</span></p>
                                    
                                    <div class="grid grid-cols-2 gap-x-2 mt-1.5 text-[6.5px] text-gray-700">
                                        <p>DATE OF BIRTH: <span class="font-bold">${details.birthDate || 'N/A'}</span></p>
                                        <p>NATIONALITY: <span class="font-bold">FILIPINO</span></p>
                                        <p>GENDER: <span class="font-bold">${details.gender || 'N/A'}</span></p>
                                        <p>CIVIL STATUS: <span class="font-bold uppercase">${details.civilStatus || 'N/A'}</span></p>
                                        <p>WEIGHT: <span class="font-bold">${details.weight ? details.weight + ' kg' : 'N/A'}</span></p>
                                        <p>HEIGHT: <span class="font-bold">${details.height || 'N/A'}</span></p>
                                    </div>
                                </div>

                                <div class="absolute bottom-[8px] left-[10px] right-[10px] flex justify-between items-end">
                                    <div class="w-[70px] text-center">
                                        ${signatureBox}
                                        <div class="border-b border-gray-800 w-full mb-0.5"></div>
                                        <p class="text-[6px] font-bold text-gray-600">SIGNATURE</p>
                                        <p class="text-[6px] text-gray-500 mt-2 text-left">DATE ISSUED: <span class="text-red-600 font-bold">${issueDate}</span></p>
                                        <p class="text-[6px] text-gray-500 text-left">VALID UNTIL: <span class="text-red-600 font-bold">${validUntil}</span></p>
                                    </div>
                                    
                                    <div class="text-center w-[110px]">
                                        <p class="text-[7px] font-black border-b border-gray-800 mb-0.5">JUAN DELA CRUZ</p>
                                        <p class="text-[6px] italic text-gray-600">Punong Barangay</p>
                                    </div>

                                    <div class="w-[40px] h-[40px] border border-gray-300 p-0.5 bg-white flex items-center justify-center">
                                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reqID}" class="w-full h-full opacity-80" alt="QR">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p class="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest text-center mt-4">Back Side</p>
                            <div class="id-card shadow-lg rounded-md flex flex-col justify-between">
                                <div class="bg-id-theme w-full h-[35px] text-white flex items-center px-4">
                                    <p class="text-[11px] font-black tracking-widest">ID NO. ${reqID.replace('REQ-', '')} <span class="text-blue-300">>>>>>>>>>></span></p>
                                </div>

                                <div class="p-4 flex-1 relative">
                                    <div class="absolute right-4 top-4 w-24 h-24 border-4 border-gray-100 rounded-full flex items-center justify-center opacity-30 transform -rotate-12">
                                        <p class="text-[10px] font-black text-gray-300 text-center uppercase">Barangay<br>Tumaga</p>
                                    </div>

                                    <div class="relative z-10 w-2/3">
                                        <p class="text-[8px] font-bold text-blue-800 underline uppercase mb-2 tracking-wide">In Case of Emergency</p>
                                        
                                        <p class="text-[6.5px] font-bold text-gray-500">CONTACT PERSON:</p>
                                        <p class="text-[9px] font-black text-gray-900 mb-1 uppercase">${details.emergencyName || 'N/A'}</p>
                                        
                                        <p class="text-[6.5px] font-bold text-gray-500">RELATIONSHIP:</p>
                                        <p class="text-[8px] font-bold text-gray-800 mb-1 uppercase">${details.emergencyRel || 'N/A'}</p>

                                        <p class="text-[6.5px] font-bold text-gray-500">CONTACT NUMBER:</p>
                                        <p class="text-[9px] font-black text-gray-900 mb-3">${details.emergencyContact || 'N/A'}</p>

                                        <p class="text-[7.5px] font-black text-gray-800 tracking-wider">** THIS IS NOT TRANSFERABLE **</p>
                                    </div>
                                </div>

                                <div class="bg-gray-100 w-full py-1.5 text-center border-t border-gray-200">
                                    <p class="text-[6px] font-bold text-gray-600 uppercase">If found, please return to:</p>
                                    <p class="text-[7px] font-black text-gray-800 uppercase">Barangay Hall, Tumaga, Zamboanga City</p>
                                </div>
                            </div>
                        </div>

                    </body>
                    </html>
                `);
                printWindow.document.close();
            } 
            // 🟢 IF DOCUMENT IS NORMAL CERTIFICATE -> GENERATE A4 LETTER LAYOUT
            else {
                let printName = details.fullName || `${details.firstName || ''} ${details.middleName || ''} ${details.lastName || ''}`.trim() || '_______________';
                let bodyText = "";
                let documentTitle = doc.documentType.toUpperCase();

                if (doc.documentType === 'Certificate of Indigency') {
                    bodyText = `TO WHOM IT MAY CONCERN:<br><br>
                    This is to certify that <strong>${printName}</strong>, of legal age, ${details.civilStatus || 'single'}, is a bona fide resident of <strong>${details.address || 'this Barangay'}</strong>.<br><br>
                    This further certifies that based on the records of this office, the above-named person belongs to the indigent families in this Barangay.<br><br>
                    This certification is being issued upon the request of the interested party for <strong>${details.purpose || 'any legal intent'}</strong>.`;
                } 
                else if (doc.documentType === 'Barangay Clearance') {
                    bodyText = `TO WHOM IT MAY CONCERN:<br><br>
                    This is to certify that <strong>${printName}</strong>, a Filipino citizen, of legal age, and a resident of <strong>${details.address || 'this Barangay'}</strong>, is known to me to be a person of good moral character and a law-abiding citizen.<br><br>
                    Records of this office show that he/she has <strong>NO PENDING CASE</strong> nor any derogatory record filed against him/her.<br><br>
                    This clearance is issued upon the request of the interested party for <strong>${details.purpose || 'reference'}</strong> purposes.`;
                }
                else if (doc.documentType === 'Certificate of Residency') {
                    let stay = details.yearsStay || details.monthsYearsStay || 'several';
                    bodyText = `TO WHOM IT MAY CONCERN:<br><br>
                    This is to certify that <strong>${printName}</strong>, of legal age, is a recognized and bona fide resident of <strong>${details.address || 'this Barangay'}</strong>.<br><br>
                    Based on our records and profiling, he/she has been continuously residing in this barangay for <strong>${stay}</strong> years/months.<br><br>
                    Issued upon request for <strong>${details.purpose || 'reference'}</strong> purposes.`;
                }
                else if (doc.documentType === 'Business Clearance') {
                    bodyText = `TO WHOM IT MAY CONCERN:<br><br>
                    This is to certify that <strong>${details.businessName || 'the business establishment'}</strong>, located at <strong>${details.businessAddress || 'this Barangay'}</strong> and owned/managed by <strong>${details.ownerName || printName}</strong>, is a registered <strong>${details.businessType || 'commercial'}</strong> entity within this jurisdiction.<br><br>
                    This clearance is granted in accordance with the provisions of the Barangay Revenue Code, provided that the owner complies with all existing laws, ordinances, and health protocols.<br><br>
                    Issued for <strong>${details.purpose || 'Business Permit Application'}</strong>.`;
                }
                else if (doc.documentType === 'Burial Assistance') {
                    let requestor = details.requestorName || 'the immediate family';
                    let rel = details.relationship ? `(${details.relationship})` : '';
                    bodyText = `TO WHOM IT MAY CONCERN:<br><br>
                    This is to certify the demise of <strong>${printName}</strong>, a former resident of <strong>${details.address || 'this Barangay'}</strong>, who passed away on <strong>${details.dateOfDead || '_______________'}</strong>.<br><br>
                    This certification is officially issued upon the request of <strong>${requestor} ${rel}</strong> to serve as supporting documentation for <strong>Burial Assistance</strong> and other legal purposes.`;
                }
                else if (doc.documentType === 'Cedula') {
                    bodyText = `TO WHOM IT MAY CONCERN:<br><br>
                    This is to certify that <strong>${printName}</strong>, born on <strong>${details.birthdate || '_______________'}</strong> at <strong>${details.birthplace || '_______________'}</strong>, is a registered resident of <strong>${details.address || 'this Barangay'}</strong>.<br><br>
                    This certification is issued to facilitate the acquisition of a Community Tax Certificate (Cedula) at the City Treasurer's Office for <strong>${details.purpose || 'legal transactions'}</strong>.`;
                }
                else {
                    bodyText = `TO WHOM IT MAY CONCERN:<br><br>
                    This document certifies the requested information for <strong>${printName}</strong> regarding their application for a ${doc.documentType}.<br><br>
                    Verified by the Barangay records under Tracking ID: ${doc.requestID}.`;
                }

                printWindow.document.write(`
                    <html>
                    <head>
                        <title>Print - ${doc.documentType}</title>
                        <script src="https://cdn.tailwindcss.com"><\/script>
                    </head>
                    <body class="p-12 font-serif text-gray-900 bg-white">
                        
                        <div class="text-center mb-10 border-b-2 border-gray-900 pb-8 relative">
                            <p class="uppercase text-sm tracking-widest font-bold">Republic of the Philippines</p>
                            <p class="uppercase text-sm tracking-widest">City of Zamboanga</p>
                            <p class="uppercase font-black text-2xl mt-2 tracking-widest text-blue-900">BARANGAY GOVERNMENT OF TUMAGA</p>
                            <p class="text-xs mt-1 font-sans tracking-widest text-gray-500">OFFICE OF THE PUNONG BARANGAY</p>
                        </div>

                        <div class="text-center mb-12 mt-8">
                            <h1 class="text-3xl font-black uppercase tracking-[0.2em] underline underline-offset-8">${documentTitle}</h1>
                        </div>

                        <div class="text-justify leading-loose text-lg px-8">
                            <p>${bodyText}</p>
                            <br><br>
                            <p>Issued this <strong>${doc.issueDate || new Date().toLocaleDateString()}</strong> at the Barangay Hall of Tumaga.</p>
                            <p class="text-sm mt-2 text-gray-500">Valid until: <strong>${doc.validityDate || 'Six (6) months from issuance'}</strong></p>
                        </div>

                        <div class="mt-32 px-8 flex justify-between items-end">
                            <div class="text-left">
                                ${doc.details.orNumber && doc.details.orNumber !== 'FREE' ? `<p class="text-sm font-mono mb-1">OR No: <strong>${doc.details.orNumber}</strong></p>` : ''}
                                ${doc.details.paymentReference && doc.details.paymentReference !== 'FREE-DOC' ? `<p class="text-sm font-mono mb-1 text-gray-500">Payment Ref: <strong>${doc.details.paymentReference}</strong></p>` : '<p class="text-sm font-mono mb-1 text-gray-500">Processing: <strong>FREE / WAIVED</strong></p>'}
                                <p class="text-xs font-mono text-gray-400 mt-4">System Ref: ${doc.requestID}</p>
                            </div>
                            
                            <div class="text-center">
                                <div class="border-b-2 border-gray-900 w-72 mb-2"></div>
                                <p class="font-black uppercase text-xl text-gray-900">Hon. Barangay Captain</p>
                                <p class="text-md italic text-gray-600">Punong Barangay</p>
                            </div>
                        </div>
                        
                        <div class="mt-20 text-center border-t border-gray-200 pt-4">
                            <p class="text-[10px] text-gray-400 font-sans uppercase tracking-widest">Generated by iM ISSUE Barangay System • Not valid without official dry seal</p>
                        </div>

                    </body>
                    </html>
                `);
                printWindow.document.close();
                setTimeout(() => { printWindow.print(); }, 800);
            }
        }
