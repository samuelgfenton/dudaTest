const templates = {
    async loadTemplates() {
        try {
            // First check if there's an existing site
            const siteResponse = await fetch('/api/site');
            const siteData = await siteResponse.json();
            console.log('Site data received:', siteData);

            // Get all templates
            const templatesResponse = await fetch('/api/templates');
            const templates = await templatesResponse.json();

            if (siteData.hasSite) {
                console.log('Site exists, showing site info and other templates');
                // Show current site
                document.getElementById('siteStatus').classList.remove('hidden');
                
                // Update site information
                if (siteData.siteDetails) {
                    document.getElementById('siteImage').src = siteData.siteDetails.thumbnail_url || 'https://via.placeholder.com/400x456';
                    document.getElementById('siteName').textContent = siteData.siteDetails.site_business_info.business_name;
                }
                
                site.data = siteData;

                // Filter out the current template and show other templates
                const currentTemplateId = siteData.siteDetails.template_id;
                const otherTemplates = templates.filter(template => template.template_id !== currentTemplateId);

                const templatesGrid = document.getElementById('templatesGrid');
                templatesGrid.innerHTML = '';

                otherTemplates.forEach(template => {
                    const card = document.createElement('div');
                    card.className = 'border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white';
                    card.innerHTML = `
                        <div class="w-[400px]">
                            <div style="width: 400px; height: 456px;">
                                <img 
                                    src="${template.thumbnail_url || 'https://via.placeholder.com/400x456'}"
                                    alt="${template.template_name}"
                                    class="w-full h-full object-cover"
                                    onerror="this.src='https://via.placeholder.com/400x456'"
                                />
                            </div>
                            <div class="p-4">
                                <h3 class="text-lg truncate mb-4 heading-font">${template.template_name}</h3>
                                <div class="flex space-x-4">
                                    <button 
                                        onclick="templates.previewTemplate('${template.preview_url}')"
                                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Preview
                                    </button>
                                    <button 
                                        onclick="templates.switchTemplate('${siteData.siteName}', '${template.template_id}')"
                                        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Switch
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    templatesGrid.appendChild(card);
                });

                const templateSection = document.getElementById('templatesSection');
                templateSection.classList.remove('hidden');
                templateSection.querySelector('h2').textContent = 'Try another template...';
                templateSection.classList.add('mt-12');
                
            } else {
                console.log('No site exists, showing all templates');
                // No site exists, show all templates with create button
                const templatesGrid = document.getElementById('templatesGrid');
                templatesGrid.innerHTML = '';
                
                templates.forEach(template => {
                    const card = document.createElement('div');
                    card.className = 'border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white';
                    card.innerHTML = `
                        <div class="w-[400px]">
                            <div style="width: 400px; height: 456px;">
                                <img 
                                    src="${template.thumbnail_url || 'https://via.placeholder.com/400x456'}"
                                    alt="${template.template_name}"
                                    class="w-full h-full object-cover"
                                    onerror="this.src='https://via.placeholder.com/400x456'"
                                />
                            </div>
                            <div class="p-4">
                                <h3 class="text-lg truncate mb-4 heading-font">${template.template_name}</h3>
                                <div class="flex space-x-4">
                                    <button 
                                        onclick="templates.previewTemplate('${template.preview_url}')"
                                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Preview
                                    </button>
                                    <button 
                                        onclick="create.createSite('${template.template_id}')"
                                        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-200"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    templatesGrid.appendChild(card);
                });

                document.getElementById('templatesSection').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to load templates');
        }
    },

    previewTemplate(url) {
        window.open(url, '_blank');
    },

    async switchTemplate(siteName, templateId) {
        try {
            document.getElementById('loadingOverlay').classList.remove('hidden');
            document.getElementById('loadingMessage').textContent = 'Switching template...';

            const response = await fetch('/api/create-site/reset-template', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    siteName,
                    templateId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to switch template');
            }

            const result = await response.json();
            
            if (result.success) {
                window.location.reload();
            } else {
                throw new Error(result.error || 'Failed to switch template');
            }
        } catch (error) {
            console.error('Error switching template:', error);
            document.getElementById('loadingOverlay').classList.add('hidden');
            alert('Failed to switch template. Please try again.');
        }
    }
};