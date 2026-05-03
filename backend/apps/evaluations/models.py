from django.db import models
from apps.users.models import CustomUser
from apps.placements.models import InternshipPlacement


class EvaluationCriteria(models.Model):

    name = models.CharField(max_length=100, unique=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name} ({self.weight}%)'

    class Meta:
        verbose_name_plural = 'Evaluation Criteria'


class Evaluation(models.Model):

    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='evaluations',
        limit_choices_to={'role': 'STUDENT'}
    )
    academic_supervisor = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='conducted_evaluations',
        limit_choices_to={'role': 'ACADEMIC_SUPERVISOR'}
    )
    placement = models.ForeignKey(
        InternshipPlacement,
        on_delete=models.CASCADE,
        related_name='evaluations'
    )
    scores = models.JSONField()
    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'placement')

    def save(self, *args, **kwargs):
        criteria = EvaluationCriteria.objects.filter(is_active=True)
        total = 0
        for criterion in criteria:
            score = float(self.scores.get(str(criterion.id), 0))
            weight = float(criterion.weight)
            total += score * (weight / 100)
        self.total_score = round(total, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.student} - Score: {self.total_score}'