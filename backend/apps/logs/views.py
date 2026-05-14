from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.logs.models import WeeklyLog, LogStatusHistory
from apps.logs.serializers import (
    WeeklyLogSerializer,
    LogSubmitSerializer,
    LogWorkApprovalSerializer,
    LogAcademicEvaluationSerializer,
    LogStatusHistorySerializer
)


class WeeklyLogListCreateView(APIView):

    def get(self, request):
        user = request.user

        if user.role == 'STUDENT':
            logs = WeeklyLog.objects.filter(student=user)

        elif user.role == 'WORKPLACE_SUPERVISOR':
            logs = WeeklyLog.objects.filter(
                placement__workplace_supervisor=user
            ).exclude(status=WeeklyLog.DRAFT)

        elif user.role == 'ACADEMIC_SUPERVISOR':
            logs = WeeklyLog.objects.filter(
                status__in=[
                    WeeklyLog.PENDING_ACADEMIC_EVALUATION,
                    WeeklyLog.COMPLETED
                ]
            )

        elif user.role == 'ADMIN':
            logs = WeeklyLog.objects.all().select_related(
                'student', 'placement'
            )

        else:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WeeklyLogSerializer(logs, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'STUDENT':
            return Response(
                {'error': 'Only students can create logs'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = WeeklyLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WeeklyLogDetailView(APIView):

    def get_object(self, pk):
        try:
            return WeeklyLog.objects.get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return None

    def get(self, request, pk):
        log = self.get_object(pk)
        if log is None:
            return Response(
                {'error': 'Log not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = WeeklyLogSerializer(log)
        return Response(serializer.data)

    def put(self, request, pk):
        log = self.get_object(pk)
        if log is None:
            return Response(
                {'error': 'Log not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        if request.user != log.student:
            return Response(
                {'error': 'You can only edit your own logs'},
                status=status.HTTP_403_FORBIDDEN
            )
        if log.status not in [WeeklyLog.DRAFT, WeeklyLog.RETURNED]:
            return Response(
                {'error': 'Only DRAFT or RETURNED logs can be edited'},
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = WeeklyLogSerializer(log, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WeeklyLogDeleteView(APIView):

    def delete(self, request, pk):
        try:
            log = WeeklyLog.objects.get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return Response(
                {'error': 'Log not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        if request.user != log.student:
            return Response(
                {'error': 'You can only delete your own logs'},
                status=status.HTTP_403_FORBIDDEN
            )
        if log.status != WeeklyLog.DRAFT:
            return Response(
                {'error': 'Only draft logs can be deleted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        log.delete()
        return Response(
            {'message': 'Log deleted'},
            status=status.HTTP_204_NO_CONTENT
        )


class LogSubmitView(APIView):

    def post(self, request, pk):
        try:
            log = WeeklyLog.objects.get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return Response(
                {'error': 'Log not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        if request.user != log.student:
            return Response(
                {'error': 'You can only submit your own logs'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LogSubmitSerializer(data={}, context={'log': log})
        if serializer.is_valid():
            previous_status = log.status
            is_resubmission = log.status == WeeklyLog.RETURNED

            if is_resubmission:
                log.status = WeeklyLog.RESUBMITTED
                log.resubmitted_at = timezone.now()
                comment = 'Log updated and resubmitted by student'
            else:
                log.status = WeeklyLog.PENDING_WORK_APPROVAL
                log.submitted_at = timezone.now()
                comment = 'Log submitted by student'

            log.save()

            LogStatusHistory.objects.create(
                log=log,
                changed_by=request.user,
                previous_status=previous_status,
                new_status=log.status,
                comment=comment
            )

            return Response({
                'message': 'Log resubmitted successfully.' if is_resubmission else 'Log submitted successfully.'
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogWorkApprovalView(APIView):

    def post(self, request, pk):
        if request.user.role != 'WORKPLACE_SUPERVISOR':
            return Response(
                {'error': 'Only workplace supervisors can review logs'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            log = WeeklyLog.objects.get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return Response(
                {'error': 'Log not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        if log.placement.workplace_supervisor != request.user:
            return Response(
                {'error': 'You can only review logs of your assigned students'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = LogWorkApprovalSerializer(
            data=request.data, context={'log': log}
        )
        if serializer.is_valid():
            action = serializer.validated_data['action']
            rating = serializer.validated_data.get('rating')
            feedback = serializer.validated_data.get('feedback', '')
            rejection_reason = serializer.validated_data.get('rejection_reason', '')
            previous_status = log.status

            if action == 'APPROVE':
                log.status = WeeklyLog.PENDING_ACADEMIC_EVALUATION
                log.supervisor_rating = rating
                log.supervisor_feedback = feedback
                log.supervisor_signed_off_at = timezone.now()
                comment = f'Approved — Rating: {rating}/5. {feedback}'
            else:
                log.status = WeeklyLog.RETURNED
                log.supervisor_rejection_reason = rejection_reason
                comment = f'Rejected — Reason: {rejection_reason}'

            log.save()

            LogStatusHistory.objects.create(
                log=log,
                changed_by=request.user,
                previous_status=previous_status,
                new_status=log.status,
                comment=comment
            )

            return Response({
                'message': 'Log approved and sent for academic evaluation.' if action == 'APPROVE' else 'Log rejected and returned to student.'
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogAcademicEvaluationView(APIView):

    def post(self, request, pk):
        if request.user.role not in ['ACADEMIC_SUPERVISOR', 'ADMIN']:
            return Response(
                {'error': 'Only academic supervisors can evaluate logs'},
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            log = WeeklyLog.objects.get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return Response(
                {'error': 'Log not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LogAcademicEvaluationSerializer(
            data=request.data, context={'log': log}
        )
        if serializer.is_valid():
            previous_status = log.status
            log.status = WeeklyLog.COMPLETED
            log.academic_grade = serializer.validated_data['grade']
            log.academic_comments = serializer.validated_data.get('comments', '')
            log.academic_evaluated_at = timezone.now()
            log.save()

            LogStatusHistory.objects.create(
                log=log,
                changed_by=request.user,
                previous_status=previous_status,
                new_status=log.status,
                comment=f'Grade: {log.academic_grade} | {log.academic_comments}'
            )

            return Response({'message': 'Log graded and completed.'})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogHistoryView(APIView):

    def get(self, request, pk):
        try:
            log = WeeklyLog.objects.get(pk=pk)
        except WeeklyLog.DoesNotExist:
            return Response(
                {'error': 'Log not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        history = LogStatusHistory.objects.filter(log=log).order_by('timestamp')
        serializer = LogStatusHistorySerializer(history, many=True)
        return Response(serializer.data)