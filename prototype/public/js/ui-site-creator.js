const create = {
    showLoading(message) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingOverlay && loadingMessage) {
            loadingOverlay.classList.remove('hidden');
            loadingMessage.textContent = message;
        }
    },

    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    },

    async createSite(templateId) {
        try {
            this.showLoading('Creating your website...');

            const response = await fetch('/api/create-site', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ templateId })
            });

            const data = await response.json();
            console.log('Create site response:', data);
            
            if (!response.ok) {
                throw new Error(data.error || `Failed to create site (${response.status})`);
            }

            if (data.success) {
                // Show success state before reload
                this.showLoading('Website created successfully! Redirecting...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error(data.error || 'Failed to create site');
            }

        } catch (error) {
            console.error('Error creating site:', error);
            this.hideLoading();
            alert(error.message || 'Failed to create site. Please try again.');
        }
    }
};