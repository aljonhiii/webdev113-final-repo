
        const totalSteps = 4;
        const FAKE_OTP = "123456";

        document.addEventListener("DOMContentLoaded", () => {
            if (typeof initDatabase === 'function') {
                initDatabase();
            } else {
                console.warn("database.js not found. Registration will default to basic localStorage.");
            }
        });

        function validateRealTime(field) {
            const errorEl = document.getElementById('err_' + field.id);
            if (!errorEl) return true;

            if (!field.checkValidity()) {
                errorEl.classList.remove('hidden');
                field.classList.add('error-border');
                
                if (field.validity.valueMissing) {
                    errorEl.innerText = "This field is required.";
                } else if ((field.validity.patternMismatch || field.validity.typeMismatch) && field.title) {
                    errorEl.innerText = field.title;
                } else {
                    errorEl.innerText = field.validationMessage;
                }
                return false;
            } else {
                errorEl.classList.add('hidden');
                field.classList.remove('error-border');
                return true;
            }
        }

        function checkPasswordMatch() {
            const pwd = document.getElementById('reg_password');
            const confirm = document.getElementById('confirm_password');
            const errorEl = document.getElementById('err_confirm_password');

            if (confirm.value !== "") {
                if (pwd.value !== confirm.value) {
                    errorEl.innerText = "Passwords do not match.";
                    errorEl.classList.remove('hidden');
                    confirm.classList.add('error-border');
                    return false;
                } else {
                    errorEl.classList.add('hidden');
                    confirm.classList.remove('error-border');
                    return true;
                }
            }
            return false;
        }

        function nextStep(currentStep) {
            const currentDiv = document.getElementById(`step${currentStep}`);
            const inputs = currentDiv.querySelectorAll('input, select');
            let isValid = true;

            for (let input of inputs) {
                if (input.name === 'confirm_password') {
                    if (!checkPasswordMatch()) isValid = false;
                } else {
                    if (!validateRealTime(input)) isValid = false;
                }
            }

            if (isValid) {
                document.getElementById(`step${currentStep}`).classList.add('hidden');
                document.getElementById(`step${currentStep + 1}`).classList.remove('hidden');
                updateProgressBar(currentStep + 1);
            }
        }

        function prevStep(currentStep) {
            document.getElementById(`step${currentStep}`).classList.add('hidden');
            document.getElementById(`step${currentStep - 1}`).classList.remove('hidden');
            updateProgressBar(currentStep - 1);
            
            if (currentStep === 4) {
                document.getElementById('signInLinkBlock').classList.remove('hidden');
                document.getElementById('stepIndicators').classList.remove('hidden');
                document.getElementById('subtitleText').innerText = "Create your secure barangay account.";
            }
        }

        function updateProgressBar(step) {
            for (let i = 1; i <= totalSteps; i++) {
                const indicator = document.getElementById(`step-indicator-${i}`);
                if(indicator) {
                    if (i <= step) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                }
            }
        }

        function simulateSendOTP() {
            if (!checkPasswordMatch() || !validateRealTime(document.getElementById('reg_password')) || !validateRealTime(document.getElementById('email'))) {
                return; 
            }

            const emailInput = document.getElementById('email').value;
            let residents = (typeof getTable === 'function') ? getTable('brgy_residents') : JSON.parse(localStorage.getItem('brgy_residents')) || [];
            const userExists = residents.find(user => user.email === emailInput);
            
            if (userExists) {
                const errorBox = document.getElementById('server_error');
                errorBox.innerText = "An account with this email address already exists.";
                errorBox.classList.remove('hidden');
                return;
            }

            // Direct transition without delay
            document.getElementById('step3').classList.add('hidden');
            document.getElementById('step4').classList.remove('hidden');
            document.getElementById('displayEmail').innerText = emailInput;
            document.getElementById('signInLinkBlock').classList.add('hidden');
            document.getElementById('stepIndicators').classList.add('hidden');
            document.getElementById('subtitleText').innerText = "Security Verification";
        }

        // ==========================================
        // DEDICATED AUTO-FILL FUNCTION WITH LOADER
        // ==========================================
        function autoFillOTP() {
            const btn = document.getElementById('demoAutoFillBtn');
            const btnText = document.getElementById('demoBtnText');
            const loader = document.getElementById('demoBtnLoader');
            const otpInput = document.getElementById('otp_input');

            // 1. Show Loading State on the button
            btn.disabled = true;
            btnText.innerText = "Retrieving Code...";
            loader.classList.remove('hidden');
            
            // Clear input
            otpInput.value = "";

            // 2. Delay for 1.5 seconds, then auto-fill
            setTimeout(() => {
                // Restore Button
                btn.disabled = false;
                btnText.innerText = "[Demo Mode] Auto-Fill Sample OTP";
                loader.classList.add('hidden');

                // Fill the Input
                otpInput.value = FAKE_OTP;
                
                // Clear any previous errors
                document.getElementById('err_otp').classList.add('hidden');
                otpInput.classList.remove('error-border');
                
            }, 1500); // 1.5 seconds loading simulation
        }

        // Instant Database Submission
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const otpInput = document.getElementById('otp_input');
            const otpError = document.getElementById('err_otp');

            if (otpInput.value !== FAKE_OTP) {
                otpError.classList.remove('hidden');
                otpInput.classList.add('error-border');
                return;
            }

            const newResID = (typeof generateID === 'function') ? generateID('RES') : 'RES-' + Date.now();
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('reg_password').value;

            const newUser = {
                residentID: newResID,
                firstName: document.getElementById('first_name').value,
                lastName: document.getElementById('last_name').value,
                middleName: document.getElementById('middle_name').value,
                birthday: document.getElementById('birthday').value,
                purok: document.getElementById('purok').value,
                address: document.getElementById('street').value ? `${document.getElementById('street').value}, ${document.getElementById('purok').value}` : document.getElementById('purok').value,
                phone: document.getElementById('phone_number').value,
                email: emailInput,
                password: passwordInput,
                
                profileStatus: "Pending", 
                voterStatus: "Unverified",
                isIndigent: false,
                role: 'user' 
            };

            let residents = (typeof getTable === 'function') ? getTable('brgy_residents') : JSON.parse(localStorage.getItem('brgy_residents')) || [];
            residents.push(newUser);

            if (typeof saveTable === 'function') {
                saveTable('brgy_residents', residents);
            } else {
                localStorage.setItem('brgy_residents', JSON.stringify(residents));
            }

            // Direct alert and redirect
            alert("Email Verified! Account created successfully. Your profile is pending verification by the Barangay Admin.");
            window.location.href = 'login.html';
        });
  