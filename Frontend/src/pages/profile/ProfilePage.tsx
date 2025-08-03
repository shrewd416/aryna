import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import AuthUtils from '@/utils/auth';

// Schema for updating username
const usernameSchema = z.object({
  userName: z.string().min(3, 'Username must be at least 3 characters'),
});

// Schema for changing password
const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const usernameForm = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { userName: user?.userName || '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onUsernameSubmit = async (data: z.infer<typeof usernameSchema>) => {
    setIsUsernameLoading(true);
    try {
      const response = await apiService.updateUsername(data.userName);
      if (response.success && response.data) {
        updateUser(response.data);
        toast({ title: 'Success', description: 'Username updated successfully!' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update username.', variant: 'destructive' });
    } finally {
      setIsUsernameLoading(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    const passwordValidation = AuthUtils.validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      toast({ title: 'Password Requirements', description: passwordValidation.errors[0], variant: 'destructive' });
      return;
    }
    
    setIsPasswordLoading(true);
    try {
      const response = await apiService.changePassword(data);
      if (response.success) {
        toast({ title: 'Success', description: 'Password changed successfully. Please log in again.' });
        logout(); // Force re-login for security
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to change password.', variant: 'destructive' });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Update Username Card */}
          <Card>
            <CardHeader>
              <CardTitle>Update Username</CardTitle>
              <CardDescription>Change the username associated with your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...usernameForm}>
                <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-4">
                  <FormField
                    control={usernameForm.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Username</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUsernameLoading}>
                    {isUsernameLoading ? 'Saving...' : 'Save Username'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password for better security.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField control={passwordForm.control} name="oldPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Old Password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPasswordLoading}>
                    {isPasswordLoading ? 'Saving...' : 'Change Password'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}