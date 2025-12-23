"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingGateway, setIsAddingGateway] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    alert("In a full implementation, this would save credentials securely to the PaymentConfig table and activate the corresponding API integration.");
    setIsAddingGateway(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Ledger</h1>
          <p className="text-slate-500">Track M-Pesa payments, provider payouts, and revenue.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
          
          {/* ADD GATEWAY DIALOG */}
          <Dialog open={isAddingGateway} onOpenChange={setIsAddingGateway}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <CreditCard className="mr-2 h-4 w-4"/> Add Payment Gateway
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure New Payment Provider</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGateway} className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label>Provider Type</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select Provider" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mpesa_paybill">M-Pesa Paybill (Alternative)</SelectItem>
                            <SelectItem value="stripe" disabled>Stripe (Coming Soon)</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Configuration Name</Label>
                      <Input placeholder="e.g. Backup Paybill" required />
                  </div>
                  <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                     I.E let me know mkitaka kuintegrate payments zingine to be safe 
                  </div>
                  <Button type="submit" className="w-full bg-green-600">Save Configuration</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-slate-50/50">
                  <th className="h-12 px-4 align-middle font-medium text-slate-500">Date</th>
                  <th className="h-12 px-4 align-middle font-medium text-slate-500">Client</th>
                  <th className="h-12 px-4 align-middle font-medium text-slate-500">Provider</th>
                  <th className="h-12 px-4 align-middle font-medium text-slate-500">Method</th>
                  <th className="h-12 px-4 align-middle font-medium text-slate-500">Receipt Ref</th>
                  <th className="h-12 px-4 align-middle font-medium text-slate-500">Amount</th>
                  <th className="h-12 px-4 align-middle font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10"><Loader2 className="animate-spin h-6 w-6 mx-auto"/></td></tr>
                ) : transactions.length === 0 ? (
                   <tr><td colSpan={7} className="text-center py-10 text-slate-500">No transactions found.</td></tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b transition-colors hover:bg-slate-50">
                      <td className="p-4 align-middle">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="p-4 align-middle font-medium">{tx.client.name}</td>
                      <td className="p-4 align-middle">{tx.nutritionist.user.name}</td>
                      <td className="p-4 align-middle flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">M-PESA</span>
                      </td>
                      <td className="p-4 align-middle font-mono text-xs">{tx.mpesa_receipt_number || "PENDING"}</td>
                      <td className="p-4 align-middle font-bold text-slate-900">KES {tx.price}</td>
                      <td className="p-4 align-middle">
                        {tx.status === 'completed' || tx.status === 'paid' ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Paid</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}