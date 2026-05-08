from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, MedicamentoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'', MedicamentoViewSet)  # Base url para medicamentos

urlpatterns = [
    path('', include(router.urls)),
]
