from django.test import TestCase
from apps.users.models import CustomUser
from apps.placements.models import InternshipPlacement
from apps.evaluations.models import EvaluationCriteria, Evaluation
import datetime


class EvaluationCriteriaTest(TestCase):

    def setUp(self):
        self.criteria1 = EvaluationCriteria.objects.create(
            name='Technical Skills',
            weight=40.00,
            description='Quality of technical work'
        )
        self.criteria2 = EvaluationCriteria.objects.create(
            name='Communication',
            weight=30.00,
            description='Communication skills'
        )
        self.criteria3 = EvaluationCriteria.objects.create(
            name='Professionalism',
            weight=30.00,
            description='Professional conduct'
        )

    def test_criteria_created_successfully(self):
        self.assertEqual(self.criteria1.name, 'Technical Skills')
        self.assertEqual(self.criteria1.weight, 40.00)

    def test_criteria_active_by_default(self):
        self.assertTrue(self.criteria1.is_active)
        self.assertTrue(self.criteria2.is_active)
        self.assertTrue(self.criteria3.is_active)

    def test_criteria_weights_sum_to_100(self):
        total = (
            self.criteria1.weight +
            self.criteria2.weight +
            self.criteria3.weight
        )
        self.assertEqual(total, 100.00)

    def test_criteria_str_representation(self):
        self.assertIn('Technical Skills', str(self.criteria1))


class EvaluationTest(TestCase):

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
        self.academic = CustomUser.objects.create_user(
            email='academic@test.com',
            password='pass1234',
            first_name='Test',
            last_name='Academic',
            role='ACADEMIC_SUPERVISOR'
        )
        self.placement = InternshipPlacement.objects.create(
            student=self.student,
            workplace_supervisor=self.supervisor,
            company_name='Test Company',
            start_date=datetime.date(2026, 1, 1),
            end_date=datetime.date(2026, 12, 31),
            created_by=self.admin
        )
        self.criteria1 = EvaluationCriteria.objects.create(
            name='Technical Skills',
            weight=40.00
        )
        self.criteria2 = EvaluationCriteria.objects.create(
            name='Communication',
            weight=30.00
        )
        self.criteria3 = EvaluationCriteria.objects.create(
            name='Professionalism',
            weight=30.00
        )

    def test_evaluation_score_computed_automatically(self):
        evaluation = Evaluation.objects.create(
            student=self.student,
            academic_supervisor=self.academic,
            placement=self.placement,
            scores={
                str(self.criteria1.id): 80,
                str(self.criteria2.id): 70,
                str(self.criteria3.id): 75
            },
            notes='Good student'
        )
        expected_score = (80 * 0.4) + (70 * 0.3) + (75 * 0.3)
        self.assertEqual(float(evaluation.total_score), expected_score)

    def test_evaluation_belongs_to_student(self):
        evaluation = Evaluation.objects.create(
            student=self.student,
            academic_supervisor=self.academic,
            placement=self.placement,
            scores={
                str(self.criteria1.id): 80,
                str(self.criteria2.id): 70,
                str(self.criteria3.id): 75
            }
        )
        self.assertEqual(evaluation.student, self.student)

    def test_duplicate_evaluation_prevented(self):
        Evaluation.objects.create(
            student=self.student,
            academic_supervisor=self.academic,
            placement=self.placement,
            scores={
                str(self.criteria1.id): 80,
                str(self.criteria2.id): 70,
                str(self.criteria3.id): 75
            }
        )
        with self.assertRaises(Exception):
            Evaluation.objects.create(
                student=self.student,
                academic_supervisor=self.academic,
                placement=self.placement,
                scores={
                    str(self.criteria1.id): 90,
                    str(self.criteria2.id): 80,
                    str(self.criteria3.id): 85
                }
            )