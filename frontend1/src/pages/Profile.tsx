import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Building, Calendar, User,Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRolePhoto } from '@/lib/rolePhotos';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    national_id: '',
    address: '',
    contact: '',
    date_of_birth: '',
    role: '',
    created_at: '',
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/citizens/me', {
          method: 'GET',
          credentials:"include",
          headers: {
            Accept: 'application/json',
          },
        });

        const res = await response.json();

     
        setForm({
          id: res?.data?.id ?? '',
          name: res?.data?.name ?? '',
          email: res?.data?.email ?? '',
          national_id: res?.data?.national_id ?? '',
          address: res?.data?.address ?? '',
          contact: res?.data?.contact ?? '',
          date_of_birth: res?.data?.date_of_birth ?? '',
          role: res?.data?.role ?? '',
          created_at: res?.data?.created_at ?? '',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      }  
      setLoading(false);
      
    };

    fetchProfile();
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading Profile...</span>
      </div>
    );
  }
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {

      const response = await fetch(
        'http://127.0.0.1:8000/api/citizens/me/update',
        {
          method: 'PUT',
          credentials:"include",
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            national_id: form.national_id,
            address: form.address,
            contact: form.contact,
            date_of_birth: form.date_of_birth,
          }),
        }
      );

      const result = await response.json();
      toast.success(result.message || 'Profile updated');
      navigate(-1);
    } catch (error) {
      toast.error('Update failed');
    }finally{
      setLoadingSubmit(false);
    }
  };

  

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={getRolePhoto(role || 'citizen')}
                alt={form.name}
              />
              <AvatarFallback>
                {form.name ? form.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{form.name}</h2>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Full Name</Label>
                <Input name="name" value={form.name} onChange={handleChange} />
              </div>

              <div>
                <Label>Email</Label>
                <Input name="email" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Phone</Label>
                <Input name="contact" value={form.contact} onChange={handleChange} />
              </div>

              <div>
                <Label>Role</Label>
                <Input value={form.role.replace('_', ' ')} disabled />
              </div>
            </div>

            <Separator />

            <div>
              <Label>Address</Label>
              <Input name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveProfile} disabled={loadingSubmit}>
               {loadingSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5" />
            <span>{form.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <span>{form.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            <span>{form.created_at}</span>
          </div>
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5" />
            <span>{form.role}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your password and security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                navigate(-1);
                toast.info('Password change cancelled');
              }}
            >
              Cancel
            </Button>
            <Button type="button">Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
