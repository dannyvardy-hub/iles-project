from django.contrib import admin
from apps.placements.models import InternshipPlacement

@admin.register(InternshipPlacement)
class InternshipPlacementAdmin(admin.ModelAdmin):
    list_display = ['student', 'company_name', 'workplace_supervisor', 'start_date', 'end_date']
    list_filter = ['company_name']
    search_fields = ['company_name', 'student__email']