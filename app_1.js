class InventoryManager {
    constructor() {
        this.items = [];
        this.categories = [];
        this.locations = [];
        this.currentEditingItem = null;
        this.currentUser = null;
        this.activeUsers = new Set();
        this.conflictResolutionData = null;
        
        this.init();
    }

    init() {
        this.setupLoginModal();
        this.loadSampleData();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupNavigation();
        this.setupModals();
        this.populateFilterOptions();
        this.updateDashboard();
        this.renderItems();
        this.renderCategories();
        this.renderLocations();
    }

    setupLoginModal() {
        const joinBtn = document.getElementById('joinSessionBtn');
        const userNameInput = document.getElementById('userName');
        
        if (joinBtn) {
            joinBtn.addEventListener('click', () => this.joinSession());
        }
        
        if (userNameInput) {
            userNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.joinSession();
                }
            });
            // Focus on the input when page loads
            userNameInput.focus();
        }
    }

    joinSession() {
        const userNameInput = document.getElementById('userName');
        const userName = userNameInput.value.trim();
        
        if (!userName) {
            alert('Please enter your name');
            userNameInput.focus();
            return;
        }
        
        this.currentUser = userName;
        document.getElementById('currentUserName').textContent = userName;
        document.getElementById('loginModal').classList.remove('active');
        
        this.activeUsers.add(userName);
        this.updateDashboard();
        this.updatePresenceIndicators();
        this.addActivity(`${userName} joined the session`);
        
        // Start collaboration simulation after login
        setTimeout(() => {
            this.simulateCollaboration();
        }, 2000);
    }

    loadSampleData() {
        // Load sample categories from provided data
        this.categories = [
            {id: "cat-1", name: "Electronics", description: "Computers, TVs, phones, and electronic devices", color: "#3b82f6"},
            {id: "cat-2", name: "Furniture", description: "Tables, chairs, dressers, and home furniture", color: "#8b5cf6"},
            {id: "cat-3", name: "Tools", description: "Hand tools, power tools, and hardware", color: "#f59e0b"},
            {id: "cat-4", name: "Kitchen", description: "Appliances, cookware, and kitchen items", color: "#10b981"},
            {id: "cat-5", name: "Clothing", description: "Shoes, jackets, and valuable clothing items", color: "#ef4444"},
            {id: "cat-6", name: "Books", description: "Books, documents, and reference materials", color: "#6366f1"}
        ];

        // Load sample locations from provided data
        this.locations = [
            {id: "loc-1", name: "Living Room", description: "Main living area"},
            {id: "loc-2", name: "Bedroom", description: "Master bedroom"},
            {id: "loc-3", name: "Kitchen", description: "Kitchen and dining area"},
            {id: "loc-4", name: "Office", description: "Home office and workspace"},
            {id: "loc-5", name: "Garage", description: "Garage and storage area"},
            {id: "loc-6", name: "Basement", description: "Basement storage"},
            {id: "loc-7", name: "Attic", description: "Attic storage area"}
        ];

        // Load sample items from provided data
        this.items = [
            {
                id: "item-1",
                name: "MacBook Pro 16-inch",
                description: "Apple laptop for work and development",
                category: "Electronics",
                location: "Office",
                purchasePrice: 2499.99,
                sellingPrice: 2899.99,
                purchaseDate: "2024-01-15",
                warrantyUntil: "2027-01-15",
                modelNumber: "MK193LL/A",
                serialNumber: "F4KYX1234567",
                barcode: "123456789012",
                tags: ["laptop", "apple", "work"],
                notes: "Primary work machine, includes charger and case",
                image: "",
                imageFileName: "",
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
                lastEditedBy: "Admin"
            },
            {
                id: "item-2", 
                name: "Samsung 55-inch 4K TV",
                description: "Smart TV for living room entertainment",
                category: "Electronics",
                location: "Living Room",
                purchasePrice: 899.99,
                sellingPrice: 1199.99,
                purchaseDate: "2024-02-20",
                warrantyUntil: "2026-02-20",
                modelNumber: "UN55TU8000",
                serialNumber: "TV1234567890",
                barcode: "234567890123",
                tags: ["tv", "samsung", "4k"],
                notes: "Wall mounted with included bracket",
                image: "",
                imageFileName: "",
                createdAt: "2024-02-20T14:30:00Z",
                updatedAt: "2024-02-20T14:30:00Z",
                lastEditedBy: "Admin"
            },
            {
                id: "item-3",
                name: "DeWalt Cordless Drill",
                description: "20V MAX cordless drill driver", 
                category: "Tools",
                location: "Garage",
                purchasePrice: 129.99,
                sellingPrice: 179.99,
                purchaseDate: "2024-03-10",
                warrantyUntil: "2027-03-10",
                modelNumber: "DCD771C2",
                serialNumber: "DRILL789012",
                barcode: "345678901234",
                tags: ["drill", "dewalt", "cordless"],
                notes: "Includes two batteries and charger",
                image: "",
                imageFileName: "",
                createdAt: "2024-03-10T09:15:00Z",
                updatedAt: "2024-03-10T09:15:00Z",
                lastEditedBy: "Admin"
            }
        ];
    }

    setupEventListeners() {
        // Main action buttons
        const addItemBtn = document.getElementById('addItemBtn');
        const addItemBtn2 = document.getElementById('addItemBtn2');
        const scanBarcodeBtn = document.getElementById('scanBarcodeBtn');
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const addLocationBtn = document.getElementById('addLocationBtn');

        if (addItemBtn) addItemBtn.addEventListener('click', () => this.openItemModal());
        if (addItemBtn2) addItemBtn2.addEventListener('click', () => this.openItemModal());
        if (scanBarcodeBtn) scanBarcodeBtn.addEventListener('click', () => this.simulateBarcodeScan());
        if (exportDataBtn) exportDataBtn.addEventListener('click', () => this.exportData());
        if (importDataBtn) importDataBtn.addEventListener('click', () => this.importData());
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => this.addCategory());
        if (addLocationBtn) addLocationBtn.addEventListener('click', () => this.addLocation());

        // Search and filters
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const locationFilter = document.getElementById('locationFilter');

        if (searchInput) searchInput.addEventListener('input', () => this.filterItems());
        if (categoryFilter) categoryFilter.addEventListener('change', () => this.filterItems());
        if (locationFilter) locationFilter.addEventListener('change', () => this.filterItems());

        // Form submission
        const itemForm = document.getElementById('itemForm');
        if (itemForm) {
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveItem();
            });
        }

        // Price calculation
        const purchasePrice = document.getElementById('purchasePrice');
        const sellingPrice = document.getElementById('sellingPrice');

        if (purchasePrice) purchasePrice.addEventListener('input', () => this.calculateProfit());
        if (sellingPrice) sellingPrice.addEventListener('input', () => this.calculateProfit());

        // Image upload
        const itemImage = document.getElementById('itemImage');
        if (itemImage) itemImage.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    setupMobileMenu() {
        const toggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');

        if (toggle && sidebar) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggle.classList.toggle('active');
                sidebar.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                    toggle.classList.remove('active');
                    sidebar.classList.remove('active');
                }
            });
        }
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
                
                // Show corresponding section
                this.showSection(item.dataset.section);
                
                // Close mobile menu
                const toggle = document.getElementById('mobileMenuToggle');
                const sidebar = document.getElementById('sidebar');
                if (toggle && sidebar) {
                    toggle.classList.remove('active');
                    sidebar.classList.remove('active');
                }
            });
        });
    }

    setupModals() {
        // Item modal
        const closeItemModal = document.getElementById('closeItemModal');
        const cancelItemBtn = document.getElementById('cancelItemBtn');

        if (closeItemModal) closeItemModal.addEventListener('click', () => this.closeModal('itemModal'));
        if (cancelItemBtn) cancelItemBtn.addEventListener('click', () => this.closeModal('itemModal'));

        // Confirmation modal
        const closeConfirmModal = document.getElementById('closeConfirmModal');
        const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');

        if (closeConfirmModal) closeConfirmModal.addEventListener('click', () => this.closeModal('confirmModal'));
        if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', () => this.closeModal('confirmModal'));

        // Conflict modal
        const closeConflictModal = document.getElementById('closeConflictModal');
        const keepYourVersion = document.getElementById('keepYourVersion');
        const keepRemoteVersion = document.getElementById('keepRemoteVersion');

        if (closeConflictModal) closeConflictModal.addEventListener('click', () => this.closeModal('conflictModal'));
        if (keepYourVersion) keepYourVersion.addEventListener('click', () => this.resolveConflict('yours'));
        if (keepRemoteVersion) keepRemoteVersion.addEventListener('click', () => this.resolveConflict('remote'));

        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update content based on section
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        }
    }

    openItemModal(item = null) {
        if (!this.currentUser) {
            alert('Please join the session first');
            return;
        }

        this.currentEditingItem = item;
        const modal = document.getElementById('itemModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('itemForm');

        if (!modal || !title || !form) return;

        // Reset form
        form.reset();
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) imagePreview.innerHTML = '';

        // Populate form selects
        this.populateFormSelects();

        if (item) {
            title.textContent = 'Edit Item';
            this.populateItemForm(item);
        } else {
            title.textContent = 'Add New Item';
            const purchasePrice = document.getElementById('purchasePrice');
            const sellingPrice = document.getElementById('sellingPrice');
            if (purchasePrice) purchasePrice.value = '0';
            if (sellingPrice) sellingPrice.value = '0';
        }

        this.calculateProfit();
        modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
        if (modalId === 'conflictModal') {
            this.conflictResolutionData = null;
        }
    }

    populateItemForm(item) {
        if (!item) return;
        
        const fields = [
            { id: 'itemName', value: item.name },
            { id: 'itemDescription', value: item.description },
            { id: 'itemCategory', value: item.category },
            { id: 'itemLocation', value: item.location },
            { id: 'purchasePrice', value: item.purchasePrice },
            { id: 'sellingPrice', value: item.sellingPrice },
            { id: 'purchaseDate', value: item.purchaseDate },
            { id: 'warrantyUntil', value: item.warrantyUntil },
            { id: 'modelNumber', value: item.modelNumber },
            { id: 'serialNumber', value: item.serialNumber },
            { id: 'barcode', value: item.barcode },
            { id: 'itemTags', value: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '' },
            { id: 'itemNotes', value: item.notes }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element && field.value !== undefined && field.value !== null) {
                element.value = field.value;
            }
        });

        // Handle image preview
        if (item.image) {
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview) {
                imagePreview.innerHTML = `<img src="${item.image}" alt="Item preview">`;
            }
        }
    }

    populateFormSelects() {
        const categorySelect = document.getElementById('itemCategory');
        const locationSelect = document.getElementById('itemLocation');

        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>';
            this.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        }

        if (locationSelect) {
            locationSelect.innerHTML = '<option value="">Select Location</option>';
            this.locations.forEach(loc => {
                const option = document.createElement('option');
                option.value = loc.name;
                option.textContent = loc.name;
                locationSelect.appendChild(option);
            });
        }
    }

    populateFilterOptions() {
        const categoryFilter = document.getElementById('categoryFilter');
        const locationFilter = document.getElementById('locationFilter');

        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            this.categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name;
                categoryFilter.appendChild(option);
            });
        }

        if (locationFilter) {
            locationFilter.innerHTML = '<option value="">All Locations</option>';
            this.locations.forEach(loc => {
                const option = document.createElement('option');
                option.value = loc.name;
                option.textContent = loc.name;
                locationFilter.appendChild(option);
            });
        }
    }

    calculateProfit() {
        const purchasePriceEl = document.getElementById('purchasePrice');
        const sellingPriceEl = document.getElementById('sellingPrice');
        const profitAmountEl = document.getElementById('profitAmount');
        const profitMarginEl = document.getElementById('profitMargin');

        if (!purchasePriceEl || !sellingPriceEl || !profitAmountEl || !profitMarginEl) return;

        const purchasePrice = parseFloat(purchasePriceEl.value) || 0;
        const sellingPrice = parseFloat(sellingPriceEl.value) || 0;
        const profit = sellingPrice - purchasePrice;
        const margin = purchasePrice > 0 ? ((profit / purchasePrice) * 100) : 0;

        profitAmountEl.textContent = `$${profit.toFixed(2)}`;
        profitMarginEl.textContent = `(${margin.toFixed(1)}%)`;

        // Update styling
        profitAmountEl.className = 'profit-amount';
        if (profit > 0) {
            profitAmountEl.classList.add('profit-positive');
        } else if (profit < 0) {
            profitAmountEl.classList.add('profit-negative');
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('imagePreview');

        if (!preview) return;

        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image file size must be less than 5MB');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="Item preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    saveItem() {
        if (!this.currentUser) {
            alert('Please join the session first');
            return;
        }

        const nameEl = document.getElementById('itemName');
        const categoryEl = document.getElementById('itemCategory');
        const locationEl = document.getElementById('itemLocation');

        if (!nameEl || !categoryEl || !locationEl) {
            alert('Form elements not found. Please try again.');
            return;
        }

        const formData = {
            name: nameEl.value.trim(),
            description: document.getElementById('itemDescription')?.value.trim() || '',
            category: categoryEl.value,
            location: locationEl.value,
            purchasePrice: parseFloat(document.getElementById('purchasePrice')?.value) || 0,
            sellingPrice: parseFloat(document.getElementById('sellingPrice')?.value) || 0,
            purchaseDate: document.getElementById('purchaseDate')?.value || '',
            warrantyUntil: document.getElementById('warrantyUntil')?.value || '',
            modelNumber: document.getElementById('modelNumber')?.value.trim() || '',
            serialNumber: document.getElementById('serialNumber')?.value.trim() || '',
            barcode: document.getElementById('barcode')?.value.trim() || '',
            tags: document.getElementById('itemTags')?.value.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
            notes: document.getElementById('itemNotes')?.value.trim() || '',
            updatedAt: new Date().toISOString(),
            lastEditedBy: this.currentUser
        };

        // Handle image
        const imagePreview = document.querySelector('#imagePreview img');
        if (imagePreview) {
            formData.image = imagePreview.src;
            formData.imageFileName = 'uploaded_image.jpg';
        } else {
            formData.image = '';
            formData.imageFileName = '';
        }

        // Validate required fields
        if (!formData.name) {
            alert('Please enter an item name.');
            nameEl.focus();
            return;
        }

        if (!formData.category) {
            alert('Please select a category.');
            categoryEl.focus();
            return;
        }

        if (!formData.location) {
            alert('Please select a location.');
            locationEl.focus();
            return;
        }

        if (this.currentEditingItem) {
            // Simulate conflict detection (15% chance)
            if (Math.random() < 0.15) {
                this.showConflictDialog(formData);
                return;
            }

            // Update existing item
            const index = this.items.findIndex(item => item.id === this.currentEditingItem.id);
            if (index !== -1) {
                this.items[index] = { ...this.currentEditingItem, ...formData };
                this.addActivity(`Updated item: ${formData.name}`);
            }
        } else {
            // Add new item
            const newItem = {
                id: `item-${Date.now()}`,
                createdAt: new Date().toISOString(),
                ...formData
            };
            this.items.push(newItem);
            this.addActivity(`Added new item: ${formData.name}`);
        }

        this.closeModal('itemModal');
        this.renderItems();
        this.updateDashboard();
        this.simulateSync();
    }

    deleteItem(itemId) {
        const item = this.items.find(item => item.id === itemId);
        if (!item) return;

        this.showConfirmDialog(
            'Delete Item',
            `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
            () => {
                const index = this.items.findIndex(item => item.id === itemId);
                if (index !== -1) {
                    const itemName = this.items[index].name;
                    this.items.splice(index, 1);
                    this.addActivity(`Deleted item: ${itemName}`);
                    this.renderItems();
                    this.updateDashboard();
                    this.simulateSync();
                }
            }
        );
    }

    viewItem(itemId) {
        const item = this.items.find(item => item.id === itemId);
        if (!item) return;

        const profit = item.sellingPrice - item.purchasePrice;
        const margin = item.purchasePrice > 0 ? ((profit / item.purchasePrice) * 100) : 0;
        
        const details = [
            `Name: ${item.name}`,
            `Category: ${item.category}`,
            `Location: ${item.location}`,
            `Purchase Price: $${item.purchasePrice.toFixed(2)}`,
            `Selling Price: $${item.sellingPrice.toFixed(2)}`,
            `Profit: $${profit.toFixed(2)} (${margin.toFixed(1)}%)`,
            '',
            item.description ? `Description: ${item.description}` : '',
            item.modelNumber ? `Model: ${item.modelNumber}` : '',
            item.serialNumber ? `Serial: ${item.serialNumber}` : '',
            item.purchaseDate ? `Purchased: ${item.purchaseDate}` : '',
            item.warrantyUntil ? `Warranty: ${item.warrantyUntil}` : '',
            item.notes ? `Notes: ${item.notes}` : '',
            `Last edited by: ${item.lastEditedBy || 'Unknown'}`
        ].filter(line => line !== '').join('\n');
        
        alert(`Item Details:\n\n${details}`);
    }

    editItemById(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            this.openItemModal(item);
        }
    }

    renderItems() {
        const grid = document.getElementById('itemsGrid');
        if (!grid) return;
        
        if (this.items.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-text-secondary);">
                    <h3>No items found</h3>
                    <p>Add your first item to get started!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.items.map(item => {
            const profit = item.sellingPrice - item.purchasePrice;
            const margin = item.purchasePrice > 0 ? ((profit / item.purchasePrice) * 100) : 0;
            const profitClass = profit > 0 ? 'positive' : profit < 0 ? 'negative' : '';

            return `
                <div class="item-card">
                    <div class="item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '📦'}
                    </div>
                    <div class="item-content">
                        <div class="item-header">
                            <h3 class="item-title">${item.name}</h3>
                            <span class="item-category" style="background-color: ${this.getCategoryColor(item.category)}">${item.category}</span>
                        </div>
                        ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                        <div class="item-details">
                            <span class="item-location">📍 ${item.location}</span>
                        </div>
                        <div class="item-pricing">
                            <div class="price-item">
                                <div class="price-label">Purchase</div>
                                <div class="price-value">$${item.purchasePrice.toFixed(2)}</div>
                            </div>
                            <div class="price-item">
                                <div class="price-label">Selling</div>
                                <div class="price-value">$${item.sellingPrice.toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="profit-display ${profitClass}">
                            <span class="profit-amount">$${profit.toFixed(2)}</span>
                            <span class="profit-margin">(${margin.toFixed(1)}%)</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn action-btn--view" onclick="inventoryManager.viewItem('${item.id}')">
                            <span class="icon">👁️</span>
                            View
                        </button>
                        <button class="action-btn action-btn--edit" onclick="inventoryManager.editItemById('${item.id}')">
                            <span class="icon">✏️</span>
                            Edit
                        </button>
                        <button class="action-btn action-btn--delete" onclick="inventoryManager.deleteItem('${item.id}')">
                            <span class="icon">🗑️</span>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterItems() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const locationFilter = document.getElementById('locationFilter');

        if (!searchInput || !categoryFilter || !locationFilter) return;

        const searchTerm = searchInput.value.toLowerCase();
        const categoryFilterValue = categoryFilter.value;
        const locationFilterValue = locationFilter.value;

        const filteredItems = this.items.filter(item => {
            const matchesSearch = !searchTerm || 
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.notes && item.notes.toLowerCase().includes(searchTerm)) ||
                (Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
            
            const matchesCategory = !categoryFilterValue || item.category === categoryFilterValue;
            const matchesLocation = !locationFilterValue || item.location === locationFilterValue;

            return matchesSearch && matchesCategory && matchesLocation;
        });

        // Temporarily store original items and update with filtered
        const originalItems = this.items;
        this.items = filteredItems;
        this.renderItems();
        this.items = originalItems;
    }

    getCategoryColor(categoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        return category ? category.color : '#6b7280';
    }

    renderCategories() {
        const list = document.getElementById('categoriesList');
        if (!list) return;
        
        list.innerHTML = this.categories.map(category => `
            <div class="category-item">
                <div class="category-info">
                    <div class="category-color" style="background-color: ${category.color}"></div>
                    <span>${category.name}</span>
                </div>
                <div class="item-actions-inline">
                    <button class="btn-icon btn-icon--edit" onclick="inventoryManager.editCategory('${category.id}')">✏️</button>
                    <button class="btn-icon btn-icon--delete" onclick="inventoryManager.deleteCategory('${category.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    renderLocations() {
        const list = document.getElementById('locationsList');
        if (!list) return;
        
        list.innerHTML = this.locations.map(location => `
            <div class="location-item">
                <div class="location-info">
                    <span>${location.name}</span>
                </div>
                <div class="item-actions-inline">
                    <button class="btn-icon btn-icon--edit" onclick="inventoryManager.editLocation('${location.id}')">✏️</button>
                    <button class="btn-icon btn-icon--delete" onclick="inventoryManager.deleteLocation('${location.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    updateDashboard() {
        const totalItems = this.items.length;
        const totalValue = this.items.reduce((sum, item) => sum + item.purchasePrice, 0);
        const totalProfit = this.items.reduce((sum, item) => sum + (item.sellingPrice - item.purchasePrice), 0);

        const totalItemsEl = document.getElementById('totalItems');
        const totalValueEl = document.getElementById('totalValue');
        const totalProfitEl = document.getElementById('totalProfit');
        const activeUsersEl = document.getElementById('activeUsers');

        if (totalItemsEl) totalItemsEl.textContent = totalItems;
        if (totalValueEl) totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
        
        if (totalProfitEl) {
            totalProfitEl.textContent = `$${totalProfit.toFixed(2)}`;
            totalProfitEl.className = `stat-number ${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}`;
        }
        
        if (activeUsersEl) activeUsersEl.textContent = this.activeUsers.size;
    }

    addActivity(description) {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-description">${description}</span>
            <span class="activity-time">${new Date().toLocaleTimeString()}</span>
        `;
        activityList.insertBefore(activityItem, activityList.firstChild);

        // Limit to 10 activities
        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const modal = document.getElementById('confirmModal');
        const confirmBtn = document.getElementById('confirmActionBtn');

        if (!titleEl || !messageEl || !modal || !confirmBtn) return;

        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.classList.add('active');

        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            this.closeModal('confirmModal');
        });
    }

    showConflictDialog(yourVersion) {
        const remoteVersion = { 
            ...yourVersion, 
            lastEditedBy: this.getRandomUser(),
            sellingPrice: yourVersion.sellingPrice * (0.9 + Math.random() * 0.2)
        };

        const yourVersionEl = document.getElementById('yourVersion');
        const remoteVersionEl = document.getElementById('remoteVersion');

        if (!yourVersionEl || !remoteVersionEl) return;

        yourVersionEl.innerHTML = `
            <strong>${yourVersion.name}</strong><br>
            Modified by: ${yourVersion.lastEditedBy}<br>
            Price: $${yourVersion.sellingPrice.toFixed(2)}
        `;

        remoteVersionEl.innerHTML = `
            <strong>${remoteVersion.name}</strong><br>
            Modified by: ${remoteVersion.lastEditedBy}<br>
            Price: $${remoteVersion.sellingPrice.toFixed(2)}
        `;

        this.conflictResolutionData = { yourVersion, remoteVersion };
        document.getElementById('conflictModal').classList.add('active');
    }

    resolveConflict(choice) {
        if (!this.conflictResolutionData) return;

        const { yourVersion, remoteVersion } = this.conflictResolutionData;
        const chosenVersion = choice === 'yours' ? yourVersion : remoteVersion;

        if (this.currentEditingItem) {
            const index = this.items.findIndex(item => item.id === this.currentEditingItem.id);
            if (index !== -1) {
                this.items[index] = { ...this.currentEditingItem, ...chosenVersion };
            }
        }

        this.addActivity(`Resolved conflict by keeping ${choice === 'yours' ? 'your' : 'remote'} version`);
        this.closeModal('conflictModal');
        this.closeModal('itemModal');
        this.renderItems();
        this.updateDashboard();
    }

    getRandomUser() {
        const users = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eva'];
        return users[Math.floor(Math.random() * users.length)];
    }

    updatePresenceIndicators() {
        const onlineUsersList = document.getElementById('onlineUsersList');
        if (!onlineUsersList) return;

        const otherUsers = Array.from(this.activeUsers).filter(user => user !== this.currentUser);
        
        onlineUsersList.innerHTML = otherUsers.map(user => `
            <div class="user-presence online">
                <span class="status-dot"></span>
                ${user}
            </div>
        `).join('');
    }

    simulateCollaboration() {
        if (!this.currentUser) return;

        setInterval(() => {
            if (Math.random() < 0.3) {
                const possibleUsers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eva'];
                const availableUsers = possibleUsers.filter(user => !this.activeUsers.has(user) && user !== this.currentUser);
                
                if (availableUsers.length > 0 && this.activeUsers.size < 4) {
                    const newUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
                    this.activeUsers.add(newUser);
                    this.addActivity(`${newUser} joined the session`);
                } else if (this.activeUsers.size > 1) {
                    const otherUsers = Array.from(this.activeUsers).filter(user => user !== this.currentUser);
                    if (otherUsers.length > 0) {
                        const leavingUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
                        this.activeUsers.delete(leavingUser);
                        this.addActivity(`${leavingUser} left the session`);
                    }
                }
                this.updateDashboard();
                this.updatePresenceIndicators();
            }
        }, 8000);
    }

    simulateSync() {
        this.addActivity('Changes synchronized with team');
    }

    simulateBarcodeScan() {
        if (!this.currentUser) {
            alert('Please join the session first');
            return;
        }

        const mockBarcodes = [
            { code: '123456789', name: 'Gaming Headset', category: 'Electronics', price: 149.99 },
            { code: '987654321', name: 'Desk Lamp', category: 'Furniture', price: 89.99 },
            { code: '456789123', name: 'Coffee Maker', category: 'Kitchen', price: 199.99 },
            { code: '789123456', name: 'Bluetooth Speaker', category: 'Electronics', price: 79.99 },
            { code: '321654987', name: 'Office Chair', category: 'Furniture', price: 299.99 }
        ];

        const scannedItem = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
        
        alert(`Barcode Scanned!\n\nCode: ${scannedItem.code}\nName: ${scannedItem.name}\nCategory: ${scannedItem.category}\nSuggested Price: $${scannedItem.price}\n\nClick OK to add this item.`);
        
        this.openItemModal();
        setTimeout(() => {
            const nameEl = document.getElementById('itemName');
            const categoryEl = document.getElementById('itemCategory');
            const barcodeEl = document.getElementById('barcode');
            const purchasePriceEl = document.getElementById('purchasePrice');
            const sellingPriceEl = document.getElementById('sellingPrice');
            
            if (nameEl) nameEl.value = scannedItem.name;
            if (categoryEl) categoryEl.value = scannedItem.category;
            if (barcodeEl) barcodeEl.value = scannedItem.code;
            if (purchasePriceEl) purchasePriceEl.value = scannedItem.price;
            if (sellingPriceEl) sellingPriceEl.value = (scannedItem.price * 1.3).toFixed(2);
            this.calculateProfit();
        }, 300);
    }

    exportData() {
        const data = {
            items: this.items,
            categories: this.categories,
            locations: this.locations,
            exportDate: new Date().toISOString(),
            exportedBy: this.currentUser
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.addActivity('Data exported successfully');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (data.items) {
                            this.items = data.items;
                            this.renderItems();
                            this.updateDashboard();
                            this.addActivity(`Imported ${data.items.length} items`);
                        }
                        if (data.categories) {
                            this.categories = data.categories;
                            this.renderCategories();
                            this.populateFilterOptions();
                        }
                        if (data.locations) {
                            this.locations = data.locations;
                            this.renderLocations();
                            this.populateFilterOptions();
                        }
                        
                        alert('Data imported successfully!');
                    } catch (error) {
                        alert('Error importing data. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    addCategory() {
        const name = prompt('Enter category name:');
        if (name && name.trim()) {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280', '#ec4899', '#14b8a6'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const newCategory = {
                id: `cat-${Date.now()}`,
                name: name.trim(),
                description: `${name.trim()} items`,
                color: color
            };
            
            this.categories.push(newCategory);
            this.renderCategories();
            this.populateFilterOptions();
            this.addActivity(`Added category: ${name}`);
        }
    }

    addLocation() {
        const name = prompt('Enter location name:');
        if (name && name.trim()) {
            const newLocation = {
                id: `loc-${Date.now()}`,
                name: name.trim(),
                description: name.trim()
            };
            
            this.locations.push(newLocation);
            this.renderLocations();
            this.populateFilterOptions();
            this.addActivity(`Added location: ${name}`);
        }
    }

    editCategory(id) {
        const category = this.categories.find(cat => cat.id === id);
        if (category) {
            const newName = prompt('Enter new category name:', category.name);
            if (newName && newName.trim()) {
                const oldName = category.name;
                category.name = newName.trim();
                
                // Update items that use this category
                this.items.forEach(item => {
                    if (item.category === oldName) {
                        item.category = newName.trim();
                    }
                });
                
                this.renderCategories();
                this.renderItems();
                this.populateFilterOptions();
                this.addActivity(`Updated category: ${newName}`);
            }
        }
    }

    editLocation(id) {
        const location = this.locations.find(loc => loc.id === id);
        if (location) {
            const newName = prompt('Enter new location name:', location.name);
            if (newName && newName.trim()) {
                const oldName = location.name;
                location.name = newName.trim();
                
                // Update items that use this location
                this.items.forEach(item => {
                    if (item.location === oldName) {
                        item.location = newName.trim();
                    }
                });
                
                this.renderLocations();
                this.renderItems();
                this.populateFilterOptions();
                this.addActivity(`Updated location: ${newName}`);
            }
        }
    }

    deleteCategory(id) {
        const category = this.categories.find(cat => cat.id === id);
        if (!category) return;

        const itemsUsingCategory = this.items.filter(item => item.category === category.name);
        if (itemsUsingCategory.length > 0) {
            alert(`Cannot delete category "${category.name}" because it is used by ${itemsUsingCategory.length} item(s).`);
            return;
        }

        this.showConfirmDialog(
            'Delete Category',
            `Are you sure you want to delete the category "${category.name}"?`,
            () => {
                const index = this.categories.findIndex(cat => cat.id === id);
                if (index !== -1) {
                    const categoryName = this.categories[index].name;
                    this.categories.splice(index, 1);
                    this.renderCategories();
                    this.populateFilterOptions();
                    this.addActivity(`Deleted category: ${categoryName}`);
                }
            }
        );
    }

    deleteLocation(id) {
        const location = this.locations.find(loc => loc.id === id);
        if (!location) return;

        const itemsUsingLocation = this.items.filter(item => item.location === location.name);
        if (itemsUsingLocation.length > 0) {
            alert(`Cannot delete location "${location.name}" because it is used by ${itemsUsingLocation.length} item(s).`);
            return;
        }

        this.showConfirmDialog(
            'Delete Location',
            `Are you sure you want to delete the location "${location.name}"?`,
            () => {
                const index = this.locations.findIndex(loc => loc.id === id);
                if (index !== -1) {
                    const locationName = this.locations[index].name;
                    this.locations.splice(index, 1);
                    this.renderLocations();
                    this.populateFilterOptions();
                    this.addActivity(`Deleted location: ${locationName}`);
                }
            }
        );
    }
}

// Initialize the application
let inventoryManager;
document.addEventListener('DOMContentLoaded', () => {
    inventoryManager = new InventoryManager();
});