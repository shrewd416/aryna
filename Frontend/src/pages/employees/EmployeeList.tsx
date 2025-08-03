
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Building, Briefcase, Calendar, DollarSign, MapPin, UserCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { EmployeeFullRecord } from '@/types';
import Layout from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeFullRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeFullRecord | null>(null);
  const navigate = useNavigate();

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async (query = '') => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllEmployees(query);
      if (response.success && response.data) setEmployees(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load employees.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmployees(searchTerm);
  };

  const handleDelete = async (mastCode: number) => {
    try {
        await apiService.deleteEmployee(mastCode);
        toast({ title: 'Success', description: 'Employee deleted successfully.' });
        loadEmployees(searchTerm);
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete employee.', variant: 'destructive' });
    }
  };

  const formatAddress = (emp: EmployeeFullRecord) => {
    return [emp.addressLine1, emp.addressLine2, emp.city, emp.state, emp.country].filter(Boolean).join(', ');
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header and Search */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">All Employees</h1>
          <Button onClick={() => navigate('/employees/add')}><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Button type="submit"><Search className="mr-2 h-4 w-4" /> Search</Button>
        </form>

        {/* Employee Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp. ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? ( <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow> ) : 
              employees.length > 0 ? (
                employees.map((employee) => (
                  <TableRow key={employee.mastCode} onClick={() => setSelectedEmployee(employee)} className="cursor-pointer">
                    <TableCell><Badge variant="outline">{employee.empID}</Badge></TableCell>
                    <TableCell className="font-medium">{employee.empName}</TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/employees/edit/${employee.mastCode}`)}}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog onOpenChange={(e) => e.stopPropagation()}>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete the employee record.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(employee.mastCode)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : ( <TableRow><TableCell colSpan={5} className="text-center h-24">No employees found.</TableCell></TableRow> )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Employee Details Modal */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <UserCircle className="mr-3 h-8 w-8 text-primary" />
              {selectedEmployee?.empName}
            </DialogTitle>
            <DialogDescription>
              Employee ID: {selectedEmployee?.empID}
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span>{selectedEmployee.designation}</span>
              </div>
              <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span>{selectedEmployee.department}</span>
              </div>
              <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Joined on {new Date(selectedEmployee.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span>₹{selectedEmployee.salary.toLocaleString('en-IN')}</span>
              </div>
              <div className="grid grid-cols-[24px_1fr] items-start gap-4">
                <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                <span className="leading-relaxed">{formatAddress(selectedEmployee) || "No address provided."}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}