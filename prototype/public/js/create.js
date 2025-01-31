const create = {
    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    },

    async createSite(templateId) {
        try {
            this.showLoading();

            const response = await fetch('/api/create-site', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId: templateId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Wait a moment before reloading to ensure API operations are complete
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error('Site creation failed');
            }

        } catch (error) {
            console.error('Error creating site:', error);
            this.hideLoading();
            alert('Failed to create site. Please try again.');
        }
    }
};