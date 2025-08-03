import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';
import { toast } from '@/hooks/use-toast';
import EmployeeForm from './EmployeeForm';
import Layout from '@/components/layout/Layout';
import { EmployeeFullRecord } from '@/types';

export default function AddEmployee() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddEmployee = async (data: Partial<EmployeeFullRecord>) => {
    setIsLoading(true);
    try {
      const response = await apiService.addEmployee(data);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Employee added successfully.',
        });
        navigate('/employees');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add employee.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <EmployeeForm onSubmit={handleAddEmployee} isLoading={isLoading} mode="add" />
    </Layout>
  );
}