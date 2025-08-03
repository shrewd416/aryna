import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { ForgotPasswordRequest } from '@/types';

const forgotPasswordSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number'),
});

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { userName: '', mobileNumber: '' },
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    try {
      const response = await apiService.forgotPassword(data);
      
      if (response.success && response.data?.token) {
        toast({
          title: 'Success',
          description: 'Redirecting you to the password reset page.',
          variant: 'default',
        });
        // Navigate with the secure token
        navigate(`/reset-password?token=${response.data.token}`);
      } else {
        throw new Error(response.message || 'Failed to send reset link');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'User not found or mobile number mismatch',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your username and mobile to get a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...field} placeholder="Enter your username" className="pl-10" disabled={isLoading}/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...field} placeholder="Registered mobile number" className="pl-10" disabled={isLoading}/>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Get Reset Link'}
              </Button>
              <div className="flex items-center justify-center">
                <Link to="/login" className="flex items-center text-sm text-primary hover:underline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}