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
                    card.className = 'template-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300';
                    card.innerHTML = `
                        <div class="bg-blue-50">
                            <img 
                                src="${template.thumbnail_url || 'https://via.placeholder.com/400x456'}"
                                alt="${template.template_name}"
                                class="w-full h-[456px] object-cover"
                                onerror="this.src='https://via.placeholder.com/400x456'"
                            />
                            <div class="px-4 py-3">
                                <h3 class="text-lg truncate mb-3 heading-font">${template.template_name}</h3>
                                <div class="flex space-x-4">
                                    <button 
                                        onclick="templates.previewTemplate('${template.preview_url}')"
                                        class="flex-1 bg-white hover:bg-gray-50 text-blue-500 border border-blue-500 py-2 px-4 rounded transition-colors duration-200"
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
                    card.className = 'template-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300';
                    card.innerHTML = `
                        <div class="bg-blue-50">
                            <img 
                                src="${template.thumbnail_url || 'https://via.placeholder.com/400x456'}"
                                alt="${template.template_name}"
                                class="w-full h-[456px] object-cover"
                                onerror="this.src='https://via.placeholder.com/400x456'"
                            />
                            <div class="px-4 py-3">
                                <h3 class="text-lg truncate mb-3 heading-font">${template.template_name}</h3>
                                <div class="flex space-x-4">
                                    <button 
                                        onclick="templates.previewTemplate('${template.preview_url}')"
                                        class="flex-1 bg-white hover:bg-gray-50 text-blue-500 border border-blue-500 py-2 px-4 rounded transition-colors duration-200"
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

                const templateSection = document.getElementById('templatesSection');
                templateSection.classList.remove('hidden');
                templateSection.querySelector('h2').textContent = 'Create from one of our templates';
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
            const confirmed = confirm(
                "Warning: Switching templates will permanently remove any customizations you have made to your current website. Are you sure you want to continue?"
            );

            if (!confirmed) {
                return;
            }

            console.log('Switching template:', { siteName, templateId });
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

            const data = await response.json();
            console.log('Switch template response:', data);

            if (!response.ok) {
                throw new Error(data.error || `Failed to switch template (Status: ${response.status})`);
            }

            if (data.success) {
                window.location.reload();
            } else {
                throw new Error(data.error || 'Failed to switch template');
            }
        } catch (error) {
            console.error('Error switching template:', error);
            document.getElementById('loadingOverlay').classList.add('hidden');
            alert(error.message || 'Failed to switch template. Please try again.');
        }
    }
};