from django.contrib import admin
from apps.evaluations.models import EvaluationCriteria, Evaluation

@admin.register(EvaluationCriteria)
class EvaluationCriteriaAdmin(admin.ModelAdmin):
    list_display = ['name', 'weight', 'is_active']
    list_filter = ['is_active']

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ['student', 'academic_supervisor', 'placement', 'total_score', 'submitted_at']
    readonly_fields = ['total_score', 'submitted_at']