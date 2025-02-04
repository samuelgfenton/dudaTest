const propertySelector = {
    async loadProperties() {
        try {
            const response = await fetch('/api/properties');
            if (!response.ok) {
                throw new Error('Failed to fetch properties');
            }

            const properties = await response.json();
            console.log('Properties loaded:', properties);
            
            const selector = document.getElementById('propertySelector');
            if (!selector) {
                throw new Error('Property selector element not found');
            }

            selector.innerHTML = properties.map(property => `
                <option value="${property.spid}" ${property.current ? 'selected' : ''}>
                    ${property.propertyName}
                </option>
            `).join('');

            selector.addEventListener('change', this.handlePropertyChange.bind(this));
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    },

    async handlePropertyChange(event) {
        try {
            document.getElementById('loadingOverlay').classList.remove('hidden');
            document.getElementById('loadingMessage').textContent = 'Switching property...';

            const newSpid = event.target.value;
            console.log('Switching to property SPID:', newSpid);

            const response = await fetch('/api/properties/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ spid: newSpid })
            });

            if (!response.ok) {
                throw new Error('Failed to switch property');
            }

            const result = await response.json();
            console.log('Property switch result:', result);

            if (result.success) {
                console.log('Property switched successfully, reloading page...');
                window.location.reload();
            } else {
                throw new Error(result.error || 'Failed to switch property');
            }
        } catch (error) {
            console.error('Error switching property:', error);
            document.getElementById('loadingOverlay').classList.add('hidden');
            alert('Failed to switch property. Please try again.');
        }
    }
};