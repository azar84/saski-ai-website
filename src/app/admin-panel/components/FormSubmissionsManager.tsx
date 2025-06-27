'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Eye, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface FormSubmission {
  id: number;
  formId: number;
  formData: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  isRead: boolean;
  isSpam: boolean;
  notes?: string;
  createdAt: string;
  form: {
    name: string;
    title: string;
  };
}

interface Form {
  id: number;
  name: string;
  title: string;
}

export default function FormSubmissionsManager() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [selectedFormId, currentPage]);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (selectedFormId) {
        params.append('formId', selectedFormId.toString());
      }

      const response = await fetch(`/api/admin/form-submissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
  };

  const handleUpdateSubmission = async (id: number, updates: { isRead?: boolean; isSpam?: boolean; notes?: string }) => {
    try {
      const response = await fetch('/api/admin/form-submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (response.ok) {
        await fetchSubmissions();
      }
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const handleDeleteSubmission = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/form-submissions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchSubmissions();
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseFormData = (formDataString: string) => {
    try {
      return JSON.parse(formDataString);
    } catch {
      return {};
    }
  };

  if (loading && submissions.length === 0) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
          <p className="text-gray-600">View and manage form submissions</p>
        </div>
        <Button onClick={fetchSubmissions} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Form:</span>
          </div>
          <select
            value={selectedFormId || ''}
            onChange={(e) => {
              setSelectedFormId(e.target.value ? parseInt(e.target.value) : null);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="">All Forms</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map((submission) => {
          const formData = parseFormData(submission.formData);
          
          return (
            <Card key={submission.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {submission.form.title}
                    </h3>
                    {submission.isRead && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {submission.isSpam && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Submitted on {formatDate(submission.createdAt)}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {Object.keys(formData).length} field{Object.keys(formData).length !== 1 ? 's' : ''} submitted
                  </div>
                  
                  {submission.notes && (
                    <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      <strong>Notes:</strong> {submission.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSubmission(submission)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSubmission(submission.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Submission Detail Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Submission Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmissionModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Form Information</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Form:</strong> {selectedSubmission.form.title}</p>
                  <p><strong>Submitted:</strong> {formatDate(selectedSubmission.createdAt)}</p>
                  <p><strong>IP Address:</strong> {selectedSubmission.ipAddress || 'Unknown'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Form Data</h4>
                <div className="bg-gray-50 p-4 rounded">
                  {Object.entries(parseFormData(selectedSubmission.formData)).map(([key, value]) => (
                    <div key={key} className="mb-2">
                      <strong className="text-gray-700">{key}:</strong>
                      <span className="ml-2 text-gray-600">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSubmission.isRead}
                      onChange={(e) => handleUpdateSubmission(selectedSubmission.id, { isRead: e.target.checked })}
                      className="mr-2"
                    />
                    Mark as Read
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSubmission.isSpam}
                      onChange={(e) => handleUpdateSubmission(selectedSubmission.id, { isSpam: e.target.checked })}
                      className="mr-2"
                    />
                    Mark as Spam
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 