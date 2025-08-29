// Modal Manager - Unified modal handling for all modals
class ModalManager {
    constructor() {
        this.activeModals = new Set();
        this.setupGlobalEventListeners();
    }

    // Setup global event listeners for all modals
    setupGlobalEventListeners() {
        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    // Register a modal
    registerModal(modalElement, options = {}) {
        if (!modalElement) return;

        const modalId = modalElement.id || `modal-${Date.now()}`;
        
        // Setup close button if it exists
        const closeButton = modalElement.querySelector('.eventClose, .close-button, [data-close="modal"]');
        if (closeButton) {
            // Add click handler
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal(modalElement);
            });
            
            // Add touch handler for better mobile support
            closeButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal(modalElement);
            });
            
            // Ensure button is focusable and accessible
            if (!closeButton.hasAttribute('tabindex')) {
                closeButton.setAttribute('tabindex', '0');
            }
            
            // Add keyboard support
            closeButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.closeModal(modalElement);
                }
            });
        }

        // Add to active modals when shown
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isVisible = modalElement.style.display !== 'none' && 
                                    modalElement.style.display !== '';
                    
                    if (isVisible && !this.activeModals.has(modalId)) {
                        this.activeModals.add(modalId);
                        modalElement.dataset.modalId = modalId;
                        
                        // Prevent body scroll
                        if (options.preventBodyScroll !== false) {
                            document.body.style.overflow = 'hidden';
                        }
                    } else if (!isVisible && this.activeModals.has(modalId)) {
                        this.activeModals.delete(modalId);
                        
                        // Restore body scroll if no other modals are open
                        if (this.activeModals.size === 0) {
                            document.body.style.overflow = '';
                        }
                    }
                }
            });
        });

        observer.observe(modalElement, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });

        return modalId;
    }

    // Close a specific modal
    closeModal(modalElement) {
        if (!modalElement) return;

        const modalId = modalElement.dataset.modalId;
        
        // Add closing animation
        modalElement.style.opacity = '0';
        modalElement.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            modalElement.style.display = 'none';
            modalElement.style.opacity = '';
            modalElement.style.transform = '';
            
            if (modalId) {
                this.activeModals.delete(modalId);
            }
            
            // Restore body scroll if no other modals are open
            if (this.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
        }, 200);
    }

    // Close the topmost modal
    closeTopModal() {
        const visibleModals = Array.from(document.querySelectorAll('.modal'))
            .filter(modal => modal.style.display !== 'none' && modal.style.display !== '');
        
        if (visibleModals.length > 0) {
            // Close the modal with highest z-index
            const topModal = visibleModals.reduce((top, current) => {
                const topZ = parseInt(getComputedStyle(top).zIndex) || 0;
                const currentZ = parseInt(getComputedStyle(current).zIndex) || 0;
                return currentZ > topZ ? current : top;
            });
            
            this.closeModal(topModal);
        }
    }

    // Close all modals
    closeAllModals() {
        const visibleModals = Array.from(document.querySelectorAll('.modal'))
            .filter(modal => modal.style.display !== 'none' && modal.style.display !== '');
        
        visibleModals.forEach(modal => this.closeModal(modal));
    }

    // Show modal with animation
    showModal(modalElement, options = {}) {
        if (!modalElement) return;

        modalElement.style.display = 'block';
        modalElement.style.opacity = '0';
        modalElement.style.transform = 'scale(0.95)';
        
        // Force reflow
        modalElement.offsetHeight;
        
        modalElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        modalElement.style.opacity = '1';
        modalElement.style.transform = 'scale(1)';
        
        // Register if not already registered
        if (!modalElement.dataset.modalId) {
            this.registerModal(modalElement, options);
        }
    }
}

// Create global instance
const modalManager = new ModalManager();

// Auto-register existing modals on page load
document.addEventListener('DOMContentLoaded', () => {
    const existingModals = document.querySelectorAll('.modal');
    existingModals.forEach(modal => {
        modalManager.registerModal(modal);
    });
});

// Export for use in other modules
export { modalManager };

// Make available globally for inline handlers
window.modalManager = modalManager;
window.closeModal = () => modalManager.closeTopModal();
window.closeSoldierModal = () => {
    const soldierModal = document.getElementById('soldierModal');
    if (soldierModal) modalManager.closeModal(soldierModal);
};
window.closeSoldierSearchModal = () => {
    const soldierSearchModal = document.getElementById('soldierSearchModal');
    if (soldierSearchModal) modalManager.closeModal(soldierSearchModal);
}; 