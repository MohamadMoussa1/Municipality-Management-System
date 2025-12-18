import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
export default function Login() {
  const { setUser, setRole } = useAuth();
  const navigate = useNavigate();
  const [Data, setData] = useState({
    name: ""
    , email: ""
    , password: ""
    , password_confirmation: ""
    , national_id: ""
    , address: ""
    , contact: ""
    , date_of_birth: ""
  });
  const [login, setLogin] = useState({
    email: ""
    , password: ""
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const handleChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleChangeSignIn = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try{
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: login.email,
          password: login.password
        })
      });
      const result = await response.json();
       if(result.message == "Login successful") {      
           localStorage.setItem("role",result.user.role);
           localStorage.setItem("user",result.user.name);
    
           localStorage.setItem("token",result.access_token);
           toast.success(result.message,{ duration: 4000 });
           navigate("/dashboard");
        }
        else{
          toast.error(result.message,{ duration: 4000 });
        }    
      }catch(e){
        console.log("error");
      }finally{
      setLoadingSubmit(false);
    }
}
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        name: Data.name,
        email: Data.email,
        password: Data.password,
        password_confirmation: Data.password_confirmation,

        national_id: Data.national_id,
        address: Data.address,
        contact: Data.contact,
        date_of_birth: Data.date_of_birth
      }
      ),
    });
    const result = await response.json();
    navigate(-1);
    alert(result.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4 transform scale-80 origin-top">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 ">


        <div className="hidden md:block space-y-6 ">

          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Building2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">MMS Portal</h1>
              <p className="text-muted-foreground">Municipality Management System</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Welcome</h2>
            <p className="text-muted-foreground">
              Access all municipal services, manage projects, track finances, and serve your community efficiently.
            </p>
          </div>
        </div>
        {/* Mobile hero */}
        <div className="md:hidden mb-4 text-center space-y-1">

          <div className="flex flex-col items-center gap-2 ">
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg ">
              <Building2 className="h-10 w-10 text-primary-foreground " />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">MMS Portal</h1>
              <p className="text-muted-foreground">Municipality Management System</p>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Welcome</h2>
          </div>
        </div>
        <Card className="w-full -mt-7 md:mt-0  ">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="hover:bg-blue-400 rounded-none hover:text-white">Login</TabsTrigger>
                <TabsTrigger value="signup" className="hover:bg-blue-400 rounded-none hover:text-white">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4 " onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={login.email}
                      onChange={handleChangeLogin}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={login.password}
                      onChange={handleChangeLogin}

                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loadingSubmit}>
                     {loadingSubmit ? "Logining...":"Login"}
                  </Button>

                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Name"
                      value={Data.name}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={Data.email}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={Data.password}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="password_confirmation"
                      type="password"
                      placeholder="Confirm your password"
                      value={Data.password_confirmation}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">National ID</Label>
                    <Input
                      id="NID"
                      name="national_id"
                      type="number"
                      placeholder="national ID"
                      value={Data.national_id}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Address"
                      value={Data.address}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Phone number</Label>
                    <Input
                      id="phone-number"
                      name="contact"
                      type="number"
                      placeholder="Number"
                      value={Data.contact}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Date  of birth</Label>
                    <Input
                      id="dob"
                      name="date_of_birth"
                      type="date"
                      value={Data.date_of_birth}
                      onChange={handleChangeSignIn}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full  text-white" disabled={loadingSubmit}>
                    {loadingSubmit ? "Signing up...":"Sign up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}