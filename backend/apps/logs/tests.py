from django.test import TestCase
from django.utils import timezone
from apps.users.models import CustomUser
from apps.placements.models import InternshipPlacement
from apps.logs.models import WeeklyLog, LogStatusHistory
import datetime


class WeeklyLogModelTest(TestCase):

    def setUp(self):
        self.admin = CustomUser.objects.create_user(
            email='admin@test.com',
            password='pass1234',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        self.student = CustomUser.objects.create_user(
            email='student@test.com',
            password='pass1234',
            first_name='Test',
            last_name='Student',
            role='STUDENT'
        )
        self.supervisor = CustomUser.objects.create_user(
            email='supervisor@test.com',
            password='pass1234',
            first_name='Test',
            last_name='Supervisor',
            role='WORKPLACE_SUPERVISOR'
        )
        self.placement = InternshipPlacement.objects.create(
            student=self.student,
            workplace_supervisor=self.supervisor,
            company_name='Test Company',
            start_date=datetime.date(2026, 1, 1),
            end_date=datetime.date(2026, 12, 31),
            created_by=self.admin
        )
        self.log = WeeklyLog.objects.create(
            student=self.student,
            placement=self.placement,
            week_number=1,
            week_start_date=datetime.date(2026, 1, 6),
            activities='Worked on Django backend',
            learning_outcomes='Learned about models',
            challenges='Understanding ForeignKey',
            status=WeeklyLog.DRAFT,
            submission_deadline=timezone.now() + datetime.timedelta(days=7)
        )

    def test_log_created_with_draft_status(self):
        self.assertEqual(self.log.status, WeeklyLog.DRAFT)

    def test_log_belongs_to_student(self):
        self.assertEqual(self.log.student, self.student)

    def test_log_belongs_to_placement(self):
        self.assertEqual(self.log.placement, self.placement)

    def test_log_status_changes_to_submitted(self):
        self.log.status = WeeklyLog.PENDING_WORK_APPROVAL
        self.log.submitted_at = timezone.now()
        self.log.save()
        self.assertEqual(self.log.status, WeeklyLog.PENDING_WORK_APPROVAL)

    def test_log_status_history_is_recorded(self):
        LogStatusHistory.objects.create(
            log=self.log,
            changed_by=self.student,
            previous_status=WeeklyLog.DRAFT,
            new_status=WeeklyLog.PENDING_WORK_APPROVAL,
            comment='Submitted by student'
        )
        history = LogStatusHistory.objects.filter(log=self.log)
        self.assertEqual(history.count(), 1)
        self.assertEqual(history.first().previous_status, WeeklyLog.DRAFT)
        self.assertEqual(history.first().new_status, WeeklyLog.PENDING_WORK_APPROVAL)

    def test_log_str_representation(self):
        self.assertIn('Week 1', str(self.log))