from django.contrib import admin
from .models import Categoria, Medicamento

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'created_at')
    search_fields = ('nombre',)


@admin.register(Medicamento)
class MedicamentoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo', 'categoria', 'precio_venta', 'stock', 'stock_minimo', 'activo')
    list_filter = ('categoria', 'activo', 'created_at')
    search_fields = ('nombre', 'codigo', 'principio_activo', 'laboratorio')
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'codigo', 'categoria', 'activo')
        }),
        ('Detalles del Medicamento', {
            'fields': ('principio_activo', 'concentracion', 'unidad_medida', 'laboratorio')
        }),
        ('Precios', {
            'fields': ('precio_costo', 'precio_venta')
        }),
        ('Stock', {
            'fields': ('stock', 'stock_minimo', 'lote', 'fecha_vencimiento')
        }),
        ('Descripción', {
            'fields': ('descripcion',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

