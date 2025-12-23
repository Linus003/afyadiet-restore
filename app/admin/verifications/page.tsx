"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, XCircle, FileText, Loader2, CheckCircle } from "lucide-react";

export default function VerificationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/verifications");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setProcessing(id);
    const res = await fetch("/api/admin/verifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });

    if (res.ok) {
      fetchRequests(); // Refresh list to remove the processed item
    } else {
      alert("Action failed. Please try again.");
    }
    setProcessing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pending Verifications</h1>
        <Button variant="outline" onClick={fetchRequests}>Refresh List</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-slate-400" /></div>
      ) : requests.length === 0 ? (
        <Card className="bg-slate-50 border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <CheckCircle className="w-12 h-12 mb-4 text-green-500" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm">No pending verification requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="overflow-hidden bg-white border border-slate-200">
              <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
                
                {/* User Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg uppercase">
                    {req.user.name ? req.user.name.charAt(0) : "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{req.user.name}</h3>
                    <p className="text-sm text-slate-500">{req.user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium uppercase">
                        {req.verification_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document View */}
                <div className="flex-shrink-0">
                  {req.kndi_document_url ? (
                    <a 
                      href={req.kndi_document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition-colors"
                    >
                      <FileText className="w-4 h-4" /> View KNDI Document
                    </a>
                  ) : (
                    <span className="text-sm text-red-500 italic">No document uploaded</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => handleAction(req.id, "approve")}
                    disabled={processing === req.id}
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                  >
                    {processing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><BadgeCheck className="w-4 h-4 mr-2" /> Approve</>}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => handleAction(req.id, "reject")}
                    disabled={processing === req.id}
                    className="min-w-[100px]"
                  >
                    {processing === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" /> Reject</>}
                  </Button>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}