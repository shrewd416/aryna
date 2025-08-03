import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '@/services/api';
import { toast } from '@/hooks/use-toast';
import EmployeeForm from './EmployeeForm';
import Layout from '@/components/layout/Layout';
import { EmployeeFullRecord } from '@/types';

export default function EditEmployee() {
  const [isLoading, setIsLoading] = useState(false);
  const [employee, setEmployee] = useState<EmployeeFullRecord | null>(null);
  const navigate = useNavigate();
  const { mastCode } = useParams<{ mastCode: string }>();

  useEffect(() => {
    if (mastCode) {
      setIsLoading(true);
      apiService.getEmployeeById(Number(mastCode))
        .then(response => {
          if (response.success && response.data) {
            setEmployee(response.data);
          } else {
            toast({ title: "Error", description: "Employee not found.", variant: "destructive" });
            navigate('/employees');
          }
        })
        .catch(() => {
            toast({ title: "Error", description: "Failed to fetch employee data.", variant: "destructive" });
            navigate('/employees');
        })
        .finally(() => setIsLoading(false));
    }
  }, [mastCode, navigate]);
  

  const handleUpdateEmployee = async (data: Partial<EmployeeFullRecord>) => {
    if (!mastCode) return;
    setIsLoading(true);
    try {
      const response = await apiService.updateEmployee(Number(mastCode), data);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Employee updated successfully.',
        });
        navigate('/employees');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update employee.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading || !employee) {
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
      <EmployeeForm onSubmit={handleUpdateEmployee} isLoading={isLoading} defaultValues={employee} mode="edit" />
    </Layout>
  );
}