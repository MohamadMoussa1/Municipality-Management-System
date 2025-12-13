import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, TrendingUp, Clock, AlertCircle, Download, Plus } from 'lucide-react';
import { mockPayments } from '@/lib/mockData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import type { Payment } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const revenueData = [
  { name: 'Property Tax', value: 450000, color: '#0088FE' },
  { name: 'Water Bills', value: 180000, color: '#00C49F' },
  { name: 'Electricity', value: 100000, color: '#FFBB28' },
  { name: 'Permits', value: 95000, color: '#FF8042' },
  { name: 'Waste', value: 65000, color: '#8884d8' },
];

const monthlyRevenue = [
  { month: 'Jan', collected: 75000, target: 80000 },
  { month: 'Feb', collected: 82000, target: 80000 },
  { month: 'Mar', collected: 78000, target: 80000 },
  { month: 'Apr', collected: 85000, target: 80000 },
  { month: 'May', collected: 79000, target: 80000 },
  { month: 'Jun', collected: 91000, target: 80000 },
];

// Mock citizens for selection
const mockCitizens = [
  { id: 'CIT001', name: 'John Smith' },
  { id: 'CIT002', name: 'Sarah Johnson' },
  { id: 'CIT003', name: 'Michael Brown' },
  { id: 'CIT004', name: 'Emily Davis' },
  { id: 'CIT005', name: 'Robert Wilson' },
];

export default function Finance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payments, setPayments] = useState(mockPayments);
  
  // New payment form state
  const [createPaymentOpen, setCreatePaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    payment_type: '' as Payment['payment_type'] | '',
    amount: '',
    selectedCitizens: [] as string[],
  });

  const handleExportReport = () => {
    toast({
      title: "Export Started",
      description: "Downloading financial report as CSV...",
    });
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  const handleCreatePayment = () => {
    if (!newPayment.payment_type || !newPayment.amount || newPayment.selectedCitizens.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one citizen.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    // Create payments for each selected citizen
    const newPayments: Payment[] = newPayment.selectedCitizens.map((citizenId, index) => {
      const citizen = mockCitizens.find(c => c.id === citizenId);
      return {
        id: `PAY${String(payments.length + index + 1).padStart(3, '0')}`,
        citizen_id: citizenId,
        amount,
        payment_type: newPayment.payment_type as Payment['payment_type'],
        date: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        citizenName: citizen?.name || 'Unknown',
      };
    });

    setPayments([...newPayments, ...payments]);
    setNewPayment({ payment_type: '', amount: '', selectedCitizens: [] });
    setCreatePaymentOpen(false);
    
    toast({
      title: "Payment Created",
      description: `${newPayments.length} payment(s) assigned successfully.`,
    });
  };

  const toggleCitizenSelection = (citizenId: string) => {
    setNewPayment(prev => ({
      ...prev,
      selectedCitizens: prev.selectedCitizens.includes(citizenId)
        ? prev.selectedCitizens.filter(id => id !== citizenId)
        : [...prev.selectedCitizens, citizenId]
    }));
  };

  const getFilteredPayments = () => {
    if (activeTab === 'all') return payments;
    return payments.filter(p => p.status === activeTab);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-4 md:px-0">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">Finance & Billing</h1>
        <p className="text-[10px] sm:text-sm md:text-base text-muted-foreground mt-1">Revenue tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-2 sm:px-4 md:px-0">
        <Card>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center justify-between w-full">
                <div className="text-base sm:text-xl md:text-2xl font-bold">$890K</div>
                <div className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 sm:h-5 sm:w-5 md:h-6 md:w-6 text-success" />
                </div>
              </div>
              <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground">Total</div>
              <div className="flex items-center gap-1 text-[9px] sm:text-xs text-success">
                <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3" />
                <span>+12.4%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center justify-between w-full">
                <div className="text-base sm:text-xl md:text-2xl font-bold">$745K</div>
                <div className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                </div>
              </div>
              <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground">Collected</div>
              <div className="text-[9px] sm:text-xs text-primary">83.7%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center justify-between w-full">
                <div className="text-base sm:text-xl md:text-2xl font-bold">$120K</div>
                <div className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="h-3 w-3 sm:h-5 sm:w-5 md:h-6 md:w-6 text-warning" />
                </div>
              </div>
              <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground">Pending</div>
              <div className="text-[9px] sm:text-xs text-muted-foreground">30d</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center justify-between w-full">
                <div className="text-base sm:text-xl md:text-2xl font-bold">$25K</div>
                <div className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 sm:h-5 sm:w-5 md:h-6 md:w-6 text-destructive" />
                </div>
              </div>
              <div className="text-[9px] sm:text-xs md:text-sm text-muted-foreground">Overdue</div>
              <div className="text-[9px] sm:text-xs text-muted-foreground">18 acc</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-4 md:px-0">
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg md:text-xl">Revenue Distribution</CardTitle>
            <CardDescription className="text-[10px] sm:text-sm">Income by category</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-lg md:text-xl">Monthly Collection</CardTitle>
            <CardDescription className="text-[10px] sm:text-sm">Collected vs Target</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontSize: '10px' }} />
                <YAxis style={{ fontSize: '10px' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="collected" fill="hsl(var(--success))" name="Collected" />
                <Bar dataKey="target" fill="hsl(var(--primary))" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mx-2 sm:mx-4 md:mx-0">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-2">
            <div>
              <CardTitle className="text-sm sm:text-lg md:text-xl">Payment Transactions</CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">Recent activity</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => setCreatePaymentOpen(true)} className="w-full sm:w-auto text-[10px] sm:text-sm h-8 sm:h-10">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Create New Payment
              </Button>
              <Button onClick={handleExportReport} variant="outline" className="w-full sm:w-auto text-[10px] sm:text-sm h-8 sm:h-10">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-2 sm:mb-4 h-7 sm:h-10">
              <TabsTrigger value="all" className="text-[10px] sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="paid" className="text-[10px] sm:text-sm">Paid</TabsTrigger>
              <TabsTrigger value="pending" className="text-[10px] sm:text-sm">Pend</TabsTrigger>
              <TabsTrigger value="overdue" className="text-[10px] sm:text-sm">Over</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap text-[10px] sm:text-sm px-2 sm:px-4">ID</TableHead>
                      <TableHead className="whitespace-nowrap text-[10px] sm:text-sm px-2 sm:px-4">Citizen</TableHead>
                      <TableHead className="whitespace-nowrap text-[10px] sm:text-sm px-2 sm:px-4 hidden md:table-cell">Type</TableHead>
                      <TableHead className="whitespace-nowrap text-[10px] sm:text-sm px-2 sm:px-4">Amount</TableHead>
                      <TableHead className="whitespace-nowrap text-[10px] sm:text-sm px-2 sm:px-4 hidden sm:table-cell">Date</TableHead>
                      <TableHead className="whitespace-nowrap text-[10px] sm:text-sm px-2 sm:px-4">Status</TableHead>
                      <TableHead className="whitespace-nowrap text-[10px] sm:text-sm px-2 sm:px-4">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredPayments().length > 0 ? (
                      getFilteredPayments().map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium text-[10px] sm:text-sm px-2 sm:px-4">{payment.id}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4 max-w-[80px] truncate">{payment.citizenName}</TableCell>
                          <TableCell className="capitalize text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden md:table-cell">{payment.payment_type.replace('_', ' ')}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4">${payment.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-[10px] sm:text-sm whitespace-nowrap px-2 sm:px-4 hidden sm:table-cell">{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell className="px-2 sm:px-4">
                            {payment.status === 'paid' && <Badge className="bg-success text-[9px] sm:text-xs">Paid</Badge>}
                            {payment.status === 'pending' && <Badge variant="outline" className="text-[9px] sm:text-xs">Pend</Badge>}
                            {payment.status === 'overdue' && <Badge variant="destructive" className="text-[9px] sm:text-xs">Over</Badge>}
                          </TableCell>
                          <TableCell className="px-2 sm:px-4">
                            <Button variant="outline" size="sm" onClick={() => handleViewReceipt(payment)} className="text-[9px] sm:text-xs h-6 sm:h-8 px-1 sm:px-3">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-[10px] sm:text-sm">
                          No {activeTab === 'all' ? '' : activeTab} payments
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>Receipt for {selectedPayment?.id}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <p className="text-sm font-medium">Payment ID</p>
                <p className="text-sm text-muted-foreground">{selectedPayment.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Citizen</p>
                <p className="text-sm text-muted-foreground">{selectedPayment.citizenName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground capitalize">{selectedPayment.payment_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Amount</p>
                <p className="text-lg font-bold">${selectedPayment.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{new Date(selectedPayment.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge className={
                  selectedPayment.status === 'paid' ? 'bg-success' :
                  selectedPayment.status === 'pending' ? 'bg-accent' : 'bg-destructive'
                }>
                  {selectedPayment.status}
                </Badge>
              </div>
              <Button className="w-full" onClick={() => {
                toast({
                  title: "Receipt Downloaded",
                  description: `Receipt for ${selectedPayment.id} has been downloaded.`,
                });
              }}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create New Payment Dialog */}
      <Dialog open={createPaymentOpen} onOpenChange={setCreatePaymentOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
            <DialogDescription>Assign a new payment to one or more citizens</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select
                value={newPayment.payment_type}
                onValueChange={(value: Payment['payment_type']) => setNewPayment({ ...newPayment, payment_type: value })}
              >
                <SelectTrigger id="payment-type">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property_tax">Property Tax</SelectItem>
                  <SelectItem value="water">Water Bill</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="waste">Waste Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Citizens</Label>
              <p className="text-xs text-muted-foreground mb-2">Select one or more citizens to assign this payment</p>
              <div className="border rounded-md p-3 space-y-2 max-h-[200px] overflow-y-auto">
                {mockCitizens.map((citizen) => (
                  <div key={citizen.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={citizen.id}
                      checked={newPayment.selectedCitizens.includes(citizen.id)}
                      onCheckedChange={() => toggleCitizenSelection(citizen.id)}
                    />
                    <label
                      htmlFor={citizen.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {citizen.name}
                    </label>
                  </div>
                ))}
              </div>
              {newPayment.selectedCitizens.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {newPayment.selectedCitizens.length} citizen(s) selected
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreatePaymentOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreatePayment} className="flex-1">
                Create Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
