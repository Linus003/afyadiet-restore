"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Trash, Link as LinkIcon, Save, Upload, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuLinks, setMenuLinks] = useState<any[]>([]);

  // Menu Builder State
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadField, setActiveUploadField] = useState<'faviconUrl' | 'landingHeroImage' | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then(res => res.json()).then(data => {
      setSettings(data);
      if (data.mainMenu && Array.isArray(data.mainMenu)) {
        setMenuLinks(data.mainMenu);
      } else {
        // Default Links
        setMenuLinks([
          { label: "Home", href: "/" },
          { label: "Browse Experts", href: "/browse" },
          { label: "For Dietitians", href: "/signup?role=nutritionist" }
        ]);
      }
    });
  }, []);

  // --- UPLOAD HANDLERS ---
  const triggerUpload = (field: 'faviconUrl' | 'landingHeroImage') => {
    setActiveUploadField(field);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadField) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setSettings({ ...settings, [activeUploadField]: data.url }); // Store the URL directly
      } else {
        alert("Upload failed: " + data.error);
      }
    } catch (error) {
      alert("Error uploading file");
    } finally {
      setUploading(false);
      setActiveUploadField(null);
    }
  };

  // --- MENU HANDLERS ---
  const addMenuLink = () => {
    if(!newLabel || !newHref) return;
    setMenuLinks([...menuLinks, { label: newLabel, href: newHref }]);
    setNewLabel("");
    setNewHref("");
  };

  const removeMenuLink = (idx: number) => {
    const updated = [...menuLinks];
    updated.splice(idx, 1);
    setMenuLinks(updated);
  };

  const moveLink = (idx: number, direction: 'up' | 'down') => {
    const updated = [...menuLinks];
    if (direction === 'up' && idx > 0) {
      [updated[idx], updated[idx - 1]] = [updated[idx - 1], updated[idx]];
    } else if (direction === 'down' && idx < updated.length - 1) {
      [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    }
    setMenuLinks(updated);
  };

  const saveAll = async () => {
    setLoading(true);
    const payload = { ...settings, mainMenu: menuLinks }; 
    
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setLoading(false);
    alert("Settings Saved Successfully!");
  };

  return (
    <div className="space-y-8 max-w-4xl pb-32">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">System & Design Settings</h1>
      
      {/* HIDDEN FILE INPUT */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* --- MENU MANAGER --- */}
      <Card className="border-blue-100 bg-blue-50/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-blue-600"/> Navigation Menu</CardTitle>
          <CardDescription>Drag (using arrows) to reorder tabs. Changes appear instantly on the site after saving.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
              {menuLinks.map((link, idx) => (
                <div key={idx} className="flex items-center bg-white p-3 rounded border shadow-sm group hover:border-blue-300 transition-colors">
                   {/* Reorder Controls */}
                   <div className="flex flex-col mr-3 gap-1">
                      <button onClick={() => moveLink(idx, 'up')} disabled={idx === 0} className="text-slate-400 hover:text-blue-600 disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                      <button onClick={() => moveLink(idx, 'down')} disabled={idx === menuLinks.length - 1} className="text-slate-400 hover:text-blue-600 disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
                   </div>
                   
                   <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="font-bold text-slate-700">{link.label}</div>
                      <div className="text-slate-400 text-sm font-mono truncate">{link.href}</div>
                   </div>

                   <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-50 hover:text-red-600" onClick={() => removeMenuLink(idx)}><Trash className="w-4 h-4"/></Button>
                </div>
              ))}
           </div>

           {/* Add New Link Form */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end pt-4 border-t border-slate-200/60">
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500">Button Label</label>
                 <Input placeholder="e.g. Services" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="bg-white"/>
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500">Page Link / URL</label>
                 <Input placeholder="e.g. /services" value={newHref} onChange={e => setNewHref(e.target.value)} className="bg-white"/>
              </div>
              <Button onClick={addMenuLink} disabled={!newLabel || !newHref} className="bg-slate-800 text-white"><Plus className="w-4 h-4 mr-2"/> Add to Menu</Button>
           </div>
        </CardContent>
      </Card>

      {/* --- VISUALS & BRANDING --- */}
      <Card>
          <CardHeader><CardTitle>Visuals & Branding</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            
            {/* Favicon */}
            <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50/50">
                <div className="flex items-center gap-4">
                    {settings.faviconUrl ? (
                        <div className="w-12 h-12 border bg-white rounded flex items-center justify-center">
                           <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center"><ImageIcon className="text-slate-400"/></div>
                    )}
                    <div>
                        <p className="font-medium text-slate-900">Website Favicon</p>
                        <p className="text-sm text-slate-500">The small icon seen in browser tabs.</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => triggerUpload('faviconUrl')} disabled={uploading}>
                    {uploading && activeUploadField === 'faviconUrl' ? <Loader2 className="animate-spin w-4 h-4"/> : <Upload className="w-4 h-4 mr-2"/>} 
                    Upload Icon
                </Button>
            </div>

            {/* Hero Image */}
            <div className="border p-4 rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="font-medium text-slate-900">Homepage Hero Image</p>
                        <p className="text-sm text-slate-500">The main large image on your landing page.</p>
                    </div>
                    <Button variant="outline" onClick={() => triggerUpload('landingHeroImage')} disabled={uploading}>
                         {uploading && activeUploadField === 'landingHeroImage' ? <Loader2 className="animate-spin w-4 h-4"/> : <Upload className="w-4 h-4 mr-2"/>}
                         Change Image
                    </Button>
                </div>
                {settings.landingHeroImage && (
                    <div className="h-64 bg-slate-200 rounded-lg overflow-hidden relative border shadow-inner">
                        <img src={settings.landingHeroImage} alt="Hero" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
          </CardContent>
      </Card>

      {/* --- GENERAL SETTINGS --- */}
      <Card>
          <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Name</Label>
              <Input value={settings.siteName || ''} onChange={e => setSettings({...settings, siteName: e.target.value})} />
            </div>
            <div>
              <Label>Support Email</Label>
              <Input value={settings.supportEmail || ''} onChange={e => setSettings({...settings, supportEmail: e.target.value})} />
            </div>
          </CardContent>
      </Card>

      {/* FIXED SAVE BUTTON */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t flex justify-end shadow-lg z-40">
          <Button onClick={saveAll} className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto shadow-lg">
            {loading ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 w-4 h-4"/>} Save All Changes
          </Button>
      </div>
    </div>
  );
}