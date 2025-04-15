from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy, reverse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from django.db.models import Q
from .models import Task, TaskComment, TaskAttachment
from .forms import TaskForm, TaskCommentForm, TaskAttachmentForm, TaskFilterForm

class TaskListView(LoginRequiredMixin, ListView):
    model = Task
    template_name = 'tasks/task_list.html'
    context_object_name = 'tasks'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        form = TaskFilterForm(self.request.GET)
        
        if form.is_valid():
            # Filter by search query
            search_query = form.cleaned_data.get('search')
            if search_query:
                queryset = queryset.filter(
                    Q(title__icontains=search_query) | 
                    Q(description__icontains=search_query)
                )
            
            # Filter by status
            status = form.cleaned_data.get('status')
            if status:
                queryset = queryset.filter(status=status)
            
            # Filter by priority
            priority = form.cleaned_data.get('priority')
            if priority:
                queryset = queryset.filter(priority=priority)
            
            # Filter by project
            project = form.cleaned_data.get('project')
            if project:
                queryset = queryset.filter(project=project)
            
            # Filter by assignee
            assignee = form.cleaned_data.get('assignee')
            if assignee:
                queryset = queryset.filter(assignee=assignee)
            
            # Filter by due date range
            due_date_from = form.cleaned_data.get('due_date_from')
            if due_date_from:
                queryset = queryset.filter(due_date__gte=due_date_from)
            
            due_date_to = form.cleaned_data.get('due_date_to')
            if due_date_to:
                queryset = queryset.filter(due_date__lte=due_date_to)
            
            # Filter overdue tasks
            is_overdue = form.cleaned_data.get('is_overdue')
            if is_overdue:
                today = timezone.now().date()
                queryset = queryset.filter(
                    due_date__lt=today,
                    status__in=['not_started', 'in_progress', 'on_hold']
                )
        
        # Default sorting
        return queryset.select_related('project', 'assignee').order_by('-created_at')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['filter_form'] = TaskFilterForm(self.request.GET)
        
        # Add counts for different statuses
        context['not_started_count'] = Task.objects.filter(status='not_started').count()
        context['in_progress_count'] = Task.objects.filter(status='in_progress').count()
        context['on_hold_count'] = Task.objects.filter(status='on_hold').count()
        context['completed_count'] = Task.objects.filter(status='completed').count()
        
        # Add overdue tasks count
        today = timezone.now().date()
        context['overdue_count'] = Task.objects.filter(
            due_date__lt=today,
            status__in=['not_started', 'in_progress', 'on_hold']
        ).count()
        
        return context

class TaskDetailView(LoginRequiredMixin, DetailView):
    model = Task
    template_name = 'tasks/task_detail.html'
    context_object_name = 'task'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['comment_form'] = TaskCommentForm()
        context['attachment_form'] = TaskAttachmentForm()
        return context

class TaskCreateView(LoginRequiredMixin, CreateView):
    model = Task
    form_class = TaskForm
    template_name = 'tasks/task_form.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs
    
    def get_initial(self):
        initial = super().get_initial()
        # Pre-fill project if provided in URL
        project_id = self.request.GET.get('project')
        if project_id:
            initial['project'] = project_id
        return initial
    
    def get_success_url(self):
        if 'save_and_add' in self.request.POST:
            return reverse('task-create')
        return reverse('task-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Task created successfully.')
        return response

class TaskUpdateView(LoginRequiredMixin, UpdateView):
    model = Task
    form_class = TaskForm
    template_name = 'tasks/task_form.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['request'] = self.request
        return kwargs
    
    def get_success_url(self):
        return reverse('task-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Task updated successfully.')
        return response

class TaskDeleteView(LoginRequiredMixin, DeleteView):
    model = Task
    template_name = 'tasks/task_confirm_delete.html'
    success_url = reverse_lazy('task-list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Task deleted successfully.')
        return super().delete(request, *args, **kwargs)

@login_required
@require_POST
def add_task_comment(request, pk):
    task = get_object_or_404(Task, pk=pk)
    form = TaskCommentForm(request.POST, request.FILES)
    
    if form.is_valid():
        comment = form.save(commit=False)
        comment.task = task
        comment.author = request.user
        comment.save()
        
        messages.success(request, 'Comment added successfully.')
    else:
        messages.error(request, 'Error adding comment. Please try again.')
    
    return redirect('task-detail', pk=pk)

@login_required
@require_POST
def upload_task_attachments(request, pk):
    task = get_object_or_404(Task, pk=pk)
    form = TaskAttachmentForm(request.POST, request.FILES)
    
    if form.is_valid():
        files = request.FILES.getlist('files')
        for file in files:
            TaskAttachment.objects.create(
                task=task,
                file=file,
                uploaded_by=request.user
            )
        
        messages.success(request, f'{len(files)} file(s) uploaded successfully.')
    else:
        messages.error(request, 'Error uploading files. Please try again.')
    
    return redirect('task-detail', pk=pk)

@login_required
@require_POST
def delete_task_attachment(request, task_pk, attachment_pk):
    attachment = get_object_or_404(TaskAttachment, pk=attachment_pk, task_id=task_pk)
    
    # Optional permission check
    # if attachment.uploaded_by != request.user and not request.user.is_staff:
    #     messages.error(request, "You don't have permission to delete this file.")
    #     return redirect('task-detail', pk=task_pk)
    
    attachment.delete()
    messages.success(request, 'File deleted successfully.')
    return redirect('task-detail', pk=task_pk)

@login_required
@require_POST
def update_task_status(request, pk):
    task = get_object_or_404(Task, pk=pk)
    status = request.POST.get('status')
    
    if status and status in dict(Task.STATUS_CHOICES):
        task.status = status
        
        # If status is completed, set completion date
        if status == 'completed' and not task.completion_date:
            task.completion_date = timezone.now().date()
        
        task.save()
        
        return JsonResponse({
            'success': True,
            'status': status,
            'status_display': dict(Task.STATUS_CHOICES)[status],
            'completion_date': task.completion_date.strftime('%Y-%m-%d') if task.completion_date else None
        })
    
    return JsonResponse({'success': False, 'error': 'Invalid status'}, status=400)