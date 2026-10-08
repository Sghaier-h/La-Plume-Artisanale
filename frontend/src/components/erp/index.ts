/**
 * Export des composants ERP La Plume Artisanale
 */

export { default as ERPHeader } from './ERPHeader';
export { default as ERPStatusbar } from './ERPStatusbar';
export { default as ERPNotebook } from './ERPNotebook';
export { default as ERPChatter } from './ERPChatter';
export { default as ERPButtonBox } from './ERPButtonBox';
export { default as KanbanView } from './KanbanView';

// Views
export { default as ViewHeader } from './views/ViewHeader';
export { default as ListView } from './views/ListView';
export { default as FormView } from './views/FormView';
export { default as OperationsPanel } from './views/OperationsPanel';

// Fields
export { default as Many2OneField } from './fields/Many2OneField';
export { default as One2ManyField } from './fields/One2ManyField';
export { default as MonetaryField } from './fields/MonetaryField';

// Forms
export { default as SaleOrderForm } from './forms/SaleOrderForm';

// Modals
export { default as PartialDeliveryModal } from './PartialDeliveryModal';

// System
export { default as NotificationProvider, useNotifications } from './NotificationSystem';
export { default as AdvancedSearch } from './AdvancedSearch';
export { default as Pagination } from './Pagination';
