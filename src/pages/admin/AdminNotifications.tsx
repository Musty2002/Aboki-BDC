import { useEffect, useState } from 'react';
import { Send, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { format } from 'date-fns';

interface City {
  id: string;
  name: string;
}

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  target_type: string;
  target_city_id: string | null;
  sent_count: number;
  success_count: number;
  failure_count: number;
  sent_at: string;
  city?: { name: string };
}

export default function AdminNotifications() {
  const [cities, setCities] = useState<City[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    targetType: 'all',
    targetCityId: '',
  });
  const { toast } = useToast();
  const { user } = useAdminAuth();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [citiesRes, logsRes] = await Promise.all([
        supabase.from('cities').select('id, name').eq('is_active', true).order('name'),
        supabase
          .from('notification_logs')
          .select('*, city:cities(name)')
          .order('sent_at', { ascending: false })
          .limit(20),
      ]);

      if (citiesRes.data) setCities(citiesRes.data);
      if (logsRes.data) setLogs(logsRes.data as unknown as NotificationLog[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim() || !formData.body.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both title and body',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      // Get all push subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth');

      if (subError) throw subError;

      if (!subscriptions || subscriptions.length === 0) {
        toast({
          title: 'No subscribers',
          description: 'There are no push notification subscribers yet.',
          variant: 'destructive',
        });
        setIsSending(false);
        return;
      }

      // Send notifications via edge function
      let successCount = 0;
      let failureCount = 0;

      for (const sub of subscriptions) {
        try {
          const { error } = await supabase.functions.invoke('send-push-notification', {
            body: {
              token: sub.endpoint,
              title: formData.title,
              body: formData.body,
            },
          });

          if (error) {
            failureCount++;
          } else {
            successCount++;
          }
        } catch {
          failureCount++;
        }
      }

      // Log the notification
      const { data: logData, error: logError } = await supabase
        .from('notification_logs')
        .insert({
          title: formData.title,
          body: formData.body,
          target_type: formData.targetType,
          target_city_id: formData.targetType === 'city' ? formData.targetCityId : null,
          sent_count: subscriptions.length,
          success_count: successCount,
          failure_count: failureCount,
          sent_by: user?.id,
        })
        .select('*, city:cities(name)')
        .single();

      if (!logError && logData) {
        setLogs(prev => [logData as unknown as NotificationLog, ...prev]);
      }

      toast({
        title: 'Notification sent',
        description: `Sent to ${successCount} of ${subscriptions.length} subscribers`,
      });

      setFormData({
        title: '',
        body: '',
        targetType: 'all',
        targetCityId: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Push Notifications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Send broadcast notifications to app subscribers
        </p>
      </div>

      {/* Compose form */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold text-card-foreground mb-4">Compose Notification</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Rate Update Alert"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="e.g., USD rate has changed. Check the app for latest rates!"
              maxLength={200}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select
              value={formData.targetType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, targetType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscribers</SelectItem>
                <SelectItem value="city">Specific City</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.targetType === 'city' && (
            <div className="space-y-2">
              <Label>Select City</Label>
              <Select
                value={formData.targetCityId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, targetCityId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview */}
          {(formData.title || formData.body) && (
            <div className="bg-slate-100 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-2">Preview</p>
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <p className="font-semibold text-sm">{formData.title || 'Notification title'}</p>
                <p className="text-sm text-slate-600 mt-1">{formData.body || 'Message body'}</p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </form>
      </div>

      {/* History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Notification History</h2>
        </div>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-card-foreground">No notifications sent yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sent notifications will appear here
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {log.body}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.target_type === 'all' ? 'All' : log.city?.name || 'City'}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.sent_count}</TableCell>
                  <TableCell>
                    <span className="text-green-600">{log.success_count}</span>
                    {log.failure_count > 0 && (
                      <span className="text-destructive"> / {log.failure_count} failed</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(log.sent_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
