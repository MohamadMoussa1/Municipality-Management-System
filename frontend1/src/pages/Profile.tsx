import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Building, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRolePhoto } from '@/lib/rolePhotos';
import {useNavigate} from 'react-router-dom'
export default function Profile() {
  const navigate=useNavigate();
  const { user } = useAuth();
  const { role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = () => {
    fileInputRef.current?.click();
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success('Profile photo updated successfully');
    }
  };

  const handleSaveProfile= async(e: React.FormEvent) => {
     e.preventDefault();
     const token=localStorage.getItem("token");
     const response = await fetch("http://127.0.0.1:8000/api/citizens/me/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization":`Bearer ${token}`,
          },
         body: JSON.stringify({

          }
        ),
      });

    const result = await response.json();
    console.log(result.message);
    
    navigate(-1);
    toast.success('Profile updated successfully');
  };

  const handleUpdatePassword =async (e: React.FormEvent) => {
     e.preventDefault();
    //  const token=localStorage.getItem("token");
    //  const response = await fetch("http://127.0.0.1:8000/api/citizens/me/update", {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Accept": "application/json",
    //         "Authorization":`Bearer ${token}`,
    //       },
    //      body: JSON.stringify({

    //       }
    //     ),
    //   });

    // const result = await response.json();
    // console.log(result.message);
    
    navigate(-1);
    toast.success('Password updated successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={getRolePhoto(user?.role || 'citizen')} alt={user?.name} />
                  <AvatarFallback className="text-2xl">
                    {/* {user?.name?.split(' ').map(n => n[0]).join('') || 'U'} */}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-semibold">{user?.name}</h2>
                </div>
              
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1-555-0123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  {/* <Input id="role" value={user?.role.replace('_', ' ')} disabled /> */}
                  {role}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main Street" />
              </div>
             
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); navigate(-1); toast.info('Changes cancelled'); }}>Cancel</Button>
                <Button type="button" onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>View your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{user?.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  {/* <p className="font-medium capitalize">{user?.role.replace('_', ' ')}</p> */}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">January 2024</p>
                </div>
              </div>
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
              <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); navigate(-1); toast.info('Password change cancelled'); }}>Cancel</Button>
              <Button type="button" onClick={handleUpdatePassword}>Update Password</Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
