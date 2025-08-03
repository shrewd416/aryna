import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Building, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { EmployeeFullRecord } from '@/types';
import Layout from '@/components/layout/Layout';

export default function Dashboard() {
  const [employees, setEmployees] = useState<EmployeeFullRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await apiService.getAllEmployees();
      if (response.success && response.data) {
        setEmployees(response.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.empID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalEmployees: employees.length,
    departments: [...new Set(employees.map(emp => emp.department))].length,
    newThisMonth: employees.filter(emp => {
      const joinedDate = new Date(emp.joinedDate);
      const currentDate = new Date();
      return joinedDate.getMonth() === currentDate.getMonth() && 
             joinedDate.getFullYear() === currentDate.getFullYear();
    }).length,
    avgSalary: employees.length > 0 ? 
      Math.round(employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length) : 0
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your employee records efficiently
            </p>
          </div>
          <Button onClick={() => navigate('/employees/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.departments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.avgSalary.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Recent Employees */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Records</CardTitle>
            <CardDescription>
              Search and manage employee information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, designation, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
                </div>
              ) : (
                filteredEmployees.slice(0, 10).map((employee) => (
                  <div
                    key={employee.mastCode}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/employees/${employee.mastCode}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        {employee.empName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium">{employee.empName}</h4>
                        <p className="text-sm text-muted-foreground">ID: {employee.empID}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{employee.designation}</Badge>
                      <Badge variant="secondary">{employee.department}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredEmployees.length > 10 && (
              <div className="text-center">
                <Button variant="outline" onClick={() => navigate('/employees')}>
                  View All Employees ({filteredEmployees.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}