from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from .models import Contact
from .forms import ContactForm

class ContactListView(LoginRequiredMixin, ListView):
    model = Contact
    template_name = 'contacts/contact_list.html'
    context_object_name = 'contacts'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        client_id = self.request.GET.get('client', '')
        
        if search_query:
            queryset = queryset.filter(
                first_name__icontains=search_query
            ) | queryset.filter(
                last_name__icontains=search_query
            ) | queryset.filter(
                email__icontains=search_query
            )
        
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_query'] = self.request.GET.get('search', '')
        context['client_id'] = self.request.GET.get('client', '')
        
        from clients.models import Client
        context['clients'] = Client.objects.all()
        
        return context

class ContactDetailView(LoginRequiredMixin, DetailView):
    model = Contact
    template_name = 'contacts/contact_detail.html'
    context_object_name = 'contact'

class ContactCreateView(LoginRequiredMixin, CreateView):
    model = Contact
    form_class = ContactForm
    template_name = 'contacts/contact_form.html'
    
    def get_initial(self):
        initial = super().get_initial()
        client_id = self.request.GET.get('client', '')
        if client_id:
            initial['client'] = client_id
        return initial
    
    def get_success_url(self):
        if 'client' in self.request.GET:
            return reverse_lazy('client-detail', kwargs={'pk': self.request.GET['client']})
        return reverse_lazy('contact-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Contact created successfully.')
        return super().form_valid(form)

class ContactUpdateView(LoginRequiredMixin, UpdateView):
    model = Contact
    form_class = ContactForm
    template_name = 'contacts/contact_form.html'
    
    def get_success_url(self):
        return reverse_lazy('contact-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'Contact updated successfully.')
        return super().form_valid(form)

class ContactDeleteView(LoginRequiredMixin, DeleteView):
    model = Contact
    template_name = 'contacts/contact_confirm_delete.html'
    
    def get_success_url(self):
        if self.object.client:
            return reverse_lazy('client-detail', kwargs={'pk': self.object.client.pk})
        return reverse_lazy('contact-list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Contact deleted successfully.')
        return super().delete(request, *args, **kwargs)