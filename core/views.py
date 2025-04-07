from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from bookings.models import Booking
from vehicles.models import Vehicle
from providers.models import Provider
from django.utils import timezone

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'core/home.html')

@login_required
def dashboard(request):
    # Get user's vehicles
    vehicles = Vehicle.objects.filter(user=request.user)
    
    # Get upcoming bookings
    upcoming_bookings = Booking.objects.filter(
        user=request.user,
        booking_date__gte=timezone.now().date(),
        status__in=['pending', 'confirmed']
    ).order_by('booking_date', 'time_slot__start_time')[:3]
    
    # Get recent providers
    recent_providers = Provider.objects.filter(status='approved').order_by('-rating')[:3]
    
    context = {
        'vehicles': vehicles,
        'upcoming_bookings': upcoming_bookings,
        'recent_providers': recent_providers,
    }
    return render(request, 'core/dashboard.html', context)

def forgot_password(request):
    return render(request, 'core/forgot_password.html')

