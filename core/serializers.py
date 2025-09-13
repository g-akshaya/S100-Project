# core/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Patient,
    Doctor,
    EMR,
    Prescription,
    LabResult,
    Appointment,
    Message,
    HealthMetric
)

# Serializer for the base User model (for context in other serializers)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# Model Serializers
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ('user',)

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ('user',)

class EMRSerializer(serializers.ModelSerializer):
    class Meta:
        model = EMR
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'

class LabResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabResult
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

class HealthMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthMetric
        fields = '__all__'