from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.placements.models import InternshipPlacement
from apps.placements.serializers import PlacementSerializer


class PlacementListCreateView(APIView):

    def get(self, request):
        user = request.user

        if user.role == 'ADMIN':
            placements = InternshipPlacement.objects.all()
        elif user.role == 'STUDENT':
            placements = InternshipPlacement.objects.filter(student=user)
        elif user.role == 'WORKPLACE_SUPERVISOR':
            placements = InternshipPlacement.objects.filter(
                workplace_supervisor=user
            )
<<<<<<< HEAD
        elif user.role == 'ACADEMIC_SUPERVISOR':
            placements = InternshipPlacement.objects.all()
=======
>>>>>>> 4e77d46 (feat: add placements API - list, create, detail endpoints)
        else:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PlacementSerializer(placements, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Only administrators can create placements'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PlacementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlacementDetailView(APIView):

    def get_object(self, pk):
        try:
            return InternshipPlacement.objects.get(pk=pk)
        except InternshipPlacement.DoesNotExist:
            return None

    def get(self, request, pk):
        placement = self.get_object(pk)
        if placement is None:
            return Response(
                {'error': 'Placement not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PlacementSerializer(placement)
        return Response(serializer.data)