"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Trash2, GripVertical, Image as ImageIcon, Type, MousePointerClick, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Drag and Drop Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- SORTABLE ITEM COMPONENT ---
// This wraps each block to make it draggable
function SortableBlock({ id, children, onDelete }: { id: string, children: React.ReactNode, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto', // Keep dragged item on top
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative mb-6">
      <Card className={`relative group border shadow-sm transition-all overflow-hidden ${isDragging ? 'border-blue-500 shadow-xl' : 'border-slate-200 hover:border-blue-300'}`}>
        
        {/* Drag Handle & Controls (Right Side) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-slate-50 border-l flex flex-col items-center justify-center gap-2 z-20">
            {/* The Drag Handle - Apply listeners here */}
            <div {...attributes} {...listeners} className="p-3 cursor-grab active:cursor-grabbing hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600">
                <GripVertical className="w-5 h-5"/>
            </div>
            
            <div className="h-px w-6 bg-slate-300 my-1"></div>
            
            <button onClick={onDelete} className="p-2 hover:bg-red-100 hover:text-red-600 rounded transition-colors">
                <Trash2 className="w-4 h-4"/>
            </button>
        </div>

        {/* Content Area */}
        {children}
      </Card>
    </div>
  );
}

// --- MAIN EDITOR COMPONENT ---
export default function AdvancedPageEditor(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params); 
  const router = useRouter();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState<number | null>(null);
  
  const fileInputRefs = useRef<{[key: number]: HTMLInputElement | null}>({});

  // DnD Sensors (Detects mouse vs touch vs keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { fetchPage(); }, []);

  const fetchPage = async () => {
    const res = await fetch(`/api/admin/pages/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      if (!data.sections) data.sections = [];
      // Ensure every section has a unique ID for Drag-and-Drop to work
      data.sections = data.sections.map((s: any) => ({
          ...s,
          // Use existing DB ID or generate a temporary one if missing
          tempId: s.id || `temp-${Math.random().toString(36).substr(2, 9)}`
      }));
      setPage(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // Clean up tempIds before sending to DB (optional, but good practice)
    const payload = {
        ...page,
        sections: page.sections.map(({ tempId, ...rest }: any) => rest)
    };

    const res = await fetch(`/api/admin/pages/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) alert("Page saved successfully!");
    else alert("Error saving page.");
  };

  // --- DRAG END HANDLER ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setPage((prev: any) => {
        const oldIndex = prev.sections.findIndex((s: any) => s.tempId === active.id);
        const newIndex = prev.sections.findIndex((s: any) => s.tempId === over?.id);
        return {
          ...prev,
          sections: arrayMove(prev.sections, oldIndex, newIndex),
        };
      });
    }
  };

  // --- BLOCK MANAGEMENT ---
  const addSection = (type: string) => {
    let content = {};
    if (type === "HERO") content = { heading: "Page Title", subheading: "Subtitle", ctaText: "", ctaLink: "" };
    if (type === "TEXT") content = { title: "", html: "<p>Start typing here...</p>" };
    if (type === "IMAGE_FULL") content = { imageUrl: "", caption: "" };
    if (type === "BUTTON") content = { text: "Click Me", link: "/", style: "primary" };

    const newSection = {
        type,
        content,
        // Critical: Generate a temp ID instantly so it can be dragged immediately
        tempId: `new-${Date.now()}` 
    };

    setPage({ ...page, sections: [...page.sections, newSection] });
  };

  const removeSection = (index: number) => {
    if(!confirm("Delete this block?")) return;
    const newSections = [...page.sections];
    newSections.splice(index, 1);
    setPage({ ...page, sections: newSections });
  };

  const updateContent = (index: number, field: string, value: string) => {
    const newSections = [...page.sections];
    newSections[index].content = { ...newSections[index].content, [field]: value };
    setPage({ ...page, sections: newSections });
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImg(index);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if(data.success) {
            updateContent(index, 'imageUrl', data.url);
        }
    } catch(err) {
        alert("Upload failed");
    } finally {
        setUploadingImg(null);
    }
  };

  const insertTag = (index: number, tag: string) => {
    const currentHtml = page.sections[index].content.html || "";
    let newHtml = currentHtml;
    if (tag === 'bold') newHtml += " <strong>Bold Text</strong> ";
    if (tag === 'h2') newHtml += " <h2>Section Header</h2> ";
    if (tag === 'list') newHtml += " <ul><li>Item 1</li><li>Item 2</li></ul> ";
    updateContent(index, 'html', newHtml);
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!page) return <div className="p-8">Page not found</div>;

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-white z-30 py-4 shadow-sm px-4 -mx-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{page.title}</h1>
            <p className="text-xs text-slate-500">/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
             <Label htmlFor="publish-mode" className="text-xs font-bold uppercase text-slate-500 cursor-pointer">Live</Label>
             <Switch id="publish-mode" checked={page.isPublished} onCheckedChange={(c) => setPage({...page, isPublished: c})} />
           </div>
           <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
             {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>} Save Page
           </Button>
        </div>
      </div>

      {/* DRAG AND DROP CONTEXT */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={page.sections.map((s: any) => s.tempId)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
                
                {page.sections.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                        <p className="text-slate-400">Page is empty. Click a button below to add your first block.</p>
                    </div>
                )}

                {page.sections.map((section: any, idx: number) => (
                    <SortableBlock key={section.tempId} id={section.tempId} onDelete={() => removeSection(idx)}>
                        <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100 py-3 pr-16">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                                {section.type === "HERO" && <ImageIcon className="w-4 h-4 text-blue-500"/>}
                                {section.type === "TEXT" && <Type className="w-4 h-4 text-orange-500"/>}
                                {section.type === "IMAGE_FULL" && <Upload className="w-4 h-4 text-purple-500"/>}
                                {section.type === "BUTTON" && <MousePointerClick className="w-4 h-4 text-green-500"/>}
                                {section.type.replace(/_/g, " ")} BLOCK
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4 pt-6 pr-16">
                            {/* === HERO BLOCK === */}
                            {section.type === "HERO" && (
                                <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Main Heading</Label>
                                    <Input value={section.content.heading} onChange={e => updateContent(idx, 'heading', e.target.value)} className="font-bold text-lg"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input value={section.content.subheading} onChange={e => updateContent(idx, 'subheading', e.target.value)} />
                                </div>
                                </div>
                            )}

                            {/* === RICH TEXT BLOCK === */}
                            {section.type === "TEXT" && (
                                <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2 bg-slate-50 p-2 rounded border">
                                    <span className="text-xs font-bold text-slate-500 uppercase mr-2">Format:</span>
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => insertTag(idx, 'bold')}><b>B</b></Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => insertTag(idx, 'h2')}><span className="font-bold text-lg">H2</span></Button>
                                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => insertTag(idx, 'list')}>List</Button>
                                </div>
                                <Textarea 
                                    rows={6} 
                                    className="font-mono text-sm leading-relaxed"
                                    value={section.content.html} 
                                    onChange={e => updateContent(idx, 'html', e.target.value)} 
                                />
                                </div>
                            )}

                            {/* === IMAGE BLOCK === */}
                            {section.type === "IMAGE_FULL" && (
                                <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                        <Label>Image Source</Label>
                                        <div className="flex gap-2">
                                            <Input value={section.content.imageUrl} onChange={e => updateContent(idx, 'imageUrl', e.target.value)} placeholder="/uploads/..." />
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={el => { fileInputRefs.current[idx] = el }}
                                                onChange={(e) => handleImageUpload(idx, e)}
                                            />
                                            <Button variant="outline" onClick={() => fileInputRefs.current[idx]?.click()}>
                                                {uploadingImg === idx ? <Loader2 className="animate-spin w-4 h-4"/> : <Upload className="w-4 h-4"/>}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {section.content.imageUrl && (
                                    <div className="relative h-48 w-full bg-slate-100 rounded-lg overflow-hidden border">
                                        <img src={section.content.imageUrl} className="w-full h-full object-contain" alt="Preview"/>
                                    </div>
                                )}
                                </div>
                            )}

                            {/* === BUTTON BLOCK === */}
                            {section.type === "BUTTON" && (
                                <div className="flex flex-wrap gap-4 items-end">
                                <div className="space-y-2 flex-1">
                                    <Label>Button Text</Label>
                                    <Input value={section.content.text} onChange={e => updateContent(idx, 'text', e.target.value)} placeholder="Click Here"/>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Link URL</Label>
                                    <Input value={section.content.link} onChange={e => updateContent(idx, 'link', e.target.value)} placeholder="/contact"/>
                                </div>
                                <div className="space-y-2">
                                    <Label>Style</Label>
                                    <select 
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={section.content.style}
                                        onChange={e => updateContent(idx, 'style', e.target.value)}
                                    >
                                        <option value="primary">Green (Primary)</option>
                                        <option value="outline">Outline</option>
                                        <option value="ghost">Ghost (Text Only)</option>
                                    </select>
                                </div>
                                <div className="pb-1">
                                    <Button 
                                        variant={section.content.style === 'primary' ? 'default' : section.content.style === 'outline' ? 'outline' : 'ghost'}
                                        className={section.content.style === 'primary' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                                    >
                                        {section.content.text || "Preview"}
                                    </Button>
                                </div>
                                </div>
                            )}
                        </CardContent>
                    </SortableBlock>
                ))}

            </div>
        </SortableContext>
      </DndContext>

      {/* Footer Controls */}
      <div className="flex flex-wrap gap-3 justify-center pt-10 border-t border-slate-200">
           <Button variant="outline" onClick={() => addSection('HERO')} className="gap-2 bg-white hover:border-blue-400 hover:text-blue-600 shadow-sm h-12 px-6">
             <ImageIcon className="h-5 w-5 text-blue-500"/> + Header
           </Button>
           <Button variant="outline" onClick={() => addSection('TEXT')} className="gap-2 bg-white hover:border-blue-400 hover:text-blue-600 shadow-sm h-12 px-6">
             <Type className="h-5 w-5 text-orange-500"/> + Text Block
           </Button>
           <Button variant="outline" onClick={() => addSection('IMAGE_FULL')} className="gap-2 bg-white hover:border-blue-400 hover:text-blue-600 shadow-sm h-12 px-6">
             <Upload className="h-5 w-5 text-purple-500"/> + Image
           </Button>
           <Button variant="outline" onClick={() => addSection('BUTTON')} className="gap-2 bg-white hover:border-blue-400 hover:text-blue-600 shadow-sm h-12 px-6">
             <MousePointerClick className="h-5 w-5 text-green-500"/> + Button
           </Button>
      </div>
    </div>
  );
}