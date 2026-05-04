from django.urls import path
from apps.placements.views import PlacementListCreateView, PlacementDetailView

urlpatterns = [
    path('', PlacementListCreateView.as_view(), name='placement-list'),
    path('<int:pk>/', PlacementDetailView.as_view(), name='placement-detail'),
]