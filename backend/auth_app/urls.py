from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CargoViewSet, UsuarioViewSet

router = DefaultRouter()
router.register(r'cargos', CargoViewSet)
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
