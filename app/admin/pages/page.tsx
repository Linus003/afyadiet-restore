"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Trash, Eye, FileText, Globe, Pencil } from "lucide-react";
import Link from "next/link";

export default function AdminPageManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      if (res.ok) setPages(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const createPage = async () => {
    if(!newTitle || !newSlug) return;
    setIsCreating(true);
    
    const res = await fetch("/api/admin/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug }),
    });

    if (res.ok) {
      setNewTitle("");
      setNewSlug("");
      fetchPages();
      alert("Page created successfully!");
    } else {
      alert("Error: Page slug might already exist.");
    }
    setIsCreating(false);
  };

  const deletePage = async (id: string) => {
    if(!confirm("Are you sure? This will delete the page and all its content.")) return;
    await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
    fetchPages();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">CMS Page Manager</h1>
          <p className="text-slate-500 mt-2">Create and manage dynamic website pages (e.g. About, Careers).</p>
        </div>
        <Button variant="outline" onClick={fetchPages} className="gap-2">
           Refresh List
        </Button>
      </div>

      {/* Create Section */}
      <Card className="bg-slate-50 border-dashed border-slate-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-700">
            <Plus className="w-5 h-5" /> Create New Page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full space-y-2">
              <label className="text-sm font-medium text-slate-600">Page Title</label>
              <Input 
                placeholder="e.g. Terms and Conditions" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                className="bg-white"
              />
            </div>
            <div className="w-full space-y-2">
              <label className="text-sm font-medium text-slate-600">URL Slug</label>
              <div className="flex items-center">
                <span className="bg-slate-200 px-3 py-2 rounded-l-md text-slate-500 text-sm border border-r-0 border-slate-300">/</span>
                <Input 
                  placeholder="e.g. terms-conditions" 
                  value={newSlug} 
                  onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
                  className="rounded-l-none"
                />
              </div>
            </div>
            <Button onClick={createPage} disabled={isCreating || !newTitle || !newSlug} className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
              {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Page"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400"><Loader2 className="animate-spin w-8 h-8 mx-auto mb-2"/> Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No pages found</h3>
            <p className="text-slate-500">Create your first dynamic page above.</p>
          </div>
        ) : (
          pages.map(page => (
            <div key={page.id} className="group bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{page.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm font-mono bg-slate-100 px-1 rounded">/{page.slug}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {page.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* --- NEW EDIT BUTTON --- */}
                <Button asChild variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                  <Link href={`/admin/pages/${page.id}`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="sm" className="text-slate-600 hover:text-green-600">
                  <Link href={`/${page.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Link>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deletePage(page.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}