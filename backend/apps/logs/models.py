from django.db import models
from apps.users.models import CustomUser
from apps.placements.models import InternshipPlacement


class WeeklyLog(models.Model):

    DRAFT = 'DRAFT'
    PENDING_WORK_APPROVAL = 'PENDING_WORK_APPROVAL'
    RETURNED = 'RETURNED'
    RESUBMITTED = 'RESUBMITTED'
    PENDING_ACADEMIC_EVALUATION = 'PENDING_ACADEMIC_EVALUATION'
    COMPLETED = 'COMPLETED'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (PENDING_WORK_APPROVAL, 'Pending Work Approval'),
        (RETURNED, 'Returned to Student'),
        (RESUBMITTED, 'Resubmitted by Student'),
        (PENDING_ACADEMIC_EVALUATION, 'Pending Academic Evaluation'),
        (COMPLETED, 'Completed'),
    ]

    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='logs',
        limit_choices_to={'role': 'STUDENT'}
    )
    placement = models.ForeignKey(
        InternshipPlacement,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    week_number = models.PositiveIntegerField()
    week_start_date = models.DateField(null=True, blank=True)
    activities = models.TextField()
    learning_outcomes = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    status = models.CharField(max_length=40, choices=STATUS_CHOICES, default=DRAFT)
    submission_deadline = models.DateTimeField()
    submitted_at = models.DateTimeField(null=True, blank=True)
    resubmitted_at = models.DateTimeField(null=True, blank=True)

    # Work supervisor feedback
    supervisor_rating = models.PositiveIntegerField(null=True, blank=True)
    supervisor_feedback = models.TextField(blank=True)
    supervisor_rejection_reason = models.TextField(blank=True)
    supervisor_signed_off_at = models.DateTimeField(null=True, blank=True)

    # Academic evaluation
    academic_grade = models.CharField(max_length=10, blank=True)
    academic_comments = models.TextField(blank=True)
    academic_evaluated_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.student} - Week {self.week_number} ({self.status})'


class LogStatusHistory(models.Model):
    log = models.ForeignKey(
        WeeklyLog,
        on_delete=models.CASCADE,
        related_name='history'
    )
    changed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    previous_status = models.CharField(max_length=40)
    new_status = models.CharField(max_length=40)
    comment = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.log}: {self.previous_status} -> {self.new_status}'