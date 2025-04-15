from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.http import HttpResponse, Http404
from django.conf import settings
import os
import mimetypes
from .models import Document
from .forms import DocumentForm

class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = 'documents/document_list.html'
    context_object_name = 'documents'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        category = self.request.GET.get('category', '')
        client_id = self.request.GET.get('client', '')
        project_id = self.request.GET.get('project', '')
        
        if search_query:
            queryset = queryset.filter(title__icontains=search_query)
        
        if category:
            queryset = queryset.filter(category=category)
        
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_query'] = self.request.GET.get('search', '')
        context['category'] = self.request.GET.get('category', '')
        
        from clients.models import Client
        from projects.models import Project
        
        context['clients'] = Client.objects.all()
        context['projects'] = Project.objects.all()
        context['categories'] = dict(Document.CATEGORY_CHOICES)
        
        return context

class DocumentDetailView(LoginRequiredMixin, DetailView):
    model = Document
    template_name = 'documents/document_detail.html'
    context_object_name = 'document'

class DocumentCreateView(LoginRequiredMixin, CreateView):
    model = Document
    form_class = DocumentForm
    template_name = 'documents/document_form.html'
    
    def get_initial(self):
        initial = super().get_initial()
        client_id = self.request.GET.get('client', '')
        project_id = self.request.GET.get('project', '')
        
        if client_id:
            initial['client'] = client_id
        
        if project_id:
            initial['project'] = project_id
        
        return initial
    
    def form_valid(self, form):
        form.instance.uploaded_by = self.request.user
        messages.success(self.request, 'Document uploaded successfully.')
        return super().form_valid(form)
    
    def get_success_url(self):
        if self.object.project:
            return reverse_lazy('project-detail', kwargs={'pk': self.object.project.pk})
        elif self.object.client:
            return reverse_lazy('client-detail', kwargs={'pk': self.object.client.pk})
        return reverse_lazy('document-list')

class DocumentUpdateView(LoginRequiredMixin, UpdateView):
    model = Document
    form_class = DocumentForm
    template_name = 'documents/document_form.html'
    
    def form_valid(self, form):
        messages.success(self.request, 'Document updated successfully.')
        return super().form_valid(form)

class DocumentDeleteView(LoginRequiredMixin, DeleteView):
    model = Document
    template_name = 'documents/document_confirm_delete.html'
    success_url = reverse_lazy('document-list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Document deleted successfully.')
        return super().delete(request, *args, **kwargs)

def download_document(request, pk):
    document = get_object_or_404(Document, pk=pk)
    file_path = document.file.path
    
    if os.path.exists(file_path):
        with open(file_path, 'rb') as fh:
            response = HttpResponse(fh.read(), content_type=mimetypes.guess_type(file_path)[0])
            response['Content-Disposition'] = f'attachment; filename={os.path.basename(file_path)}'
            return response
    
    raise Http404("Document does not exist")

def sample_document(request):
    # Generate a sample CSV file for download
    import csv
    from io import StringIO
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="sample_clients.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'Zip Code', 'Country', 'Website', 'Industry'])
    writer.writerow(['Acme Inc.', 'contact@acme.com', '555-123-4567', '123 Main St', 'New York', 'NY', '10001', 'USA', 'www.acme.com', 'Technology'])
    writer.writerow(['XYZ Corp', 'info@xyz.com', '555-987-6543', '456 Oak Ave', 'San Francisco', 'CA', '94102', 'USA', 'www.xyz.com', 'Manufacturing'])
    
    return response