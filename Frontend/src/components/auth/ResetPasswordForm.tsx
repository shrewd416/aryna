import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { ResetPasswordRequest } from '@/types';
import AuthUtils from '@/utils/auth';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = Omit<ResetPasswordRequest, 'token' | 'userName'>;

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [token, navigate]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    const passwordValidation = AuthUtils.validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      toast({ title: 'Password Requirements', description: passwordValidation.errors[0], variant: 'destructive' });
      return;
    }
    if (!token) return;

    setIsLoading(true);
    try {
      const resetData: ResetPasswordRequest = {
        ...data,
        token: token,
        userName: '', // Not needed as token identifies user
      };
      const response = await apiService.resetPassword(resetData);
      
      if (response.success) {
        toast({
          title: 'Password Reset Successful',
          description: 'Please sign in with your new password.',
        });
        navigate('/login');
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      toast({ title: 'Reset Failed', description: error instanceof Error ? error.message : 'Invalid or expired token.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    // Render nothing while redirecting
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
          <CardDescription className="text-center">Create a new secure password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Form Fields for newPassword and confirmPassword */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type={showPassword ? 'text' : 'password'} placeholder="Enter new password" className="pl-10 pr-10" disabled={isLoading} />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input {...field} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password" className="pl-10 pr-10" disabled={isLoading} />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-xs text-muted-foreground">
                Password must contain at least 8 characters with uppercase, lowercase, number, and special character.
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}