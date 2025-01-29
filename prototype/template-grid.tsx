import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TemplateGrid = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('https://api-sandbox.duda.co/api/sites/multiscreen/templates', {
          headers: {
            'Authorization': 'Basic NmExNTEzODE6djZqVWh5QTJTb0M5'
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        setError('Failed to fetch templates');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-gray-600">Loading templates...</div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl text-red-600">{error}</div>
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Website Templates</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div
            key={template.template_id}
            className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              <img
                src={template.thumbnail_url || '/api/placeholder/400/225'}
                alt={template.template_name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/225';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold truncate">{template.template_name}</h3>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedTemplate !== null} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.template_name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-gray-700">Template ID: {selectedTemplate?.template_id}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateGrid;