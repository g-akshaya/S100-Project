# core/views.py
from rest_framework import status, viewsets, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated

# Import your models, serializers, and new permissions
from .models import (
    Patient, Doctor, EMR, Prescription, LabResult, Appointment, Message, HealthMetric
)
from .serializers import (
    PatientSerializer, DoctorSerializer, EMRSerializer, PrescriptionSerializer,
    LabResultSerializer, AppointmentSerializer, MessageSerializer, HealthMetricSerializer
)
from .permissions import IsPatientOwner, IsDoctorOrReadOnly, IsRelatedPatientOrDoctor

# --- Authentication and Profile Creation Views ---

class RegisterUserView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        # ... (This view remains the same as before)
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if not username or not email or not password:
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        return Response({"message": "User registered successfully. Please create your profile."}, status=status.HTTP_201_CREATED)

class PatientProfileCreateView(generics.CreateAPIView):
    """
    Endpoint for a newly registered user to create their Patient profile.
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Check if the user already has a patient or doctor profile
        if hasattr(self.request.user, 'patient') or hasattr(self.request.user, 'doctor'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("A profile already exists for this user.")
        # Link the new patient profile to the currently authenticated user
        serializer.save(user=self.request.user)

class DoctorProfileCreateView(generics.CreateAPIView):
    """
    Endpoint for a newly registered user to create their Doctor profile.
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated] # In a real app, this might be IsAdminUser

    def perform_create(self, serializer):
        # Check if the user already has a patient or doctor profile
        if hasattr(self.request.user, 'patient') or hasattr(self.request.user, 'doctor'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("A profile already exists for this user.")
        # Link the new doctor profile to the currently authenticated user
        serializer.save(user=self.request.user)


# --- Updated Model ViewSets with Logic and Permissions ---

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated, IsPatientOwner]

    def get_queryset(self):
        # A user can only see their own patient profile
        return Patient.objects.filter(user=self.request.user)

class DoctorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Doctors' profiles are read-only for patients.
    Only an admin could edit them (not implemented here for simplicity).
    """
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsRelatedPatientOrDoctor]

    def get_queryset(self):
        # Return appointments relevant to the logged-in user
        user = self.request.user
        if hasattr(user, 'patient'):
            return Appointment.objects.filter(patient=user.patient)
        if hasattr(user, 'doctor'):
            return Appointment.objects.filter(doctor=user.doctor)
        return Appointment.objects.none() # No profile, no appointments

    def perform_create(self, serializer):
        # When a patient creates an appointment, assign them automatically
        if hasattr(self.request.user, 'patient'):
            serializer.save(patient=self.request.user.patient)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only patients can create appointments.")

# Similar logic for EMRs, Prescriptions, etc.
class EMRViewSet(viewsets.ModelViewSet):
    serializer_class = EMRSerializer
    permission_classes = [IsAuthenticated, IsRelatedPatientOrDoctor]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'patient'):
            return EMR.objects.filter(patient=user.patient)
        if hasattr(user, 'doctor'):
            return EMR.objects.filter(doctor=user.doctor)
        return EMR.objects.none()

    def perform_create(self, serializer):
        # Only doctors can create EMRs
        if hasattr(self.request.user, 'doctor'):
            serializer.save(doctor=self.request.user.doctor)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only doctors can create EMRs.")

# ... And so on for other models ...
class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated, IsDoctorOrReadOnly] # Example: Patients can view, doctors can create

    def get_queryset(self):
        # Implement logic to get prescriptions for the user
        return Prescription.objects.all() # Placeholder - needs filtering logic like above

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see messages they sent or received
        user = self.request.user
        from django.db.models import Q
        return Message.objects.filter(Q(sender=user) | Q(receiver=user))

    def perform_create(self, serializer):
        # Set the sender to the current user automatically
        serializer.save(sender=self.request.user)

class HealthMetricViewSet(viewsets.ModelViewSet):
    serializer_class = HealthMetricSerializer
    permission_classes = [IsAuthenticated] # Needs custom permissions like IsRelatedPatientOrDoctor

    def get_queryset(self):
        # Implement filtering logic for patients/doctors
        return HealthMetric.objects.all() # Placeholder