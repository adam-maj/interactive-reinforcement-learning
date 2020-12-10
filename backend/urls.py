from rest_framework_jwt.views import obtain_jwt_token
from django.views.generic import TemplateView
from django.urls import path, include
from django.contrib import admin

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html')),
    path('admin/', admin.site.urls),
    path('token-auth/', obtain_jwt_token),
    path('authentication/', include('authentication.urls')),
    path('api/', include('api.urls')),
    # path('<str:path>', TemplateView.as_view(template_name='index.html')),
]
