const create = {
    loadingMessages: [
        'Creating your website...',
        'Updating website theme...',
        'Configuring website content...',
        'Setting up room information...',
        'Setting up property information...',
        'Configuring languages...',
        'Setup complete! Redirecting...'
    ],

    currentMessageIndex: 0,
    
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

    async updateLoadingMessage() {
        if (this.currentMessageIndex < this.loadingMessages.length) {
            this.showLoading(this.loadingMessages[this.currentMessageIndex]);
            this.currentMessageIndex++;
        }
    },

    async createSite(templateId) {
        try {
            this.currentMessageIndex = 0;
            await this.updateLoadingMessage();

            const response = await fetch('/api/create-site', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ templateId })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Update messages every 500ms
                const messageInterval = setInterval(async () => {
                    await this.updateLoadingMessage();
                    if (this.currentMessageIndex >= this.loadingMessages.length) {
                        clearInterval(messageInterval);
                        // Final delay before reload
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                }, 500);
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