const templates = {
    async loadTemplates() {
        try {
            const response = await fetch('/api/templates');
            const templates = await response.json();

            const templatesGrid = document.getElementById('templatesGrid');
            templatesGrid.innerHTML = '';

            templates.forEach(template => {
                const card = this.createTemplateCard(template);
                templatesGrid.appendChild(card);
            });

            document.getElementById('templatesSection').classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load templates');
        }
    },

    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'border rounded-lg overflow-hidden shadow-lg bg-white';
        card.innerHTML = `
            <div style="height: 456px;">
                <img 
                    src="${template.thumbnail_url || 'https://via.placeholder.com/400x456'}"
                    alt="${template.template_name}"
                    class="w-full h-full object-cover"
                    onerror="this.src='https://via.placeholder.com/400x456'"
                />
            </div>
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-4">${template.template_name}</h3>
                <div class="flex space-x-4">
                    <button 
                        onclick="templates.previewTemplate('${template.preview_url}')"
                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                        Preview
                    </button>
                    <button 
                        onclick="create.createSite('${template.template_id}')"
                        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    >
                        Create
                    </button>
                </div>
            </div>
        `;
        return card;
    },

    previewTemplate(url) {
        window.open(url, '_blank');
    }
};