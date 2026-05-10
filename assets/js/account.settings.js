
        let currentUser = null;
        let base64Photo = null;

        // ✨ UPDATED: Added 'profHouseNumber' to the exact fields needed for 100% completion
        const requiredFieldsForCompletion = [
            'profPhone', 'profAddress', 'profWeight', 'profHeight', 'profBloodType', 'profCivilStatus',
            'profEducation', 'profEmployment', 'profIncome', 'profHouseSize', 'profHead', 'profDwelling', 'profHouseNumber',
            'emerName', 'emerRel', 'emerPhone'
        ];

        document.addEventListener("DOMContentLoaded", () => {
            initDatabase();
            loadUserProfile();
        });

        function loadUserProfile() {
            const sessionData = localStorage.getItem('brgy_active_session') || sessionStorage.getItem('brgy_active_session');
            if (!sessionData) {
                window.location.href = '../login/login.html';
                return;
            }

            const residents = getTable('brgy_residents');
            const sessionUser = JSON.parse(sessionData);
            currentUser = residents.find(r => r.residentID === sessionUser.residentID) || sessionUser;

            document.getElementById('profileName').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('profileID').innerText = currentUser.residentID;
            document.getElementById('displayFullName').innerText = `${currentUser.firstName} ${currentUser.lastName}`;
            
            if(currentUser.profilePic && currentUser.profilePic.startsWith('data:image')) {
                base64Photo = currentUser.profilePic;
                document.getElementById('mainProfilePic').innerHTML = `<img src="${base64Photo}" class="w-full h-full object-cover">`;
                document.getElementById('miniProfilePicContainer').innerHTML = `<img src="${base64Photo}" class="w-full h-full object-cover">`;
            } else {
                document.getElementById('userInitial').innerText = currentUser.firstName.charAt(0).toUpperCase();
            }

            const badgeProfile = document.getElementById('badgeProfile');
            if(currentUser.profileStatus === 'Verified') {
                badgeProfile.className = "badge-verified";
                badgeProfile.innerText = "Verified Resident";
            }

            const badgeVoter = document.getElementById('badgeVoter');
            if(currentUser.voterStatus === 'Registered') {
                badgeVoter.className = "badge-voter";
                badgeVoter.innerText = "Registered Voter";
            }

            // Populate Fields
            document.getElementById('profPhone').value = currentUser.phone || '';
            document.getElementById('profEmail').value = currentUser.email || '';
            document.getElementById('profAddress').value = currentUser.address || '';
            
            document.getElementById('profWeight').value = currentUser.weight || '';
            document.getElementById('profHeight').value = currentUser.height || '';
            document.getElementById('profBloodType').value = currentUser.bloodType || '';
            document.getElementById('profCivilStatus').value = currentUser.civilStatus || '';

            document.getElementById('profEducation').value = currentUser.education || '';
            document.getElementById('profEmployment').value = currentUser.employment || '';
            document.getElementById('profIncome').value = currentUser.income || '';
            document.getElementById('profHouseSize').value = currentUser.householdSize || '';
            document.getElementById('profHead').value = currentUser.isHeadOfFamily || '';
            document.getElementById('profDwelling').value = currentUser.dwellingType || '';
            
            // ✨ LOAD Household Number
            document.getElementById('profHouseNumber').value = currentUser.householdNumber || '';

            document.getElementById('emerName').value = currentUser.emergencyName || '';
            document.getElementById('emerRel').value = currentUser.emergencyRel || '';
            document.getElementById('emerPhone').value = currentUser.emergencyPhone || '';

            // Run initial calculation
            liveCalculate();
        }

        function handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    base64Photo = e.target.result;
                    document.getElementById('mainProfilePic').innerHTML = `<img src="${base64Photo}" class="w-full h-full object-cover">`;
                    document.getElementById('miniProfilePicContainer').innerHTML = `<img src="${base64Photo}" class="w-full h-full object-cover">`;
                    liveCalculate(); // Photo counts towards completion
                };
                reader.readAsDataURL(file);
            }
        }

        // CALCULATION LOGIC
        function liveCalculate() {
            let filledCount = 0;
            const totalRequired = requiredFieldsForCompletion.length + 1; // +1 for the profile picture

            requiredFieldsForCompletion.forEach(fieldId => {
                const val = document.getElementById(fieldId).value.trim();
                if (val !== "") filledCount++;
            });

            if (base64Photo) filledCount++;

            const percentage = Math.round((filledCount / totalRequired) * 100);
            updateBadges(percentage);
        }

        function updateBadges(percentage) {
            const sidebarBadge = document.getElementById('sidebarCompletionBadge');
            const mainBanner = document.getElementById('completionBanner');
            const pBar = document.getElementById('completionBar');
            const pText = document.getElementById('completionText');

            // Update Progress Bar
            pBar.style.width = `${percentage}%`;
            pText.innerText = `${percentage}%`;

            if (percentage < 100) {
                // Show Sidebar Badge
                sidebarBadge.innerText = `${percentage}%`;
                sidebarBadge.classList.remove('hidden');
                
                // Show Main Banner
                mainBanner.classList.remove('hidden');
            } else {
                // Hide Badges & Banners when 100% complete
                sidebarBadge.classList.add('hidden');
                mainBanner.classList.add('hidden');
            }
        }

        function saveProfile() {
            if(!currentUser) return;

            const residents = getTable('brgy_residents');
            const resIndex = residents.findIndex(r => r.residentID === currentUser.residentID);

            if(resIndex !== -1) {
                // Base
                residents[resIndex].profilePic = base64Photo;
                residents[resIndex].phone = document.getElementById('profPhone').value;
                residents[resIndex].address = document.getElementById('profAddress').value;
                
                // Physical
                residents[resIndex].weight = document.getElementById('profWeight').value;
                residents[resIndex].height = document.getElementById('profHeight').value;
                residents[resIndex].bloodType = document.getElementById('profBloodType').value;
                residents[resIndex].civilStatus = document.getElementById('profCivilStatus').value;

                // Household Mapping Data
                residents[resIndex].education = document.getElementById('profEducation').value;
                residents[resIndex].employment = document.getElementById('profEmployment').value;
                residents[resIndex].income = document.getElementById('profIncome').value;
                residents[resIndex].householdSize = document.getElementById('profHouseSize').value;
                residents[resIndex].isHeadOfFamily = document.getElementById('profHead').value;
                residents[resIndex].dwellingType = document.getElementById('profDwelling').value;
                
                // ✨ SAVE Household Number
                residents[resIndex].householdNumber = document.getElementById('profHouseNumber').value;

                // Emergency
                residents[resIndex].emergencyName = document.getElementById('emerName').value;
                residents[resIndex].emergencyRel = document.getElementById('emerRel').value;
                residents[resIndex].emergencyPhone = document.getElementById('emerPhone').value;

                saveTable('brgy_residents', residents);
                localStorage.setItem('brgy_active_session', JSON.stringify(residents[resIndex]));

                // Run final calculation
                liveCalculate();

                alert("Profile and Household Data successfully updated! You are ready for Leaflet mapping.");
            } else {
                alert("Error saving profile. Please log in again.");
            }
        }

        function logout() {
            localStorage.removeItem('brgy_active_session');
            sessionStorage.removeItem('activeSession');
            alert("You have been signed out.");
            window.location.href = '../login/login.html';
        }
