document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');

    function createNewsCard(article) {
        const card = document.createElement('div');
        card.className = 'card news-card';
        card.onclick = () => openModal(article);

        card.innerHTML = `
            <div class="card-content">
                <span class="news-date">${article.date}</span>
                <h3>${article.title}</h3>
                <p>${article.brief}</p>
            </div>
        `;
        return card;
    }

    // Fetching the JSON
    fetch('news.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(article => {
                newsContainer.appendChild(createNewsCard(article));
            });
            // Initialize slider logic after cards are added
            initSlider('news-container', 'news-prev', 'news-next');
        })
        .catch(error => {
            console.error('Error loading news:', error);
            newsContainer.innerHTML = '<p>Failed to load news data.</p>';
        });

    initSlider('projects-container', 'proj-prev', 'proj-next');

    function initSlider(containerId, prevBtnId, nextBtnId) {
        const container = document.getElementById(containerId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (!container || !prevBtn || !nextBtn) return;

        const scrollAmount = 320;

        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        // TODO: Check scroll position to disable buttons (Simple implementation)
        // For the single project card, this will effectively leave them disabled if configured in HTML
        const updateButtons = () => {
            // Logic to disable buttons if at start/end could go here
            // For now, HTML disabled attributes handle the single project case
        };
        container.addEventListener('scroll', updateButtons);
    }


    const modal = document.getElementById('news-modal');
    const closeBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalBody = document.getElementById('modal-body');

    function openModal(article) {
        modalTitle.textContent = article.title;
        modalDate.textContent = article.date;
        modalBody.innerHTML = `<p>${article.content}</p>`;
        modal.style.display = "block";
    }

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

const applyForm = document.getElementById('apply-form');

if (applyForm) {
    const submitBtn = document.getElementById('submit-btn');
    const statusMsg = document.getElementById('form-status');

    // Input references
    const fullNameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const fieldsInput = document.getElementById('fields');
    const cvInput = document.getElementById('cv');
    const projectSelect = document.getElementById('project');

    // 1. Validation Logic
    function checkForm() {
        const isValid = 
            fullNameInput.value.trim() !== '' &&
            emailInput.value.includes('@') &&
            fieldsInput.value.trim() !== '' &&
            cvInput.value.trim() !== '';

        if (isValid) {
            submitBtn.disabled = false;
            statusMsg.textContent = "Ready to send!";
            statusMsg.style.color = "green";
        } else {
            submitBtn.disabled = true;
            statusMsg.textContent = "Please fill in all fields to proceed.";
            statusMsg.style.color = "#888";
        }
    }

    // Attach listeners
    [fullNameInput, emailInput, fieldsInput, cvInput].forEach(input => {
        input.addEventListener('input', checkForm);
    });

    // 2. Sending Logic (The Change)
    applyForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload

        // Change button state to loading
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;
        statusMsg.textContent = "Sending application...";
        statusMsg.style.color = "orange";

        // These keys must match the {{variables}} in your EmailJS template
        const templateParams = {
            from_name: fullNameInput.value,
            from_email: emailInput.value,
            major_fields: fieldsInput.value,
            project_interest: projectSelect.value,
            message: cvInput.value,
            to_email: 'esta.studios.business@gmail.com'
        };

        // Send via EmailJS
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with actual IDs
        emailjs.send('service_bt1pbab', 'template_5lh71rf', templateParams)
            .then(function() {
                // Success
                statusMsg.textContent = "Application sent successfully! We will contact you soon.";
                statusMsg.style.color = "green";
                submitBtn.innerText = "Sent";
                applyForm.reset(); // Clear form
            }, function(error) {
                // Error
                console.error('FAILED...', error);
                statusMsg.textContent = "Failed to send. Please try again later.";
                statusMsg.style.color = "red";
                submitBtn.innerText = "Send Application";
                submitBtn.disabled = false;
            });
    });
}