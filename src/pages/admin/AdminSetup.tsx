import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield, Database, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SetupStep {
  id: string;
  title: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function AdminSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [setupKey, setSetupKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<SetupStep[]>([
    { id: 'admin', title: 'Create Super Admin', status: 'pending' },
    { id: 'branches', title: 'Seed Branch Data', status: 'pending' },
  ]);

  const updateStep = (id: string, updates: Partial<SetupStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const runSetup = async () => {
    if (!setupKey || !adminEmail || !adminPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);

    // Step 1: Create super admin
    updateStep('admin', { status: 'loading' });
    try {
      const { data: adminResult, error: adminError } = await supabase.functions.invoke('setup-admin', {
        body: {
          setupKey,
          email: adminEmail,
          password: adminPassword,
          fullName: adminName || 'Super Admin',
        },
      });

      if (adminError) throw new Error(adminError.message);
      if (adminResult?.error) throw new Error(adminResult.error);

      updateStep('admin', { status: 'success', message: `Created: ${adminEmail}` });
    } catch (error: any) {
      updateStep('admin', { status: 'error', message: error.message });
      // Continue to next step even if admin already exists
    }

    // Step 2: Seed branches
    updateStep('branches', { status: 'loading' });
    try {
      const { data: branchResult, error: branchError } = await supabase.functions.invoke('seed-branches', {
        body: { setupKey },
      });

      if (branchError) throw new Error(branchError.message);
      if (branchResult?.error) throw new Error(branchResult.error);

      updateStep('branches', { 
        status: 'success', 
        message: `${branchResult.branchesCreated} branches, ${branchResult.ratesCreated} rates` 
      });
    } catch (error: any) {
      updateStep('branches', { status: 'error', message: error.message });
    }

    setIsRunning(false);

    // Check if at least admin was created
    const adminStep = steps.find(s => s.id === 'admin');
    if (adminStep?.status === 'success' || steps.every(s => s.status !== 'loading')) {
      toast({
        title: 'Setup Complete',
        description: 'You can now log in to the admin dashboard',
      });
    }
  };

  const allSuccess = steps.every(s => s.status === 'success');
  const hasErrors = steps.some(s => s.status === 'error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Setup</h1>
            <p className="text-sm text-slate-600 mt-1">
              Initialize your admin account and seed data
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="setupKey" className="text-slate-700">Setup Key *</Label>
              <Input
                id="setupKey"
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                placeholder="Enter setup key"
                disabled={isRunning}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500">
                Default: aboki-admin-setup-2024
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="text-slate-700">Admin Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={isRunning}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-slate-700">Admin Password *</Label>
              <Input
                id="adminPassword"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                disabled={isRunning}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName" className="text-slate-700">Admin Name</Label>
              <Input
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Super Admin"
                disabled={isRunning}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map(step => (
              <div 
                key={step.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-100"
              >
                {step.status === 'pending' && (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                )}
                {step.status === 'loading' && (
                  <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                )}
                {step.status === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {step.status === 'error' && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{step.title}</p>
                  {step.message && (
                    <p className={`text-xs ${step.status === 'error' ? 'text-red-600' : 'text-slate-500'}`}>
                      {step.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {allSuccess ? (
            <Button 
              className="w-full" 
              onClick={() => navigate('/admin/login')}
            >
              Go to Login
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={runSetup}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Setup...
                </>
              ) : hasErrors ? (
                'Retry Setup'
              ) : (
                'Run Setup'
              )}
            </Button>
          )}

          {hasErrors && (
            <p className="text-xs text-center text-slate-500 mt-4">
              Some steps failed. You can retry or proceed to login if admin was created.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
