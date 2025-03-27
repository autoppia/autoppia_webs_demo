from django.db import models

from pythondjangocrud.apps.users.models import User


class Web2EventNames(models.TextChoices):
    LOGIN = "LOGIN", "User Login"
    LOGOUT = "LOGOUT", "User Logout"

    # Attendance Events
    ATTENDANCE_CREATE = "ATTENDANCE_CREATE", "Attendance Created"
    ATTENDANCE_UPDATE = "ATTENDANCE_UPDATE", "Attendance Updated"
    ATTENDANCE_DELETE = "ATTENDANCE_DELETE", "Attendance Deleted"

    # Department Events
    DEPARTMENT_CREATE = "DEPARTMENT_CREATE", "Department Created"
    DEPARTMENT_UPDATE = "DEPARTMENT_UPDATE", "Department Updated"
    DEPARTMENT_DELETE = "DEPARTMENT_DELETE", "Department Deleted"

    # Employee Events
    EMPLOYEE_CREATE = "EMPLOYEE_CREATE", "Employee Created"
    EMPLOYEE_UPDATE = "EMPLOYEE_UPDATE", "Employee Updated"
    EMPLOYEE_DELETE = "EMPLOYEE_DELETE", "Employee Deleted"

    # Payroll Events
    PAYROLL_CREATE = "PAYROLL_CREATE", "Payroll Created"
    PAYROLL_UPDATE = "PAYROLL_UPDATE", "Payroll Updated"
    PAYROLL_DELETE = "PAYROLL_DELETE", "Payroll Deleted"

    # Position Events
    POSITION_CREATE = "POSITION_CREATE", "Position Created"
    POSITION_UPDATE = "POSITION_UPDATE", "Position Updated"
    POSITION_DELETE = "POSITION_DELETE", "Position Deleted"

    # User Actions
    USER_VIEW = "USER_VIEW", "User View"
    USER_UPDATE = "USER_UPDATE", "User Updated"
    USER_REDIRECT = "USER_REDIRECT", "User Redirect"


class Event(models.Model):
    event_type = models.CharField(max_length=50, choices=Web2EventNames.choices)
    description = models.TextField()
    data = models.JSONField(blank=True, null=True)  # JSON field compatible con MySQL
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="events", blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    web_agent_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return (
            f"{self.event_type} at {self.created_at} for web_agent {self.web_agent_id}"
        )
