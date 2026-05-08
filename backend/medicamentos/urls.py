from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LaboratorioViewSet, CategoriaViewSet, PresentacionViewSet, 
    UnidadViewSet, StockMedicamentoViewSet, MedicamentoViewSet
)

router = DefaultRouter()
router.register(r'laboratorios', LaboratorioViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'presentaciones', PresentacionViewSet)
router.register(r'unidades', UnidadViewSet)
router.register(r'stock', StockMedicamentoViewSet)
router.register(r'', MedicamentoViewSet)  # Base url para medicamentos

urlpatterns = [
    path('', include(router.urls)),
]
