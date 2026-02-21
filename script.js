document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // --- TECH ORBIT ANIMATION CONFIGURATION ---
    // ==========================================
    const orbitConfig = {
        icons: [
            'gallery/cpp_icon.png',
            'gallery/cs_icon.png',
            'gallery/qt_icon.png',
            'gallery/boost_icon.png',
            'gallery/unity_logo.svg',
            'gallery/python_logo.png',
            'gallery/unigine_logo.png'
        ],
        iconSize: 45, opacity: 0.6, radiusX: 500, radiusY: 300, 
        baseSpeed: 0.0015, selfSpinSpeed: 0.6, wobbleRadius: 25, 
        wobbleSpeed: 0.002, angleDrift: 0.35, repelRadius: 150, 
        repelForce: 60, collisionRadius: 65, collisionForce: 0.2 
    };

    // --- ORBIT ENGINE LOGIC ---
    const targetHeader = document.querySelector('.hero-content h1');
    const heroSection = document.querySelector('.hero-section');

    if (targetHeader && heroSection) {
        const orbitContainer = document.createElement('div');
        orbitContainer.style.position = 'absolute';
        orbitContainer.style.top = '0';
        orbitContainer.style.left = '0';
        orbitContainer.style.width = '100%';
        orbitContainer.style.height = '100%';
        orbitContainer.style.pointerEvents = 'none'; 
        orbitContainer.style.zIndex = '1';           
        heroSection.appendChild(orbitContainer);

        const iconData = [];

        orbitConfig.icons.forEach((src, index) => {
            const img = document.createElement('img');
            img.src = src;
            img.style.position = 'absolute';
            img.style.top = '30px';  
            img.style.left = '0px'; 
            img.style.width = `${orbitConfig.iconSize}px`;
            img.style.height = `${orbitConfig.iconSize}px`;
            img.style.objectFit = 'contain';
            img.style.opacity = orbitConfig.opacity;
            img.style.filter = 'drop-shadow(0 0 10px rgba(27, 162, 219, 0.4))';
            
            orbitContainer.appendChild(img);

            iconData.push({
                el: img,
                baseAngleOffset: (Math.PI * 2 / orbitConfig.icons.length) * index,
                driftPhase: Math.random() * Math.PI * 2,
                driftSpeed: 0.0005 + (Math.random() * 0.001), 
                wobbleX: Math.random() * Math.PI * 2,
                wobbleY: Math.random() * Math.PI * 2,
                spin: Math.random() * 360,
                spinDir: Math.random() > 0.5 ? 1 : -1,
                baseX: 0, baseY: 0, targetPushX: 0, targetPushY: 0,
                currentPushX: 0, currentPushY: 0, targetGlow: 0, currentGlow: 0
            });
        });

        let centerX = 0, centerY = 0;

        function updateCenter() {
            const headerRect = targetHeader.getBoundingClientRect();
            const sectionRect = heroSection.getBoundingClientRect();
            centerX = (headerRect.left - sectionRect.left) + (headerRect.width / 2);
            centerY = (headerRect.top - sectionRect.top) + (headerRect.height / 2);
        }

        window.addEventListener('resize', updateCenter);
        updateCenter(); 

        let mouseX = -1000, mouseY = -1000;
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
        heroSection.addEventListener('mouseleave', () => { mouseX = -1000; mouseY = -1000; });

        let startTime = null, globalAngle = 0; 

        function animateOrbit(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            globalAngle += orbitConfig.baseSpeed;

            iconData.forEach(item => {
                const elasticDrift = Math.sin(elapsed * item.driftSpeed + item.driftPhase) * orbitConfig.angleDrift;
                const currentAngle = item.baseAngleOffset + globalAngle + elasticDrift;
                const wX = Math.sin(elapsed * orbitConfig.wobbleSpeed + item.wobbleX) * orbitConfig.wobbleRadius;
                const wY = Math.cos(elapsed * (orbitConfig.wobbleSpeed * 1.2) + item.wobbleY) * orbitConfig.wobbleRadius;

                item.baseX = centerX + Math.cos(currentAngle) * orbitConfig.radiusX + wX - (orbitConfig.iconSize / 2);
                item.baseY = centerY + Math.sin(currentAngle) * orbitConfig.radiusY + wY - (orbitConfig.iconSize / 2);

                const dist = Math.sqrt(Math.pow((item.baseX + orbitConfig.iconSize/2) - mouseX, 2) + Math.pow((item.baseY + orbitConfig.iconSize/2) - mouseY, 2));

                if (dist < orbitConfig.repelRadius) {
                    const force = (orbitConfig.repelRadius - dist) / orbitConfig.repelRadius; 
                    const angleToMouse = Math.atan2((item.baseY + orbitConfig.iconSize/2) - mouseY, (item.baseX + orbitConfig.iconSize/2) - mouseX);
                    item.targetPushX = Math.cos(angleToMouse) * (force * orbitConfig.repelForce);
                    item.targetPushY = Math.sin(angleToMouse) * (force * orbitConfig.repelForce);
                    item.targetGlow = force;
                } else {
                    item.targetPushX = 0; item.targetPushY = 0; item.targetGlow = 0;
                }
            });

            for (let i = 0; i < iconData.length; i++) {
                for (let j = i + 1; j < iconData.length; j++) {
                    const dx = (iconData[j].baseX + iconData[j].targetPushX) - (iconData[i].baseX + iconData[i].targetPushX);
                    const dy = (iconData[j].baseY + iconData[j].targetPushY) - (iconData[i].baseY + iconData[i].targetPushY);
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 0 && dist < orbitConfig.collisionRadius) {
                        const push = (orbitConfig.collisionRadius - dist) * orbitConfig.collisionForce;
                        iconData[i].targetPushX -= (dx / dist) * push; iconData[i].targetPushY -= (dy / dist) * push;
                        iconData[j].targetPushX += (dx / dist) * push; iconData[j].targetPushY += (dy / dist) * push;
                    }
                }
            }

            iconData.forEach(item => {
                item.currentPushX += (item.targetPushX - item.currentPushX) * 0.1;
                item.currentPushY += (item.targetPushY - item.currentPushY) * 0.1;
                item.currentGlow += (item.targetGlow - item.currentGlow) * 0.1;

                const currentScale = 1 + (item.currentGlow * 0.35); 
                const currentOpacity = orbitConfig.opacity + (item.currentGlow * (1 - orbitConfig.opacity));
                item.spin += orbitConfig.selfSpinSpeed * item.spinDir;
                
                item.el.style.transform = `translate(${item.baseX + item.currentPushX}px, ${item.baseY + item.currentPushY}px) rotate(${item.spin}deg) scale(${currentScale})`;
                item.el.style.opacity = currentOpacity;
                item.el.style.filter = `drop-shadow(0 0 ${10 + (item.currentGlow * 30)}px rgba(27, 162, 219, ${0.4 + (item.currentGlow * 0.5)}))`;
            });

            requestAnimationFrame(animateOrbit); 
        }
        requestAnimationFrame(animateOrbit); 
    }

    // ==========================================
    // --- ROADMAP INTERACTION LOGIC ---
    const roadmapSteps = document.querySelectorAll('.roadmap-step');
    roadmapSteps.forEach(step => {
        step.addEventListener('click', () => {
            roadmapSteps.forEach(s => s.classList.remove('active'));
            step.classList.add('active');
        });
    });

    // ==========================================
    // --- VIEWPORT REVEAL OBSERVER ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('section h1, section h2, section h3, section p, .roadmap-step-num, .btn-large, .form-intro, .form-group label').forEach(el => {
        el.classList.add('reveal-text');
        observer.observe(el);
    });

    // ==========================================
    // --- FETCH & BUILD DYNAMIC ROLES ---
    fetch('roles.json')
        .then(response => response.json())
        .then(data => {
            buildGallery(data);
            buildApplyForm(data);
            initRoleModals(data); // NEW FUNCTION
        })
        .catch(error => console.error("Error loading roles:", error));

    function buildGallery(data) {
        const track = document.getElementById('roles-gallery-track');
        if (!track) return;

        let cardsHtml = '';
        data.forEach(cat => {
            const tags = cat.items.map(item => `<span class="tag interactive-tag" data-value="${item.value}">${item.label}</span>`).join('');
            cardsHtml += `
                <div class="role-card reveal-text">
                    <div class="role-icon">${cat.icon}</div>
                    <h3>${cat.category}</h3>
                    <div class="role-tags">${tags}</div>
                </div>
            `;
        });

        const group1 = document.createElement('div');
        group1.className = 'gallery-group';
        group1.innerHTML = cardsHtml;

        const group2 = document.createElement('div');
        group2.className = 'gallery-group';
        group2.setAttribute('aria-hidden', 'true');
        group2.innerHTML = cardsHtml;

        track.appendChild(group1);
        track.appendChild(group2);

        // Attach 3D logic and reveal animation to newly created cards
        document.querySelectorAll('.role-card').forEach(card => {
            observer.observe(card);

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const rotateX = (((e.clientY - rect.top) - rect.height/2) / (rect.height/2)) * -8; 
                const rotateY = (((e.clientX - rect.left) - rect.width/2) / (rect.width/2)) * 8;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease, background 0.5s ease';
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
                setTimeout(() => { card.style.transition = 'box-shadow 0.3s ease, background 0.3s ease'; }, 500);
            });
        });
    }

    function buildApplyForm(data) {
        const applyForm = document.getElementById('apply-form');
        if (!applyForm) return;

        const dropdownOptions = document.getElementById('dropdown-options');
        let html = '<label><input type="checkbox" value="General Application"> General Application (Any)</label>';
        let currentGroup = '';

        data.forEach(cat => {
            if (cat.group !== currentGroup) {
                currentGroup = cat.group;
                html += `<div class="dropdown-group">======= BY ${currentGroup.toUpperCase()} =======</div>`;
            }
            html += `<div class="dropdown-group">= = = ${cat.category} = = =</div>`;
            cat.items.forEach(item => {
                html += `<label><input type="checkbox" value="${item.value}"> ${item.label}</label>`;
            });
        });

        dropdownOptions.innerHTML = html;
        initFormLogic();
    }

    function initFormLogic() {
        const applyForm = document.getElementById('apply-form');
        const submitBtn = document.getElementById('submit-btn');
        const statusMsg = document.getElementById('form-status');

        const fullNameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('email');
        const fieldsInput = document.getElementById('fields');
        const cvInput = document.getElementById('cv');
        
        const customDropdown = document.getElementById('custom-dropdown');
        const dropdownDisplay = document.getElementById('dropdown-display');
        const dropdownOptions = document.getElementById('dropdown-options');
        const projectCheckboxes = document.querySelectorAll('#dropdown-options input[type="checkbox"]');
        const projectHiddenInput = document.getElementById('project');

        dropdownDisplay.addEventListener('click', (e) => {
            dropdownOptions.classList.toggle('show');
            customDropdown.classList.toggle('active');
            e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
            if (!customDropdown.contains(e.target)) {
                dropdownOptions.classList.remove('show');
                customDropdown.classList.remove('active');
            }
        });

        function updateDropdownDisplay() {
            const selectedOptions = Array.from(projectCheckboxes)
                                        .filter(cb => cb.checked)
                                        .map(cb => cb.parentElement.textContent.trim());
            
            if (selectedOptions.length === 0) {
                dropdownDisplay.textContent = "Select options...";
                dropdownDisplay.style.color = "var(--text-muted)";
                projectHiddenInput.value = "";
            } else if (selectedOptions.length <= 2) {
                dropdownDisplay.textContent = selectedOptions.join(', ');
                dropdownDisplay.style.color = "white";
                projectHiddenInput.value = selectedOptions.join(', ');
            } else {
                dropdownDisplay.textContent = `${selectedOptions.length} roles selected`;
                dropdownDisplay.style.color = "white";
                projectHiddenInput.value = selectedOptions.join(', ');
            }
            checkForm();
        }

        projectCheckboxes.forEach(cb => cb.addEventListener('change', updateDropdownDisplay));

        function checkForm() {
            const isValid = fullNameInput.value.trim() !== '' && emailInput.value.includes('@') &&
                            fieldsInput.value.trim() !== '' && projectHiddenInput.value.trim() !== '' && cvInput.value.trim() !== '';

            if (isValid) {
                submitBtn.disabled = false;
                statusMsg.textContent = "Ready to send!";
                statusMsg.style.color = "green";
            } else {
                submitBtn.disabled = true;
                statusMsg.textContent = "Please fill in all fields (including selecting a role).";
                statusMsg.style.color = "#888";
            }
        }

        [fullNameInput, emailInput, fieldsInput, cvInput].forEach(input => input.addEventListener('input', checkForm));

        applyForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;
            statusMsg.textContent = "Sending application...";
            statusMsg.style.color = "orange";

            emailjs.send('service_bt1pbab', 'template_5lh71rf', {
                from_name: fullNameInput.value, from_email: emailInput.value,
                major_fields: fieldsInput.value, project_interest: projectHiddenInput.value,
                message: cvInput.value, to_email: 'esta.studios.business@gmail.com'
            }).then(function() {
                statusMsg.textContent = ""; 
                submitBtn.innerText = "Sent";
                applyForm.reset(); 
                projectCheckboxes.forEach(cb => cb.checked = false);
                updateDropdownDisplay();
                const successModal = document.getElementById('success-modal');
                if(successModal) successModal.classList.add('active');
            }, function(error) {
                let humanReadableError = "Failed to send application. Please try again later.";
                if (error.status === 0 || error.text === 'Network Error') humanReadableError = "Network error. Please check your internet connection.";
                else if (error.status === 400 || error.status === 403) humanReadableError = "Service unavailable. Please contact us via social media.";
                else if (error.status === 429) humanReadableError = "Too many requests. Please wait a few minutes and try again.";
                
                statusMsg.textContent = humanReadableError;
                statusMsg.style.color = "#ff6b6b"; 
                submitBtn.innerText = "Send Application";
                submitBtn.disabled = false;
            });
        });
    }
    // ==========================================
    // --- INTERACTIVE ROLE MODALS LOGIC ---
    function initRoleModals(data) {
        const roleModal = document.getElementById('role-modal');
        const closeBtn = document.getElementById('close-role-modal');
        if (!roleModal || !closeBtn) return; // Failsafe if we are on apply.html

        // Flatten the data into a simple dictionary for instant lookup
        const rolesMap = {};
        data.forEach(cat => {
            cat.items.forEach(item => {
                rolesMap[item.value] = { ...item, category: cat.category };
            });
        });

        // Close logic
        closeBtn.addEventListener('click', () => roleModal.classList.remove('active'));
        roleModal.addEventListener('click', (e) => {
            if (e.target === roleModal) roleModal.classList.remove('active');
        });

        // Delegate click events to dynamically generated tags
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('interactive-tag')) {
                const val = e.target.getAttribute('data-value');
                const role = rolesMap[val];
                
                if (role) {
                    // Populate the modal
                    document.getElementById('role-modal-title').textContent = role.label;
                    document.getElementById('role-modal-category').textContent = role.category;
                    document.getElementById('role-modal-desc').innerHTML = role.description;
                    
                    document.getElementById('role-modal-reqs').innerHTML = 
                        role.requirements.map(r => `<li>${r}</li>`).join('');
                        
                    document.getElementById('role-modal-tasks').innerHTML = 
                        role.tasks.map(t => `<li>${t}</li>`).join('');

                    // Show the modal
                    roleModal.classList.add('active');
                }
            }
        });
    }
});