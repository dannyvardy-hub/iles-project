from django.test import TestCase
from apps.users.models import CustomUser


class CustomUserModelTest(TestCase):

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

    def test_user_created_with_correct_role(self):
        self.assertEqual(self.admin.role, 'ADMIN')
        self.assertEqual(self.student.role, 'STUDENT')
        self.assertEqual(self.supervisor.role, 'WORKPLACE_SUPERVISOR')

    def test_user_is_active_by_default(self):
        self.assertTrue(self.admin.is_active)
        self.assertTrue(self.student.is_active)

    def test_email_is_unique(self):
        with self.assertRaises(Exception):
            CustomUser.objects.create_user(
                email='admin@test.com',
                password='pass1234',
                first_name='Duplicate',
                last_name='User',
                role='ADMIN'
            )

    def test_password_is_hashed(self):
        self.assertNotEqual(self.student.password, 'pass1234')
        self.assertTrue(self.student.password.startswith('pbkdf2'))

    def test_str_representation(self):
        self.assertIn('student@test.com', str(self.student))
        self.assertIn('STUDENT', str(self.student))