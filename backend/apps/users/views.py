from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from apps.users.models import CustomUser
from apps.users.serializers import RegisterSerializer, UserSerializer
from apps.placements.models import InternshipPlacement
from apps.logs.models import WeeklyLog
from apps.evaluations.models import Evaluation


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email') or request.data.get('username')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_active:
            return Response(
                {'error': 'Account is deactivated'},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['username'] = user.email

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': f'{user.first_name} {user.last_name}',
                'role': user.role,
            }
        })


class RegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Only administrators can create accounts'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Only administrators can view all users'},
                status=status.HTTP_403_FORBIDDEN
            )

        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'ADMIN':
            data = {
                'total_students': CustomUser.objects.filter(role='STUDENT').count(),
                'total_placements': InternshipPlacement.objects.count(),
                'pending_reviews': WeeklyLog.objects.filter(status='SUBMITTED').count(),
                'completed_evaluations': Evaluation.objects.count(),
            }

        elif user.role == 'STUDENT':
            placement = InternshipPlacement.objects.filter(student=user).first()
            data = {
                'placement': placement.company_name if placement else None,
                'total_logs': WeeklyLog.objects.filter(student=user).count(),
                'pending_logs': WeeklyLog.objects.filter(student=user, status='DRAFT').count(),
                'approved_logs': WeeklyLog.objects.filter(student=user, status='APPROVED').count(),
                'evaluation': Evaluation.objects.filter(student=user).values('total_score').first(),
            }

        elif user.role == 'WORKPLACE_SUPERVISOR':
            data = {
                'total_interns': InternshipPlacement.objects.filter(workplace_supervisor=user).count(),
                'pending_reviews': WeeklyLog.objects.filter(
                    placement__workplace_supervisor=user,
                    status='SUBMITTED'
                ).count(),
                'approved_logs': WeeklyLog.objects.filter(
                    placement__workplace_supervisor=user,
                    status='APPROVED'
                ).count(),
            }

        elif user.role == 'ACADEMIC_SUPERVISOR':
            data = {
                'total_evaluations': Evaluation.objects.filter(academic_supervisor=user).count(),
            }

        else:
            return Response(
                {'error': 'Unknown role'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(data)

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Only admins can delete users'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response({'error': 'You cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)

        user.delete()
        return Response({'message': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)