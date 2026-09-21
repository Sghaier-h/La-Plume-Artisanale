/**
 * HR Module - Ressources Humaines
 * Module pour gérer les employés, contrats, congés, notes de frais
 */

export default {
  name: 'hr',
  version: '1.0.0',
  category: 'Human Resources',
  depends: ['base'],
  summary: 'Ressources Humaines',
  description: 'Module complet de gestion des ressources humaines',
  data: [
    'security/ir.model.access.json',
  ],
  models: [
    'models/Employee.js',
    'models/Department.js',
    'models/Contract.js',
    'models/Leave.js',
    'models/Expense.js',
    'models/Applicant.js',
    'models/RecruitmentStage.js',
    'models/Payslip.js'
  ],
  controllers: [
    'controllers/hr_employee_new.controller.js',
    'controllers/hr_department.controller.js',
    'controllers/hr_leave.controller.js',
    'controllers/hr_expense.controller.js',
    'controllers/hr_recruitment.controller.js',
    'controllers/hr_payslip.controller.js'
  ],
  routes: [
    'routes/hr_employee.routes.js',
    'routes/hr_department.routes.js',
    'routes/hr_leave.routes.js',
    'routes/hr_expense.routes.js',
    'routes/hr_recruitment.routes.js',
    'routes/hr_payslip.routes.js'
  ],
  apiPaths: {
    'routes/hr_recruitment.routes.js': '/api'
  }
};
