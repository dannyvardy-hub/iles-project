from django.urls import path
from apps.logs.views import (
    WeeklyLogListCreateView,
    WeeklyLogDetailView,
    WeeklyLogDeleteView,
    LogSubmitView,
    LogWorkApprovalView,
    LogAcademicEvaluationView,
    LogHistoryView

    LogReviewView,
    LogFinalApproveView,
    LogHistoryView,
    WeeklyLogDeleteView
)

urlpatterns = [
    path('', WeeklyLogListCreateView.as_view(), name='log-list'),
    path('<int:pk>/', WeeklyLogDetailView.as_view(), name='log-detail'),
    path('<int:pk>/delete/', WeeklyLogDeleteView.as_view(), name='log-delete'),
    path('<int:pk>/submit/', LogSubmitView.as_view(), name='log-submit'),
    path('<int:pk>/work-approval/', LogWorkApprovalView.as_view(), name='log-work-approval'),
    path('<int:pk>/academic-evaluation/', LogAcademicEvaluationView.as_view(), name='log-academic-evaluation'),
    path('<int:pk>/history/', LogHistoryView.as_view(), name='log-history'),
    path('<int:pk>/delete/', WeeklyLogDeleteView.as_view(), name='log-delete'),
    path('<int:pk>/submit/', LogSubmitView.as_view(), name='log-submit'),
    path('<int:pk>/work-approval/', LogWorkApprovalView.as_view(), name='log-work-approval'),
    path('<int:pk>/academic-evaluation/', LogAcademicEvaluationView.as_view(), name='log-academic-evaluation'),
    path('<int:pk>/history/', LogHistoryView.as_view(), name='log-history'),
]