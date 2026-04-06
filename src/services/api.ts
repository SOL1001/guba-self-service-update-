import axios from 'axios';

export interface LoginRequest {
  usr: string;
  pwd: string;
}

export interface LoginResponse {
  message: string;
  home_page: string;
  full_name: string;
  user: string;
  key_details: {
    api_secret: string;
    api_key: string;
  };
  employee_id: string;
  gender: string;
  data: any[];
}

export interface Task {
  name: string;
  subject: string;
  project: string;
  priority: string;
  status: string;
  description: string | null;
  exp_end_date: string | null;
  assigned_to: Array<{
    name: string;
    full_name: string;
    user: string;
    user_image: string | null;
  }>;
  assigned_by: {
    name: string;
    full_name: string;
    user: string;
    user_image: string | null;
  };
  progress: number;
  issue: string | null;
  project_name: string | null;
  comments: any[];
  num_comments: number;
}

export interface TaskListResponse {
  message: string;
  data: Task[];
}

export interface CreateTaskRequest {
  project: string;
  subject: string;
  status: string;
  priority: string;
  description: string;
  assign_to: string[];
  exp_end_date: string;
}

export interface CreateTaskResponse {
  message: string;
  data: any[];
}

export interface Project {
  name: string;
  project_name: string;
}

export interface ProjectListResponse {
  message: string;
  data: Project[];
}

export interface UserProfile {
  full_name: string;
  user: string;
  employee_id: string;
  gender: string;
  api_key: string;
  api_secret: string;
  employee_image?: string | null;
}

export interface CreateEmployeeLogRequest {
  log_type: 'IN' | 'OUT';
  location: string; // JSON string with latitude and longitude
}

export interface CreateEmployeeLogResponse {
  message: string;
  data: any[];
  _server_messages?: string;
}

export interface Expense {
  name: string;
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  docstatus?: number;
  idx?: number;
  naming_series?: string;
  employee: string;
  employee_name: string;
  department?: string | null;
  company: string;
  expense_approver: string;
  approval_status: string;
  total_sanctioned_amount?: number;
  total_taxes_and_charges?: number;
  total_advance_amount?: number;
  grand_total?: number;
  total_claimed_amount: string;
  total_amount_reimbursed?: number;
  posting_date: string;
  is_paid?: number;
  mode_of_payment?: string | null;
  payable_account?: string;
  clearance_date?: string | null;
  remark?: string | null;
  project?: string | null;
  cost_center?: string;
  status: string;
  task?: string | null;
  amended_from?: string | null;
  delivery_trip?: string | null;
  vehicle_log?: string | null;
  _user_tags?: string | null;
  _comments?: string | null;
  _assign?: string | null;
  _liked_by?: string | null;
  expense_type: string;
  expense_description?: string | null;
  expense_date?: string;
  total_expenses?: number;
  attachments?: any[];
}

export interface ExpenseListResponse {
  message: string;
  data: {
    [key: string]: Expense[];
  };
}

export interface ExpenseDetailItem {
  amount: number;
  cost_center: string;
  creation: string;
  default_account: string;
  description: string | null;
  docstatus: number;
  doctype: string;
  expense_date: string;
  expense_type: string;
  idx: number;
  modified: string;
  modified_by: string;
  name: string;
  owner: string;
  parent: string;
  parentfield: string;
  parenttype: string;
  project: string | null;
  sanctioned_amount: number;
  amount_in_currency: string;
  section_amount_in_currency: string;
}

export interface ExpenseDetail {
  name: string;
  employee: string;
  employee_name: string;
  approval_status: string;
  status: string;
  company: string;
  department: string;
  expense_approver: string;
  posting_date: string;
  total_claimed_amount: string;
  total_sanctioned_amount: number;
  total_sanctioned_amount_in_currency: string;
  grand_total: number;
  total_advance_amount: number;
  total_amount_reimbursed: number;
  total_taxes_and_charges: number;
  cost_center: string;
  project: string | null;
  task: string | null;
  mode_of_payment: string | null;
  clearance_date: string | null;
  remark: string | null;
  creation: string;
  modified: string;
  expenses: ExpenseDetailItem[];
  advances: any[];
  taxes: any[];
  attachments: any[];
}

export interface ExpenseDetailResponse {
  message: string;
  data: ExpenseDetail;
}

export interface AttendanceDetails {
  days_in_month: number;
  present: number;
  absent: number;
  late: number;
}

export interface AttendanceRecord {
  attendance_date: string;
  working_hours: number;
  in_time: string | null;
  out_time: string | null;
  employee_checkin_detail: any[];
}

export interface AttendanceListResponse {
  message: string;
  data: {
    attendance_details: AttendanceDetails;
    attendance_list: AttendanceRecord[];
  };
}

export interface SalaryDetail {
  name: string;
  salary_component: string;
  abbr: string;
  amount: number;
  year_to_date: number;
  [key: string]: any;
}

export interface SalarySlipDetails {
  name: string;
  employee: string;
  employee_name: string;
  company: string;
  posting_date: string;
  status: string;
  currency: string;
  start_date: string;
  end_date: string;
  gross_pay: number;
  total_deduction: number;
  net_pay: number;
  rounded_total: number;
  total_in_words: string;
  bank_name: string;
  bank_account_no: string;
  earnings: SalaryDetail[];
  deductions: SalaryDetail[];
  [key: string]: any;
}

export interface SalarySlip {
  month_year: string;
  salary_slip_id: string;
  details: SalarySlipDetails;
}

export interface SalarySlipListResponse {
  message: string;
  data: SalarySlip[];
}

export interface Notification {
  title: string;
  message: string;
  creation: string;
  user_image: string;
}

export interface NotificationListResponse {
  message: string;
  data: Notification[];
}

export interface EmployeeProfile {
  employee_name: string;
  designation: string;
  name: string;
  date_of_joining: string;
  date_of_birth: string;
  gender: string;
  company_email: string | null;
  personal_email: string | null;
  cell_number: string | null;
  emergency_phone_number: string | null;
  employee_image: string;
}

export interface ProfileResponse {
  message: string;
  data: EmployeeProfile;
}

export interface PersonalDetails {
  date_of_birth: string;
  personal_email: string | null;
  gender: string;
  cell_number: string | null;
  current_address: string | null;
  person_to_be_contacted: string | null;
  emergency_phone_number: string | null;
}

export interface EducationDetail {
  [key: string]: any;
}

export interface EducationDetails {
  education: EducationDetail[];
}

export interface BankDetails {
  bank_name: string;
  bank_ac_no: string;
  iban: string;
}

export interface ProfileDetailTabs {
  personal_details: PersonalDetails;
  education_details: EducationDetails;
  bank_details: BankDetails;
}

export interface ProfileDetailTabsResponse {
  message: string;
  data: ProfileDetailTabs;
}

export interface Order {
  name: string;
  customer: string;
  customer_name: string;
  transaction_date: string;
  grand_total: string;
  status: string;
  total_qty: number;
}

export interface OrderListResponse {
  message: string;
  data: Order[];
}

export interface Visit {
  name: string;
  customer_name: string;
  date: string;
  time: string;
  visit_type: string;
  description: string;
}

export interface VisitListResponse {
  message: string;
  data: Visit[];
}

export interface CreateVisitRequest {
  name: string;
  customer: string;
  date: string;
  time: string;
  visit_type: string;
  description: string;
  location: string;
}

export interface CreateVisitResponse {
  message: string;
  data: any[];
}

export interface VisitType {
  name: string;
}

export interface VisitTypeListResponse {
  message: string;
  data: VisitType[];
}

export interface Issue {
  name: string;
  subject: string;
  status: string;
  priority: string;
  raised_by: string;
  contact: string;
  opening_date: string;
  opening_time: string;
  description: string | null;
  resolution_details: string | null;
  company: string;
  agreement_status: string;
  creation: string;
  modified: string;
}

export interface IssueListResponse {
  message: string;
  data: Issue[];
}

export interface Holiday {
  year: string;
  date: string;
  day: string;
  description: string;
}

export interface HolidayListResponse {
  message: string;
  data: Holiday[];
}

export interface OrderItem {
  amount: string;
  discount_amount: number;
  discount_percentage: number;
  image: string;
  item_code: string;
  item_name: string;
  price_list_rate: number;
  qty: number;
  rate: number;
  uom: string;
  rate_currency: string;
  price_list_rate_currency: string;
}

export interface OrderDetails {
  total_taxes_and_charges: string;
  net_total: string;
  discount_amount: string;
  grand_total: string;
  total: string;
  name: string;
  customer: string;
  transaction_date: string;
  delivery_date: string;
  workflow_state: string;
  total_qty: number;
  customer_name: string;
  shipping_address: string | null;
  contact_email: string | null;
  contact_mobile: string | null;
  contact_phone: string | null;
  cost_center: string | null;
  company: string;
  set_warehouse: string | null;
  items: OrderItem[];
  next_action: any[];
  allow_edit: boolean;
  created_by: string;
  annual_billing: string;
  total_unpaid: string;
  discount: number;
  attachments: any[];
}

export interface OrderDetailsResponse {
  message: string;
  data: OrderDetails;
}

export interface ManagerDashboardStats {
  total_employees: number;
  clock_in: number;
  clock_out: number;
  on_leave: number;
  not_clock_in: number;
  approval: number;
  tasks: number;
}

export interface ManagerDashboardResponse {
  message: string;
  data: ManagerDashboardStats;
}

export interface TeamExpenseClaim {
  employee: string;
  field_registry: string | null;
  approval_status: string;
  status: string;
  idx: number;
  remark: string | null;
  total_claimed_amount: string;
  payable_account: string;
  total_amount_reimbursed: number;
  employee_name: string;
  mode_of_payment: string | null;
  total_sanctioned_amount: number;
  docstatus: number;
  creation: string;
  modified: string;
  total_taxes_and_charges: number;
  is_paid: number;
  expense_approver: string;
  vehicle_log: string | null;
  cost_center: string;
  task: string | null;
  department: string;
  naming_series: string;
  amended_from: string | null;
  total_advance_amount: number;
  delivery_trip: string | null;
  name: string;
  grand_total: number;
  clearance_date: string | null;
  posting_date: string;
  company: string;
  project: string | null;
  modified_by: string;
  owner: string;
  expense_type: string;
  expense_description: string | null;
  expense_date: string;
  attachments: any[];
  user_image: string;
  workflow: boolean;
  action: string[];
}

export interface TeamExpenseClaimResponse {
  message: string;
  data: TeamExpenseClaim[];
}

export interface Lead {
  name: string;
  naming_series?: string;
  salutation?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  lead_name?: string;
  job_title?: string;
  gender?: string;
  source?: string;
  lead_owner?: string;
  status?: string;
  customer?: string;
  type?: string;
  request_type?: string;
  email?: string;
  mobile?: string;
}

export interface LeadListResponse {
  data: Lead[];
}

export interface PropertyUnit {
  name: string;
  house_code: string;
  project: string;
  block: string;
  floor: string;
  unit_type: string;
  number_of_bed_rooms: number;
  number_of_bathrooms: number;
  net_area: number;
  selling_price_after_vat: number;
  booking_status: string | null;
  booked_by: string | null;
  booking_expiry_date: string | null;
}

export interface PropertyUnitResponse {
  message: PropertyUnit[];
}

export interface TeamLeaveApplication {
  name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_leave_days: number;
  description: string | null;
  status: string;
  posting_date: string;
  employee_name: string;
  employee: string;
  department: string;
  user_image: string;
  workflow: boolean;
  action: string[];
}

export interface TeamLeaveApplicationResponse {
  message: string;
  data: TeamLeaveApplication[];
}

export class ApiService {
  private baseUrl: string = '';
  private apiKey: string = '';
  private apiSecret: string = '';

  setBaseUrl(url: string) {
    // Clean and format the base URL
    this.baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
  }

  setCredentials(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Get authorization header for API requests
  private getAuthHeader(): string {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API credentials not set');
    }
    return `${this.apiKey}:${this.apiSecret}`;
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (!this.baseUrl) {
      throw new Error('Base URL not set. Please enter workplace URL first.');
    }

    const url = `${this.baseUrl}/api/method/employee_self_service.mobile.v1.ess.login`;
    console.log('Login URL:', url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      console.log('Login Response Status:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Unknown error occurred');
    }
  }

  // Generic API request method with authentication
  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('Base URL not set');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const authHeader = this.getAuthHeader();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('API request failed: Unknown error occurred');
    }
  }

  async getTaskList(): Promise<TaskListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_task_list');
  }

  async createTask(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.create_task', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTaskProgress(taskId: string, progress: string): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.update_task_progress', {
      method: 'POST',
      body: JSON.stringify({
        task_id: taskId,
        progress: progress,
      }),
    });
  }

  async getProjectList(): Promise<ProjectListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_project_list');
  }

  // Generic GET method
  async get(endpoint: string): Promise<any> {
    return this.makeAuthenticatedRequest(endpoint);
  }

  // Generic POST method
  async post(endpoint: string, data: any): Promise<any> {
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Leave-specific methods
  async getLeaveApplicationList(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_leave_application_list');
  }

  async makeLeaveApplication(leaveData: any): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.make_leave_application', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  async getLeaveTypes(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_leave_type');
  }

  async createEmployeeLog(logData: CreateEmployeeLogRequest): Promise<CreateEmployeeLogResponse> {
    return this.post('/api/method/employee_self_service.mobile.v1.ess.create_employee_log', logData);
  }

  async getExpenseList(): Promise<ExpenseListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_expense_list');
  }

  async getExpenseClaims(): Promise<ExpenseListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.expense.get_expense_claims');
  }

  async getExpenseDetail(expenseId: string): Promise<ExpenseDetailResponse> {
    return this.makeAuthenticatedRequest(`/api/method/employee_self_service.mobile.v1.expense.get_expense?id=${expenseId}`);
  }

  async createExpense(expenseData: {
    expense_date: string;
    expense_type: string;
    description: string;
    amount: string;
    attachments?: string[];
  }): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('Base URL not set');
    }

    const url = `${this.baseUrl}/api/method/employee_self_service.mobile.v1.ess.book_expense`;
    const authHeader = this.getAuthHeader();

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('expense_date', expenseData.expense_date);
    formData.append('expense_type', expenseData.expense_type);
    formData.append('description', expenseData.description || '');
    formData.append('amount', expenseData.amount);

    // Add attachments if any
    if (expenseData.attachments && expenseData.attachments.length > 0) {
      expenseData.attachments.forEach((fileUri, index) => {
        // Extract filename from URI
        const fileName = fileUri.split('/').pop() || `attachment_${index}`;
        // Determine file type from extension
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
        let fileType = 'application/octet-stream'; // Default

        // Map common file extensions to MIME types
        const mimeTypes: { [key: string]: string } = {
          // Documents
          'pdf': 'application/pdf',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'xls': 'application/vnd.ms-excel',
          'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'ppt': 'application/vnd.ms-powerpoint',
          'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'txt': 'text/plain',
          'rtf': 'application/rtf',
          // Images
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'bmp': 'image/bmp',
          'webp': 'image/webp',
          // Archives
          'zip': 'application/zip',
          'rar': 'application/x-rar-compressed',
          '7z': 'application/x-7z-compressed',
        };

        fileType = mimeTypes[fileExtension] || 'application/octet-stream';

        formData.append('attachments', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        } as any);
      });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          // Don't set Content-Type - let React Native set it with boundary for multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('API request failed: Unknown error occurred');
    }
  }

  async getExpenseTypes(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_expense_type');
  }

  async getDocumentList(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.document_list');
  }

  async getDashboard(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_dashboard');
  }

  async getPettyExpenseList(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.accounting.get_petty_expense_list');
  }

  async getPaymentEntryList(payload: { start: number; page_length: number; filters: { status?: string; party?: string } }): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.payment.get_payment_entry_list', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPaymentParties(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.payment.get_party');
  }

  async getPaymentEntry(paymentId: string): Promise<any> {
    return this.makeAuthenticatedRequest(`/api/method/employee_self_service.mobile.v1.payment.get_payment_entry?id=${paymentId}`);
  }

  async getEmployeeList(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_employee_list');
  }

  async getCustomerList(): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_customer_list');
  }

  async changePassword(payload: { data: { current_password: string; new_password: string } }): Promise<any> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.change_password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getAttendanceList(year: number, month: number): Promise<AttendanceListResponse> {
    return this.makeAuthenticatedRequest(`/api/method/employee_self_service.mobile.v1.ess.get_attendance_list?year=${year}&month=${month}`);
  }

  async getSalarySlipList(): Promise<SalarySlipListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_salary_sllip');
  }

  async getNotificationList(): Promise<NotificationListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.notification_list');
  }

  async getProfile(): Promise<ProfileResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_profile');
  }

  async getProfileDetailTabs(): Promise<ProfileDetailTabsResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.ess.get_profile_detail_tabs');
  }

  async addComment(referenceDoctype: string, referenceName: string, content: string): Promise<any> {
    return this.post('/api/method/employee_self_service.mobile.v1.ess.add_comment', {
      reference_doctype: referenceDoctype,
      reference_name: referenceName,
      content: content,
    });
  }

  async getOrderList(): Promise<OrderListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.order.get_order_list');
  }

  async getLeads(): Promise<LeadListResponse> {
    const fields = encodeURIComponent(JSON.stringify(["name", "naming_series", "salutation", "first_name", "middle_name", "last_name", "lead_name", "job_title", "gender", "source", "lead_owner", "status", "customer", "type", "request_type"]));
    return this.makeAuthenticatedRequest(`/api/resource/Lead?fields=${fields}`);
  }

  async createLead(payload: any): Promise<any> {
    return this.makeAuthenticatedRequest('/api/resource/Lead', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getPropertyUnits(): Promise<PropertyUnitResponse> {
    return this.makeAuthenticatedRequest('/api/method/property_managment.api.mobile_api.get_units?limit=100&offset=0');
  }

  async getPropertyUnitDetail(unitId: string): Promise<any> {
    return this.makeAuthenticatedRequest(`/api/method/property_managment.api.mobile_api.get_unit_detail?unit=${encodeURIComponent(unitId)}`);
  }

  async bookPropertyUnit(unitId: string): Promise<any> {
    const url = `/api/method/property_managment.api.mobile_api.book_unit?unit=${encodeURIComponent(unitId)}`;
    return this.makeAuthenticatedRequest(url, { method: 'POST' });
  }

  async cancelPropertyBooking(unitId: string): Promise<any> {
    const url = `/api/method/property_managment.api.mobile_api.book_unit?unit=${encodeURIComponent(unitId)}`;
    return this.makeAuthenticatedRequest(url, { method: 'POST' });
  }

  async getVisitList(): Promise<VisitListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.visit.get_visit_list');
  }

  async createVisit(visitData: CreateVisitRequest): Promise<CreateVisitResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.visit.create_visit', {
      method: 'POST',
      body: JSON.stringify(visitData),
    });
  }

  async getVisitTypes(): Promise<VisitTypeListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.visit.get_visit_type');
  }

  async getIssueList(): Promise<IssueListResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.issue.get_issue_list');
  }

  async getHolidayList(year: number): Promise<HolidayListResponse> {
    return this.makeAuthenticatedRequest(`/api/method/employee_self_service.mobile.v1.ess.get_holiday_list?year=${year}`);
  }

  async getManagerDashboardStats(): Promise<ManagerDashboardResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.manager.dashboard.get_dashboard_stats');
  }

  async getTeamExpenseClaims(): Promise<TeamExpenseClaimResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.manager.expense_claim.my_team_expense_claim');
  }

  async getTeamLeaveApplications(): Promise<TeamLeaveApplicationResponse> {
    return this.makeAuthenticatedRequest('/api/method/employee_self_service.mobile.v1.manager.leave_application.my_team_leave_application');
  }

  async getUpcomingActivity(date?: string): Promise<any> {
    // Use today's date if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.makeAuthenticatedRequest(`/api/method/employee_self_service.mobile.v1.ess.upcoming_activity?date=${targetDate}`);
  }

  async getOrderDetails(orderId: string): Promise<OrderDetailsResponse> {
    if (!this.baseUrl) {
      throw new Error('Base URL not set');
    }

    const url = `${this.baseUrl}/api/method/employee_self_service.mobile.v1.order.get_order?order_id=${encodeURIComponent(orderId)}`;
    const authHeader = this.getAuthHeader();

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': authHeader,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data || {};
        throw new Error(errorData.message || `HTTP error! status: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('Network error: No response received');
      } else {
        throw new Error(`API request failed: ${error.message}`);
      }
    }
  }

  async updateProfilePicture(fileUri: string, fileName: string, fileType: string): Promise<any> {
    if (!this.baseUrl) {
      throw new Error('Base URL not set');
    }

    const url = `${this.baseUrl}/api/method/employee_self_service.mobile.v1.ess.update_profile_picture`;
    const authHeader = this.getAuthHeader();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName || 'profile.jpg',
      type: fileType || 'image/jpeg',
    } as any);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          // Don't set Content-Type - let React Native set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('API request failed: Unknown error occurred');
    }
  }
}

export const apiService = new ApiService();
