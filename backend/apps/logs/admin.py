from django.contrib import admin
from apps.logs.models import WeeklyLog, LogStatusHistory

@admin.register(WeeklyLog)
class WeeklyLogAdmin(admin.ModelAdmin):
    list_display = ['student', 'week_number', 'status', 'submission_deadline', 'submitted_at']
    list_filter = ['status']
    search_fields = ['student__email']

@admin.register(LogStatusHistory)
class LogStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['log', 'changed_by', 'previous_status', 'new_status', 'timestamp']
    readonly_fields = ['log', 'changed_by', 'previous_status', 'new_status', 'comment', 'timestamp']