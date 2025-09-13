# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterUserView,
    PatientProfileCreateView,
    DoctorProfileCreateView,
    PatientViewSet,
    DoctorViewSet,
    EMRViewSet,
    PrescriptionViewSet,
    # LabResultViewSet, # Add back if you implement its logic
    AppointmentViewSet,
    MessageViewSet,
    HealthMetricViewSet
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'emrs', EMRViewSet, basename='emr')
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'healthmetrics', HealthMetricViewSet, basename='healthmetric')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    # Authentication and Profile Creation
    path('register/', RegisterUserView.as_view(), name='register'),
    path('profiles/patient/', PatientProfileCreateView.as_view(), name='create-patient-profile'),
    path('profiles/doctor/', DoctorProfileCreateView.as_view(), name='create-doctor-profile'),

    # Include the router-generated URLs
    path('', include(router.urls)),
]