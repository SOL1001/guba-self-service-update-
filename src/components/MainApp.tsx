import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Platform, StatusBar, BackHandler , useColorScheme } from 'react-native';
import { Colors } from '../constants/Theme';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import UpdatesScreen from './UpdatesScreen';
import ApprovalScreen from './ApprovalScreen';
import MyTasksScreen from './MyTasksScreen';
import TaskDetailsScreen from './TaskDetailsScreen';
import MyLeavesScreen from './MyLeavesScreen';
import NewLeaveRequestScreen from './NewLeaveRequestScreen';
import LeaveDetailsScreen from './LeaveDetailsScreen';
import MyExpensesScreen from './MyExpensesScreen';
import ExpenseDetailScreen from './ExpenseDetailScreen';
import NewExpenseScreen from './NewExpenseScreen';
import AttendanceScreen from './AttendanceScreen';
import SalaryScreen from './SalaryScreen';
import NotificationScreen from './NotificationScreen';
import OrdersScreen from './OrdersScreen';
import OrderDetailsScreen from './OrderDetailsScreen';
import ManagerDashboardScreen from './ManagerDashboardScreen';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import VisitScreen from './VisitScreen';
import NewVisitScreen from './NewVisitScreen';
import IssueScreen from './IssueScreen';
import HolidayScreen from './HolidayScreen';
import DocumentScreen from './DocumentScreen';
import DashboardScreen from './DashboardScreen';
import PettyExpenseScreen from './PettyExpenseScreen';
import PaymentScreen from './PaymentScreen';
import PaymentDetailScreen from './PaymentDetailScreen';
import EmployeeListScreen from './EmployeeListScreen';
import CustomerListScreen from './CustomerListScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import PropertyScreen from './PropertyScreen';
import PropertyDetailScreen from './PropertyDetailScreen';
import CRMScreen from './CRMScreen';
import LeadDetailScreen from './LeadDetailScreen';
import BottomNavigation from './BottomNavigation';
import { UserProfile, Task, Order, Expense, Lead } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

interface MainAppProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

export default function MainApp({ userProfile, onLogout }: MainAppProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('main');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [taskDetailsFromHome, setTaskDetailsFromHome] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<{ name: string } | null>(null);
  const [selectedPropertyUnitId, setSelectedPropertyUnitId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const visitRefreshKey = useRef(0);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {

      if (currentScreen === 'main') {
        // If on main screen, exit app
        return false; // Let default behavior happen (exit app)
      } else {
        // If on sub-screen, navigate back
        handleBackNavigation();
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [currentScreen]);

  const handleBackNavigation = () => {
    if (currentScreen === 'tasks') {
      handleBackToMain();
    } else if (currentScreen === 'task-details') {
      if (taskDetailsFromHome) {
        handleBackToMain();
      } else {
        handleBackToTasks();
      }
    } else if (currentScreen === 'leaves') {
      handleBackToMain();
    } else if (currentScreen === 'new-leave') {
      handleBackToLeaves();
    } else if (currentScreen === 'leave-details') {
      handleBackToLeaves();
    } else if (currentScreen === 'expenses') {
      handleBackToMain();
    } else if (currentScreen === 'attendance') {
      handleBackToMain();
    } else if (currentScreen === 'salary') {
      handleBackToMain();
    } else if (currentScreen === 'notifications') {
      handleBackToMain();
    } else if (currentScreen === 'orders') {
      handleBackToMain();
    } else if (currentScreen === 'order-details') {
      handleBackToOrders();
    } else if (currentScreen === 'manager') {
      handleBackToMain();
    } else if (currentScreen === 'personal-details') {
      handleBackToProfile();
    } else if (currentScreen === 'visits') {
      handleBackToMain();
    } else if (currentScreen === 'new-visit') {
      handleBackToVisits();
    } else if (currentScreen === 'new-expense') {
      handleBackToExpenses();
    } else if (currentScreen === 'issues') {
      handleBackToMain();
    } else if (currentScreen === 'documents') {
      handleBackToMain();
    } else if (currentScreen === 'dashboard') {
      handleBackToMain();
    } else if (currentScreen === 'petty-expense') {
      handleBackToMain();
    } else if (currentScreen === 'payment') {
      handleBackToMain();
    } else if (currentScreen === 'payment-details') {
      handleBackToPayments();
    } else if (currentScreen === 'employees') {
      handleBackToMain();
    } else if (currentScreen === 'customers') {
      handleBackToMain();
    } else if (currentScreen === 'crm') {
      handleBackToMain();
    } else if (currentScreen === 'crm-details') {
      handleBackToCRM();
    } else if (currentScreen === 'property') {
      handleBackToMain();
    } else if (currentScreen === 'property-details') {
      setCurrentScreen('property');
    }
  };

  const handleNavigateToTasks = () => {
    setCurrentScreen('tasks');
  };

  const handleNavigateToLeaves = () => {
    setCurrentScreen('leaves');
  };

  const handleNavigateToExpenses = () => {
    setCurrentScreen('expenses');
  };

  const handleExpensePress = (expense: Expense) => {
    setSelectedExpense(expense);
    setCurrentScreen('expense-details');
  };

  const handleBackToExpenses = () => {
    setSelectedExpense(null);
    setCurrentScreen('expenses');
  };

  const handleNavigateToNewExpense = () => {
    setCurrentScreen('new-expense');
  };

  const handleExpenseCreated = () => {
    // Refresh expenses or show success message
    setCurrentScreen('expenses');
  };

  const handleNavigateToAttendance = () => {
    setCurrentScreen('attendance');
  };

  const handleNavigateToSalary = () => {
    setCurrentScreen('salary');
  };

  const handleNavigateToNotifications = () => {
    setCurrentScreen('notifications');
  };

  const handleNavigateToOrders = () => {
    setCurrentScreen('orders');
  };

  const handleNavigateToManager = () => {
    setCurrentScreen('manager');
  };

  const handleNavigateToVisits = () => {
    setCurrentScreen('visits');
  };

  const handleNavigateToIssues = () => {
    setCurrentScreen('issues');
  };

  const handleNavigateToHolidays = () => {
    setCurrentScreen('holidays');
  };

  const handleNavigateToDocuments = () => {
    setCurrentScreen('documents');
  };

  const handleNavigateToPettyExpense = () => {
    setCurrentScreen('petty-expense');
  };

  const handleNavigateToPayment = () => {
    setCurrentScreen('payment');
  };

  const handleNavigateToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleNavigateToEmployees = () => {
    setCurrentScreen('employees');
  };

  const handleNavigateToCustomers = () => {
    setCurrentScreen('customers');
  };

  const handleNavigateToCRM = () => {
    setCurrentScreen('crm');
  };

  const handleLeadPress = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentScreen('crm-details');
  };

  const handleBackToCRM = () => {
    setSelectedLead(null);
    setCurrentScreen('crm');
  };

  const handleNavigateToProperty = () => {
    setCurrentScreen('property');
  };

  const handleUnitPress = (unitId: string) => {
    setSelectedPropertyUnitId(unitId);
    setCurrentScreen('property-details');
  };

  const handlePaymentPress = (payment: { name: string }) => {
    setSelectedPayment(payment);
    setCurrentScreen('payment-details');
  };

  const handleBackToPayments = () => {
    setSelectedPayment(null);
    setCurrentScreen('payment');
  };

  const handleMenuItemPress = (itemId: string) => {
    switch (itemId) {
      case 'expense':
        handleNavigateToNewExpense();
        break;
      case 'leave':
        handleNavigateToNewLeave();
        break;
      case 'order':
        handleNavigateToOrders();
        break;
      case 'visit':
        handleNavigateToNewVisit();
        break;
      case 'task':
        handleNavigateToTasks();
        break;
      case 'payment-entry':
        handleNavigateToPayment();
        break;
      case 'petty-expense':
        handleNavigateToPettyExpense();
        break;
      default:
        console.log('Unknown menu item:', itemId);
    }
  };

  const handleNavigateToNewVisit = () => {
    setCurrentScreen('new-visit');
  };

  const handleBackToVisits = () => {
    setCurrentScreen('visits');
  };

  const handleVisitCreated = () => {
    // Trigger refresh by updating key
    visitRefreshKey.current += 1;
    // Navigate back to visits screen
    setCurrentScreen('visits');
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setCurrentScreen('order-details');
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setCurrentScreen('orders');
  };

  const handleNavigateToNewLeave = () => {
    setCurrentScreen('new-leave');
  };

  const handleBackToLeaves = () => {
    setCurrentScreen('leaves');
  };

  const handleLeaveCreated = () => {
    // Refresh leaves data or show success message
    setCurrentScreen('leaves');
  };

  const handleLeavePress = (leave: any) => {
    setSelectedLeave(leave);
    setCurrentScreen('leave-details');
  };

  const handleBackToLeavesFromDetails = () => {
    setSelectedLeave(null);
    setCurrentScreen('leaves');
  };

  const handleTaskPress = (task: Task, fromHome: boolean = false) => {
    setSelectedTask(task);
    setTaskDetailsFromHome(fromHome);
    setCurrentScreen('task-details');
  };

  const handleBackToTasks = () => {
    setSelectedTask(null);
    setTaskDetailsFromHome(false);
    setCurrentScreen('tasks');
  };

  const handleBackToMain = () => {
    setSelectedTask(null);
    setTaskDetailsFromHome(false);
    setCurrentScreen('main');
    setActiveTab('home');
  };

  const handleNavigateToPersonalDetails = () => {
    setCurrentScreen('personal-details');
  };

  const handleNavigateToChangePassword = () => {
    setCurrentScreen('change-password');
  };

  const handleBackToProfile = () => {
    setCurrentScreen('main');
    setActiveTab('profile');
  };


  const renderMainScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen userProfile={userProfile} onLogout={onLogout} onNavigateToTasks={handleNavigateToTasks} onNavigateToLeaves={handleNavigateToLeaves} onNavigateToExpenses={handleNavigateToExpenses} onNavigateToAttendance={handleNavigateToAttendance} onNavigateToSalary={handleNavigateToSalary} onNavigateToNotifications={handleNavigateToNotifications} onNavigateToOrders={handleNavigateToOrders} onNavigateToManager={handleNavigateToManager} onNavigateToVisits={handleNavigateToVisits} onNavigateToIssues={handleNavigateToIssues} onNavigateToHolidays={handleNavigateToHolidays} onNavigateToDocuments={handleNavigateToDocuments} onNavigateToDashboard={handleNavigateToDashboard} onNavigateToPettyExpense={handleNavigateToPettyExpense} onNavigateToPayment={handleNavigateToPayment} onNavigateToEmployees={handleNavigateToEmployees} onNavigateToCustomers={handleNavigateToCustomers} onNavigateToCRM={handleNavigateToCRM} onNavigateToProperty={handleNavigateToProperty} onTaskPress={(task) => handleTaskPress(task, true)} />;
      case 'profile':
        return <ProfileScreen userProfile={userProfile} onLogout={onLogout} onNavigateToPersonalDetails={handleNavigateToPersonalDetails} onNavigateToChangePassword={handleNavigateToChangePassword} />;
      case 'updates':
        return <UpdatesScreen />;
      case 'approval':
        return <ApprovalScreen />;
      case 'add':
        return (
          <View style={{'flex': 1, 'backgroundColor': theme.card, 'alignItems': 'center', 'justifyContent': 'center'}}>
            <View style={{'backgroundColor': theme.background, 'borderRadius': 16, 'padding': 32, 'marginHorizontal': 16}}>
              <View style={{'width': 64, 'height': 64, 'borderRadius': 9999, 'alignItems': 'center', 'justifyContent': 'center', 'marginBottom': 16}}>
                <Ionicons name="add" size={32} color="#2563EB" />
              </View>
              <Text style={{'fontSize': 20, 'fontWeight': 'bold', 'color': theme.text, 'textAlign': 'center', 'marginBottom': 8}}>
                Add New
              </Text>
              <Text style={{'color': theme.secondary, 'textAlign': 'center'}}>
                Create new request or task
              </Text>
            </View>
          </View>
        );
      default:
        return <HomeScreen userProfile={userProfile} onLogout={onLogout} onNavigateToTasks={handleNavigateToTasks} onNavigateToLeaves={handleNavigateToLeaves} onNavigateToExpenses={handleNavigateToExpenses} onNavigateToAttendance={handleNavigateToAttendance} onNavigateToSalary={handleNavigateToSalary} onNavigateToNotifications={handleNavigateToNotifications} onNavigateToOrders={handleNavigateToOrders} onNavigateToManager={handleNavigateToManager} onNavigateToVisits={handleNavigateToVisits} onNavigateToIssues={handleNavigateToIssues} onNavigateToHolidays={handleNavigateToHolidays} onNavigateToDocuments={handleNavigateToDocuments} onNavigateToDashboard={handleNavigateToDashboard} onNavigateToPettyExpense={handleNavigateToPettyExpense} onNavigateToPayment={handleNavigateToPayment} onNavigateToEmployees={handleNavigateToEmployees} onNavigateToCustomers={handleNavigateToCustomers} onNavigateToCRM={handleNavigateToCRM} onNavigateToProperty={handleNavigateToProperty} onTaskPress={(task) => handleTaskPress(task, true)} />;
    }
  };

  const renderCurrentScreen = () => {
    if (currentScreen === 'tasks') {
      return <MyTasksScreen onBack={handleBackToMain} onTaskPress={(task) => handleTaskPress(task, false)} />;
    }
    if (currentScreen === 'task-details' && selectedTask) {
      return <TaskDetailsScreen task={selectedTask} onBack={taskDetailsFromHome ? handleBackToMain : handleBackToTasks} />;
    }
    if (currentScreen === 'leaves') {
      return <MyLeavesScreen onBack={handleBackToMain} onNavigateToNewLeave={handleNavigateToNewLeave} onLeavePress={handleLeavePress} />;
    }
    if (currentScreen === 'new-leave') {
      return <NewLeaveRequestScreen onBack={handleBackToLeaves} onLeaveCreated={handleLeaveCreated} />;
    }
    if (currentScreen === 'leave-details' && selectedLeave) {
      return <LeaveDetailsScreen leave={selectedLeave} onBack={handleBackToLeavesFromDetails} />;
    }
    if (currentScreen === 'expenses') {
      return <MyExpensesScreen onBack={handleBackToMain} onExpensePress={handleExpensePress} onNavigateToNewExpense={handleNavigateToNewExpense} />;
    }
    if (currentScreen === 'new-expense') {
      return <NewExpenseScreen onBack={handleBackToExpenses} onExpenseCreated={handleExpenseCreated} />;
    }
    if (currentScreen === 'attendance') {
      return <AttendanceScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'salary') {
      return <SalaryScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'notifications') {
      return <NotificationScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'orders') {
      return <OrdersScreen onBack={handleBackToMain} onOrderPress={handleOrderPress} />;
    }
    if (currentScreen === 'order-details' && selectedOrder) {
      return <OrderDetailsScreen order={selectedOrder} onBack={handleBackToOrders} />;
    }
    if (currentScreen === 'manager') {
      return <ManagerDashboardScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'personal-details') {
      return <PersonalDetailsScreen onBack={handleBackToProfile} />;
    }
    if (currentScreen === 'change-password') {
      return <ChangePasswordScreen onBack={handleBackToProfile} />;
    }
    if (currentScreen === 'visits') {
      return <VisitScreen key={visitRefreshKey.current} onBack={handleBackToMain} onNavigateToNewVisit={handleNavigateToNewVisit} />;
    }
    if (currentScreen === 'new-visit') {
      return <NewVisitScreen onBack={handleBackToVisits} onVisitCreated={handleVisitCreated} />;
    }
    if (currentScreen === 'issues') {
      return <IssueScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'holidays') {
      return <HolidayScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'documents') {
      return <DocumentScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'dashboard') {
      return <DashboardScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'petty-expense') {
      return <PettyExpenseScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'payment') {
      return <PaymentScreen onBack={handleBackToMain} onPaymentPress={handlePaymentPress} />;
    }
    if (currentScreen === 'payment-details' && selectedPayment) {
      return <PaymentDetailScreen paymentId={selectedPayment.name} onBack={handleBackToPayments} />;
    }
    if (currentScreen === 'employees') {
      return <EmployeeListScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'customers') {
      return <CustomerListScreen onBack={handleBackToMain} />;
    }
    if (currentScreen === 'crm') {
      return <CRMScreen onBack={handleBackToMain} onLeadPress={handleLeadPress} />;
    }
    if (currentScreen === 'crm-details' && selectedLead) {
      return <LeadDetailScreen lead={selectedLead} onBack={handleBackToCRM} />;
    }
    if (currentScreen === 'property') {
      return <PropertyScreen onBack={handleBackToMain} onUnitPress={handleUnitPress} />;
    }
    if (currentScreen === 'property-details' && selectedPropertyUnitId) {
      return <PropertyDetailScreen unitId={selectedPropertyUnitId} onBack={() => setCurrentScreen('property')} />;
    }
    if (currentScreen === 'expense-details' && selectedExpense) {
      return <ExpenseDetailScreen expenseId={selectedExpense.name} onBack={handleBackToExpenses} />;
    }
    return renderMainScreen();
  };

  return (
    <View style={{'flex': 1}}>
      {/* <StatusBar 
        barStyle="dark-content" 
        backgroundColor="white" 
        translucent={false}
      /> */}
      {renderCurrentScreen()}
      {currentScreen === 'main' && (
        <BottomNavigation activeTab={activeTab} onTabPress={setActiveTab} onMenuItemPress={handleMenuItemPress} />
      )}
    </View>
  );
}
