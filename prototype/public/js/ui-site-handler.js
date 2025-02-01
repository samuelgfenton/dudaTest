const site = {
    data: null,

    async openWebsite() {
        if (this.data && this.data.siteDetails.canonical_url) {
            window.open(this.data.siteDetails.canonical_url, '_blank');
        }
    },

    async openEditor() {
        try {
            // First grant permissions
            const grantResponse = await fetch(`/api/site/grant-access/${this.data.siteName}`, {
                method: 'POST'
            });

            if (!grantResponse.ok) {
                throw new Error('Failed to grant site access');
            }

            // Then get SSO link
            const ssoResponse = await fetch(`/api/site/sso-link/${this.data.siteName}`);
            if (!ssoResponse.ok) {
                throw new Error('Failed to get SSO link');
            }

            const ssoData = await ssoResponse.json();
            window.open(ssoData.url, '_blank');

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to access site editor. Please try again.');
        }
    }
};