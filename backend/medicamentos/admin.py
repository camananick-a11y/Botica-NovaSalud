from django.contrib import admin
from .models import Laboratorio, Categoria, Presentacion, Unidad, Medicamento, StockMedicamento

admin.site.register(Laboratorio)
admin.site.register(Categoria)
admin.site.register(Presentacion)
admin.site.register(Unidad)
admin.site.register(Medicamento)
admin.site.register(StockMedicamento)
