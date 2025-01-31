function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('currentTemplate').classList.add('hidden');
    document.getElementById('availableTemplates').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
}

function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('currentTemplate').classList.add('hidden');
    document.getElementById('availableTemplates').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    if (message) {
        document.getElementById('errorMessage').textContent = message;
    }
}

function previewTemplate(url) {
    window.open(url, '_blank');
}

function createTemplateCard(template, isCurrentTemplate = false) {
    const card = document.createElement('div');
    card.className = 'border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white';
    
    const buttons = isCurrentTemplate ? `
        <button 
            onclick="previewTemplate('${template.preview_url}')"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
            Preview
        </button>
    ` : `
        <button 
            onclick="previewTemplate('${template.preview_url}')"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
            Preview
        </button>
        <button 
            onclick="${isCurrentTemplate ? '' : `switchTemplate('${template.template_id}')`}"
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
            ${isCurrentTemplate ? 'Current' : 'Switch'}
        </button>
    `;

    card.innerHTML = `
        <div class="aspect-w-16 aspect-h-9 bg-gray-100">
            <img
                src="${template.thumbnail_url || 'https://via.placeholder.com/400x225'}"
                alt="${template.template_name}"
                class="w-full h-48 object-cover"
                onerror="this.src='https://via.placeholder.com/400x225'"
            />
        </div>
        <div class="p-4">
            <h3 class="text-lg font-semibold truncate mb-4">${template.template_name}</h3>
            <div class="flex space-x-2">
                ${buttons}
            </div>
        </div>
    `;
    
    return card;
}