import { useState, useEffect, useCallback } from "react";
import { Users, Edit, Mail, Phone, IdCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import  getCsrfToken  from '../../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export function CitizenList() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: ""
    , name: ""
    , email: ""
    , password: ""
    , password_confirmation: ""
    , national_id: ""
    , address: ""
    , contact: ""
    , date_of_birth: "",
    status: "",
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editStatus, setEditStatus] = useState("");
  const { toast } = useToast();
  const [C, setC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [CurrentPage, setCurrentPage] = useState<number>(1);
  const [LastPage, setLastPage] = useState<number>(1);
  const [Clicked, setClicked] = useState(false);
  
    const fetchPage = async (pageNumber: number) => {
      const response = await fetch(`http://127.0.0.1:8000/api/citizens?page=${pageNumber}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
      const res = await response.json();
      
      setC(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    };
  
    const fetchData = async () => {
      await fetchPage(1);
      setLoading(false);
    };
    useEffect(() => {
      fetchData();
    }, [Clicked]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading citizens list...</span>
      </div>
    );
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }));
    setEditStatus(value);
  };

  const handleEditClick = (citizen: any) => {
    setFormData({
      id: citizen.id,
      name: citizen.user.name,
      email: citizen.user.email,
      password: "",
      password_confirmation: "",
      national_id: citizen.national_id,
      address: citizen.address,
      contact: citizen.contact,
      date_of_birth: citizen.date_of_birth,
      status: citizen.user.status,
    });
    setEditStatus(citizen.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    setClicked(true);
    setClicked(false);
    setLoadingSubmit(true);
    if (!formData.name.trim() || !formData.email.trim() || !formData.national_id.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    try {

      const response = await fetch("http://127.0.0.1:8000/cs/citizens/" + formData.id, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          'X-XSRF-TOKEN':getCsrfToken(),
        },
        body: JSON.stringify({
          'name': formData.name,
          'email': formData.email,
          'natioanl_id': formData.national_id,
          'address': formData.address,
          'contact': formData.contact,
          'date_of_birth': formData.date_of_birth,
          'status': editStatus,
        }),
      });
      const result = await response.json();
      setRefreshTrigger(100);

      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "changed",
      });
    } catch (e) {
      console.log("error");
    } finally {
      setLoadingSubmit(false);
    }
  };
  const citizenFormFields = (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-national_id">National ID *</Label>
            <Input
              id="edit-national_id"
              name="national_id"
              value={formData.national_id}
              onChange={handleInputChange}
              placeholder="National ID Number"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-address">Address</Label>
          <Input
            id="edit-address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Full Address"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-contact">Contact</Label>
            <Input
              id="edit-contact"
              name="contact"
              value={formData.contact}
              onChange={handleInputChange}
              placeholder="+1-234-567-8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date_of_birth">Date of Birth</Label>
            <Input
              id="edit-date_of_birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-status">Status</Label>
          <Select value={editStatus} onValueChange={handleStatusChange}>
            <SelectTrigger id="edit-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">In active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/50">
          <CardContent className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{C?.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Citizens</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {C?.filter(r => r.status === 'active').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {C?.filter(r => r.status === 'inactive').length}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Inactive</p>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{C?.length}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Showing</p>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg sm:text-xl font-semibold">Citizen Directory</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage registered citizens</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Citizen List */}
          <div className="space-y-3">
            {C?.map((citizen) => (
              <div
                key={citizen.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-secondary/30 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors gap-3 sm:gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 border-2 border-primary/20 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm sm:text-base">

                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <p className="font-semibold text-foreground text-sm sm:text-base">{citizen.user.name}</p>
                      <Badge
                        variant={citizen.status === "active" ? "default" : "secondary"}
                        className={`text-xs ${citizen.status === "active"
                          ? "bg-success hover:bg-success/90"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {citizen.user.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{citizen.user.status}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" />
                        {citizen.contact}
                      </span>
                      <span className="flex items-center gap-1">
                        <IdCard className="h-3 w-3 shrink-0" />
                        {citizen.national_id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(citizen)}
                    className="gap-1 text-xs sm:text-sm"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </div>
              </div>
            ))}

            {C?.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No citizens found</p>
              </div>
            )}
            {(CurrentPage && LastPage && LastPage > 1) && (
              <div className="flex items-center justify-between w-full p-4">
                <div className="text-sm text-muted-foreground">
                  Page {CurrentPage} of {LastPage}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={CurrentPage <= 1}
                    onClick={async () => {
                      setLoading(true);
                      await fetchPage(CurrentPage - 1);
                      setLoading(false);
                    }}
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, LastPage) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === CurrentPage;
                      return (
                        <Button
                          key={pageNum}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs font-medium transition-all duration-200 ${isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-primary hover:text-primary-foreground"
                            }`}
                          disabled={pageNum > LastPage}
                          onClick={async () => {
                            setLoading(true);
                            await fetchPage(pageNum);
                            setLoading(false);
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {LastPage > 5 && (
                      <>
                        <span className="text-muted-foreground text-xs px-1">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                          onClick={async () => {
                            setLoading(true);
                            await fetchPage(LastPage);
                            setLoading(false);
                          }}
                        >
                          {LastPage}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={CurrentPage >= LastPage}
                    onClick={async () => {
                      setLoading(true);
                      await fetchPage(CurrentPage + 1);
                      setLoading(false);
                    }}
                  >
                    Next
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Citizen</DialogTitle>
            <DialogDescription>
              Update the citizen's information. Leave password fields empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          {citizenFormFields}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleUpdateCitizen} className="w-full sm:w-auto" disabled={loadingSubmit}>
              {loadingSubmit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  editing...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
