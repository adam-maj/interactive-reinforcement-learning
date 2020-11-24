from django.urls import path, include
from api.views import *

urlpatterns = [
    path('train/', TrainModel.as_view()),
    path('run/', RunModel.as_view()),
]