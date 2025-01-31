const site = {
    data: null,

    async checkSite() {
        try {
            const response = await fetch('/api/site');
            const data = await response.json();

            if (data.hasSite) {
                this.data = data;
                document.getElementById('siteStatus').classList.remove('hidden');
                document.getElementById('siteName').textContent = data.siteDetails.site_business_info.business_name;
                document.getElementById('siteImage').src = data.siteDetails.thumbnail_url || 'https://via.placeholder.com/400x456';
            } else {
                templates.loadTemplates();
            }
            document.getElementById('loading').classList.add('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to check site status');
        }
    },

    openWebsite() {
        if (this.data && this.data.siteDetails.canonical_url) {
            window.open(this.data.siteDetails.canonical_url, '_blank');
        }
    },

    openEditor() {
        if (this.data && this.data.siteDetails.overview_site_url) {
            window.open(this.data.siteDetails.overview_site_url, '_blank');
        }
    }
};